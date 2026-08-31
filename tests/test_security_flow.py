#!/usr/bin/env python3
"""
SmartContractum — Автоматические тесты двухфакторной смены пароля в Личном кабинете (TASK-07)
"""

import unittest
import os
import json
import time
import urllib.request
import urllib.parse
from http.server import ThreadingHTTPServer
import threading

import db
import server

TEST_PORT = 3097

class TestSecurityFlow(unittest.TestCase):
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

    def test_01_request_password_change(self):
        """Проверка эндпоинта POST /api/security/request-password-change"""
        ts = int(time.time())
        email = f"sec_user_{ts}@test.ru"
        user = db.create_user({
            "email": email,
            "password": "OldPassword123!",
            "accountType": "individual",
            "lastName": "Смирнов",
            "firstName": "Алексей"
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

        # 1. Без авторизации -> 401
        st1, res1 = send_req("/api/security/request-password-change", {}, None)
        self.assertEqual(st1, 401)

        # 2. С валидным токеном -> 200, сессия создана
        st2, res2 = send_req("/api/security/request-password-change", {}, token)
        self.assertEqual(st2, 200)
        self.assertTrue(res2.get("success"))
        self.assertEqual(res2.get("email"), email)
        self.assertIn(user["id"], server.SECURITY_PASSWORD_RESET_SESSIONS)

    def test_02_full_security_password_change_flow(self):
        """Сквозное тестирование 3-шагового процесса смены пароля"""
        ts = int(time.time())
        email = f"sec_flow_{ts}@test.ru"
        old_pwd = "OldPassword999!"
        new_pwd = "SuperSecretNewPwd2026!"

        user = db.create_user({
            "email": email,
            "password": old_pwd,
            "accountType": "individual",
            "lastName": "Волков",
            "firstName": "Сергей"
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

        # ШАГ 1: Запрос кода
        st1, res1 = send_req("/api/security/request-password-change", {}, token)
        self.assertEqual(st1, 200)
        code = server.SECURITY_PASSWORD_RESET_SESSIONS[user["id"]]["code"]
        self.assertEqual(len(code), 6)

        # ШАГ 2: Проверка неверного кода -> 400
        st_bad_code, res_bad_code = send_req("/api/security/verify-password-code", {"code": "000000"}, token)
        self.assertEqual(st_bad_code, 400)
        self.assertFalse(res_bad_code.get("success"))

        # ШАГ 2: Проверка верного кода -> 200 + changeToken
        st2, res2 = send_req("/api/security/verify-password-code", {"code": code}, token)
        self.assertEqual(st2, 200)
        self.assertTrue(res2.get("verified"))
        change_token = res2.get("changeToken")
        self.assertIsNotNone(change_token)
        self.assertEqual(len(change_token), 64)

        # ШАГ 3: Попытка с коротким паролем -> 400
        st_short, res_short = send_req("/api/security/change-password-verified", {
            "changeToken": change_token,
            "newPassword": "123"
        }, token)
        self.assertEqual(st_short, 400)

        # ШАГ 3: Успешная смена пароля -> 200
        st3, res3 = send_req("/api/security/change-password-verified", {
            "changeToken": change_token,
            "newPassword": new_pwd
        }, token)
        self.assertEqual(st3, 200)
        self.assertTrue(res3.get("success"))

        # Проверка авторизации в БД: старый пароль не подходит, новый подходит
        auth_old = db.authenticate_user(email, old_pwd)
        self.assertIsNone(auth_old)

        auth_new = db.authenticate_user(email, new_pwd)
        self.assertIsNotNone(auth_new)
        self.assertEqual(auth_new["email"], email)

    def test_03_dashboard_html_and_js_elements(self):
        """Проверка разметки мастера и скриптов в public/"""
        pub_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

        with open(os.path.join(pub_dir, "dashboard.html"), "r", encoding="utf-8") as f:
            html = f.read()

        self.assertIn('id="sec-step-init"', html)
        self.assertIn('id="sec-step-code"', html)
        self.assertIn('id="sec-step-newpwd"', html)
        self.assertIn('id="btn-init-pwd-change"', html)
        self.assertIn('id="sec-code-input"', html)
        self.assertIn('id="btn-verify-sec-code"', html)
        self.assertIn('id="btn-resend-sec-code"', html)
        self.assertIn('id="form-sec-new-password"', html)
        self.assertIn('class="strength-meter"', html)
        self.assertIn('class="strength-bar-track"', html)
        self.assertIn('id="new-pwd-strength-fill"', html)
        self.assertIn('id="new-pwd-strength-label"', html)
        self.assertIn('class="input-wrapper"', html)
        self.assertIn('class="input-suffix-btn btn-toggle-pwd"', html)

        with open(os.path.join(pub_dir, "dashboard.js"), "r", encoding="utf-8") as f:

            js = f.read()

        self.assertIn('resetSecurityWizard', js)
        self.assertIn('/api/security/request-password-change', js)
        self.assertIn('/api/security/verify-password-code', js)
        self.assertIn('/api/security/change-password-verified', js)
        self.assertIn('startResendTimer', js)
        self.assertIn('calcPasswordStrength', js)


if __name__ == "__main__":
    unittest.main()
