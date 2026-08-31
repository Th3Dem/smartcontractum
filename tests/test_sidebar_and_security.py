#!/usr/bin/env python3
"""
SmartContractum — Автоматические тесты бокового меню, раздела «Основные» (с блогом) и раздела «Безопасность» (со сменой пароля) (TASK-05)
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

TEST_PORT = 3097

class TestSidebarAndSecurity(unittest.TestCase):
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

    def test_01_db_blog_title_and_change_password(self):
        """Проверка добавления названия блога и функции смены пароля в db.py"""
        ts = int(time.time())
        email = f"blog_user_{ts}@test.ru"
        old_pwd = "InitialPassword123!"

        user = db.create_user({
            "email": email,
            "password": old_pwd,
            "accountType": "individual",
            "lastName": "Семенов",
            "firstName": "Сергей",
            "phone": "+7 (999) 777-66-55"
        })
        user_id = user["id"]

        # 1. Обновление названия блога
        blog_name = "Юридические аспекты Web3 и DeFi в РФ"
        success, err, updated = db.update_user_profile(user_id, {
            "blogTitle": blog_name
        })
        self.assertTrue(success)
        self.assertEqual(updated.get("blog_title"), blog_name)

        # 2. Попытка смены пароля с неверным текущим паролем
        res_wrong, err_wrong = db.change_user_password(user_id, "WrongOldPassword", "NewValidPassword2026!")
        self.assertFalse(res_wrong)
        self.assertIn("Неверно указан текущий пароль", err_wrong)

        # 3. Попытка смены пароля на короткий
        res_short, err_short = db.change_user_password(user_id, old_pwd, "short")
        self.assertFalse(res_short)
        self.assertIn("не менее 8 символов", err_short)

        # 4. Успешная смена пароля
        new_pwd = "NewValidPassword2026!"
        res_ok, err_ok = db.change_user_password(user_id, old_pwd, new_pwd)
        self.assertTrue(res_ok)
        self.assertEqual(err_ok, "Пароль успешно изменен")

        # 5. Проверка входа с новым паролем
        auth_user = db.authenticate_user(email, new_pwd)
        self.assertIsNotNone(auth_user)
        self.assertEqual(auth_user["id"], user_id)

    def test_02_api_change_password_and_blog_title(self):
        """Интеграционная проверка REST API POST /api/user/change-password и обновления блога"""
        ts = int(time.time())
        email = f"api_sec_{ts}@test.ru"
        init_pwd = "InitialSecPassword123!"

        user = db.create_user({
            "email": email,
            "password": init_pwd,
            "accountType": "individual",
            "lastName": "Васильев",
            "firstName": "Игорь",
            "phone": "+7 (912) 345-67-89"
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

        # 1. Запрос без авторизации -> 401
        st_unauth, res_unauth = send_req("/api/user/change-password", {
            "currentPassword": init_pwd,
            "newPassword": "BrandNewPassword2026!"
        }, None)
        self.assertEqual(st_unauth, 401)

        # 2. Запрос с неверным текущим паролем -> 400
        st_bad, res_bad = send_req("/api/user/change-password", {
            "currentPassword": "IncorrectPassword123!",
            "newPassword": "BrandNewPassword2026!"
        }, token)
        self.assertEqual(st_bad, 400)
        self.assertFalse(res_bad.get("success"))

        # 3. Успешная смена пароля через API -> 200
        st_ok, res_ok = send_req("/api/user/change-password", {
            "currentPassword": init_pwd,
            "newPassword": "BrandNewPassword2026!"
        }, token)
        self.assertEqual(st_ok, 200)
        self.assertTrue(res_ok.get("success"))

        # 4. Обновление названия блога через POST /api/user/update-profile
        st_prof, res_prof = send_req("/api/user/update-profile", {
            "blogTitle": "Право и Криптоактивы"
        }, token)
        self.assertEqual(st_prof, 200)
        self.assertEqual(res_prof["user"].get("blog_title"), "Право и Криптоактивы")

    def test_03_dashboard_html_and_js_sidebar_elements(self):
        """Проверка разметки бокового меню, разделов и логики переключения"""
        pub_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

        with open(os.path.join(pub_dir, "dashboard.html"), "r", encoding="utf-8") as f:
            html = f.read()

        self.assertIn('class="dash-sidebar"', html)
        self.assertIn('id="nav-item-general"', html)
        self.assertIn('id="nav-item-security"', html)
        self.assertIn('id="section-general"', html)
        self.assertIn('id="section-security"', html)
        self.assertIn('id="btn-init-pwd-change"', html)
        self.assertIn('id="new-password"', html)
        self.assertIn('id="confirm-new-password"', html)

        with open(os.path.join(pub_dir, "dashboard.js"), "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn('switchSection', js)
        self.assertIn('calcPasswordStrength', js)
        self.assertIn('renderDetailRow', js)



if __name__ == "__main__":
    unittest.main()
