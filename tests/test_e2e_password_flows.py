#!/usr/bin/env python3
"""
SmartContractum — Комплексный E2E тест сброса и изменения паролей с проверкой базы данных (TASK-10)
"""

import unittest
import os
import json
import time
import urllib.request
import urllib.parse
from http.server import ThreadingHTTPServer
import threading
import sqlite3

import db
import server

TEST_PORT = 3096

class TestE2EPasswordFlows(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", TEST_PORT), server.SmartContractumHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def send_http(self, path, payload=None, auth_token=None):
        base_url = f"http://127.0.0.1:{TEST_PORT}"
        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        data_bytes = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(f"{base_url}{path}", data=data_bytes, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8"))

    def get_user_db_record(self, user_id):
        conn = db.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, password_hash, password_salt FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def test_01_forgot_password_e2e_flow_and_db_audit(self):
        """Сценарий 1: Сброс пароля на экране входа с аудитом SQLite и проверкой логина"""
        ts = int(time.time())
        email = f"e2e_reset_{ts}@test.ru"
        pwd_v1 = "InitialPassword_V1!2026"
        pwd_v2 = "ResetPassword_V2!2026"

        # 1. Регистрация пользователя в БД
        user = db.create_user({
            "email": email,
            "password": pwd_v1,
            "accountType": "individual",
            "lastName": "Петров",
            "firstName": "Иван"
        })
        user_id = user["id"]

        # Фиксируем исходный хеш и соль в БД
        db_before = self.get_user_db_record(user_id)
        self.assertIsNotNone(db_before)
        hash_v1 = db_before["password_hash"]
        salt_v1 = db_before["password_salt"]

        # 2. Запрос на сброс пароля (POST /api/auth/forgot-password)
        st1, res1 = self.send_http("/api/auth/forgot-password", {"email": email})
        self.assertEqual(st1, 200)
        self.assertTrue(res1.get("success"))
        self.assertIn(email, server.PASSWORD_RESET_SESSIONS)
        code = server.PASSWORD_RESET_SESSIONS[email]["code"]
        self.assertEqual(len(code), 6)

        # 3. Подтверждение кода (POST /api/auth/forgot-verify-code)
        st2, res2 = self.send_http("/api/auth/forgot-verify-code", {"email": email, "code": code})
        self.assertEqual(st2, 200)
        self.assertTrue(res2.get("verified"))
        reset_token = res2.get("resetToken")
        self.assertIsNotNone(reset_token)
        self.assertEqual(len(reset_token), 64)

        # 4. Установка нового пароля pwd_v2 (POST /api/auth/forgot-reset-password)
        st3, res3 = self.send_http("/api/auth/forgot-reset-password", {
            "email": email,
            "resetToken": reset_token,
            "newPassword": pwd_v2
        })
        self.assertEqual(st3, 200)
        self.assertTrue(res3.get("success"))

        # 5. Прямой аудит БД: убеждаемся, что хеш и соль обновились
        db_after = self.get_user_db_record(user_id)
        self.assertIsNotNone(db_after)
        hash_v2 = db_after["password_hash"]
        salt_v2 = db_after["password_salt"]
        self.assertNotEqual(hash_v1, hash_v2)
        self.assertNotEqual(salt_v1, salt_v2)

        # 6. Проверка авторизации: старый пароль pwd_v1 ОТКЛОНЯЕТСЯ
        st_fail, res_fail = self.send_http("/api/auth/login", {"email": email, "password": pwd_v1})
        self.assertEqual(st_fail, 200)
        self.assertFalse(res_fail.get("success"))
        self.assertIn("Неверный", res_fail.get("error", ""))

        # 7. Проверка авторизации: новый пароль pwd_v2 УСПЕШНО ЛОГИНИТСЯ
        st_ok, res_ok = self.send_http("/api/auth/login", {"email": email, "password": pwd_v2})
        self.assertEqual(st_ok, 200)
        self.assertTrue(res_ok.get("success"))
        self.assertIsNotNone(res_ok.get("token"))
        self.assertEqual(res_ok["user"]["email"], email)

        # 8. Защита от повторного использования токена (Replay Attack)
        st_replay, res_replay = self.send_http("/api/auth/forgot-reset-password", {
            "email": email,
            "resetToken": reset_token,
            "newPassword": "AnotherPassword!"
        })
        self.assertEqual(st_replay, 200)
        self.assertFalse(res_replay.get("success"))

    def test_02_security_tab_change_password_e2e_and_db_audit(self):
        """Сценарий 2: Двухфакторная смена пароля в Личном кабинете с аудитом SQLite и проверкой логина"""
        ts = int(time.time())
        email = f"e2e_sec_{ts}@test.ru"
        pwd_v1 = "SecurityOld_Pwd1!2026"
        pwd_v2 = "SecurityNew_Pwd2!2026"

        # 1. Создание пользователя и авторизация
        user = db.create_user({
            "email": email,
            "password": pwd_v1,
            "accountType": "individual",
            "lastName": "Кузнецов",
            "firstName": "Дмитрий"
        })
        user_id = user["id"]

        # Получаем сессионный токен
        st_login, res_login = self.send_http("/api/auth/login", {"email": email, "password": pwd_v1})
        self.assertEqual(st_login, 200)
        auth_token = res_login["token"]

        # Фиксируем исходный хеш в БД
        db_before = self.get_user_db_record(user_id)
        hash_v1 = db_before["password_hash"]

        # 2. ШАГ 1: Запрос кода смены пароля (POST /api/security/request-password-change)
        st1, res1 = self.send_http("/api/security/request-password-change", {}, auth_token)
        self.assertEqual(st1, 200)
        self.assertTrue(res1.get("success"))
        self.assertIn(user_id, server.SECURITY_PASSWORD_RESET_SESSIONS)
        code = server.SECURITY_PASSWORD_RESET_SESSIONS[user_id]["code"]
        self.assertEqual(len(code), 6)

        # 3. ШАГ 2: Проверка 6-значного кода (POST /api/security/verify-password-code)
        st2, res2 = self.send_http("/api/security/verify-password-code", {"code": code}, auth_token)
        self.assertEqual(st2, 200)
        self.assertTrue(res2.get("verified"))
        change_token = res2.get("changeToken")
        self.assertIsNotNone(change_token)
        self.assertEqual(len(change_token), 64)

        # 4. ШАГ 3: Установка нового пароля pwd_v2 (POST /api/security/change-password-verified)
        st3, res3 = self.send_http("/api/security/change-password-verified", {
            "changeToken": change_token,
            "newPassword": pwd_v2
        }, auth_token)
        self.assertEqual(st3, 200)
        self.assertTrue(res3.get("success"))

        # 5. Прямой аудит БД: проверяем обновление хеша
        db_after = self.get_user_db_record(user_id)
        hash_v2 = db_after["password_hash"]
        self.assertNotEqual(hash_v1, hash_v2)

        # 6. Проверка авторизации: старый пароль pwd_v1 ОТКЛОНЯЕТСЯ
        st_fail, res_fail = self.send_http("/api/auth/login", {"email": email, "password": pwd_v1})
        self.assertEqual(st_fail, 200)
        self.assertFalse(res_fail.get("success"))

        # 7. Проверка авторизации: новый пароль pwd_v2 УСПЕШНО АВТОРИЗУЕТСЯ
        st_ok, res_ok = self.send_http("/api/auth/login", {"email": email, "password": pwd_v2})
        self.assertEqual(st_ok, 200)
        self.assertTrue(res_ok.get("success"))
        self.assertIsNotNone(res_ok.get("token"))
        self.assertEqual(res_ok["user"]["email"], email)

        # 8. Защита от повторного использования changeToken
        st_replay, res_replay = self.send_http("/api/security/change-password-verified", {
            "changeToken": change_token,
            "newPassword": "YetAnotherPassword!"
        }, auth_token)
        self.assertEqual(st_replay, 400)
        self.assertFalse(res_replay.get("success"))

if __name__ == "__main__":
    unittest.main()
