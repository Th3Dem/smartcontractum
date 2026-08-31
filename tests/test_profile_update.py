#!/usr/bin/env python3
"""
SmartContractum — Автоматические тесты обновления профиля в Личном кабинете (TASK-04)
Проверка db.update_user_profile, эндпоинта POST /api/user/update-profile, авторизации по Bearer-токену, коллизий E-mail и отсутствия устаревших надписей.
"""

import unittest
import os
import json
import time
import urllib.request
import urllib.parse
from http.server import HTTPServer
import threading

import db
import server

TEST_PORT = 3098

class TestProfileUpdate(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()
        cls.httpd = HTTPServer(("127.0.0.1", TEST_PORT), server.SmartContractumHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def test_01_db_update_user_profile(self):
        """Проверка update_user_profile в db.py: обновление данных и защита от дубликатов email"""
        ts = int(time.time())
        email1 = f"user1_{ts}@test.ru"
        email2 = f"user2_{ts}@test.ru"

        u1 = db.create_user({
            "email": email1,
            "password": "Password123!",
            "accountType": "individual",
            "lastName": "Иванов",
            "firstName": "Иван",
            "phone": "+7 (999) 111-22-33"
        })
        u2 = db.create_user({
            "email": email2,
            "password": "Password123!",
            "accountType": "individual",
            "lastName": "Смирнов",
            "firstName": "Алексей",
            "phone": "+7 (999) 444-55-66"
        })

        # 1. Успешное обновление пользователя 1
        new_email1 = f"user1_updated_{ts}@test.ru"
        success, err, updated = db.update_user_profile(u1["id"], {
            "lastName": "Иванов-Петров",
            "firstName": "Иван",
            "middleName": "Сергеевич",
            "phone": "+7 (999) 888-77-66",
            "email": new_email1
        })
        self.assertTrue(success)
        self.assertIsNone(err)
        self.assertEqual(updated["last_name"], "Иванов-Петров")
        self.assertEqual(updated["middle_name"], "Сергеевич")
        self.assertEqual(updated["email"], new_email1)
        self.assertEqual(updated["displayName"], "Иванов-Петров Иван Сергеевич")

        # 2. Попытка смены email на уже занятый пользователем 2
        success2, err2, updated2 = db.update_user_profile(u1["id"], {
            "email": email2
        })
        self.assertFalse(success2)
        self.assertIn("уже зарегистрирован", err2)
        self.assertIsNone(updated2)

    def test_02_api_update_profile_endpoint(self):
        """Интеграционная проверка эндпоинта POST /api/user/update-profile"""
        ts = int(time.time())
        email = f"api_user_{ts}@test.ru"
        pwd = "SecretPass123!"

        user = db.create_user({
            "email": email,
            "password": pwd,
            "accountType": "individual",
            "lastName": "Кузнецов",
            "firstName": "Дмитрий",
            "phone": "+7 (900) 123-45-67"
        })
        token = db.create_session(user["id"])

        base_url = f"http://127.0.0.1:{TEST_PORT}"

        def send_req(path, payload, auth_token=None):
            headers = {"Content-Type": "application/json"}
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            req = urllib.request.Request(
                f"{base_url}{path}",
                data=json.dumps(payload).encode("utf-8") if payload is not None else None,
                headers=headers
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    return resp.status, json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                return e.code, json.loads(e.read().decode("utf-8"))

        # 1. Запрос без токена -> 401
        status_unauth, res_unauth = send_req("/api/user/update-profile", {"lastName": "Test"}, None)
        self.assertEqual(status_unauth, 401)
        self.assertFalse(res_unauth.get("success"))

        # 2. Успешный запрос с токеном -> 200
        new_email = f"kuznetsov_new_{ts}@test.ru"
        status_ok, res_ok = send_req("/api/user/update-profile", {
            "lastName": "Кузнецов-Орлов",
            "firstName": "Дмитрий",
            "middleName": "Владимирович",
            "phone": "+7 (911) 987-65-43",
            "email": new_email
        }, token)

        self.assertEqual(status_ok, 200)
        self.assertTrue(res_ok.get("success"))
        updated_user = res_ok.get("user")
        self.assertEqual(updated_user["last_name"], "Кузнецов-Орлов")
        self.assertEqual(updated_user["email"], new_email)

        # 3. Проверка через /api/auth/me
        req_me = urllib.request.Request(
            f"{base_url}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req_me) as resp:
            data_me = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data_me.get("success"))
            self.assertEqual(data_me["user"]["displayName"], "Кузнецов-Орлов Дмитрий Владимирович")

    def test_03_dashboard_html_and_js_elements(self):
        """Проверка разметки и скриптов профиля: отсутствие устаревшей плашки статуса и наличие инлайн-редактирования"""
        pub_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
        
        with open(os.path.join(pub_dir, "dashboard.html"), "r", encoding="utf-8") as f:
            html = f.read()

        self.assertIn('id="prof-details-list"', html)
        self.assertIn('id="section-general"', html)

        with open(os.path.join(pub_dir, "dashboard.js"), "r", encoding="utf-8") as f:
            js = f.read()

        # Проверка удаления надписи о статусе
        self.assertNotIn('Статус учетной записи: ✓ E-mail подтвержден (Активен)', js)
        self.assertNotIn('E-mail подтвержден (Активен)', js)
        # Проверка наличия инлайн-редактирования
        self.assertIn('renderDetailRow', js)
        self.assertIn('btn-row-edit', js)


if __name__ == "__main__":
    unittest.main()
