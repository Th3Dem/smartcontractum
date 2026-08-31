#!/usr/bin/env python3
"""
SmartContractum — Автоматические тесты построчного редактирования параметров в Личном кабинете (TASK-06)
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

TEST_PORT = 3096

class TestInlineEditing(unittest.TestCase):
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

    def test_01_db_partial_updates(self):
        """Проверка точечного атомарного обновления отдельных параметров в db.py"""
        ts = int(time.time())
        email = f"inline_user_{ts}@test.ru"

        user = db.create_user({
            "email": email,
            "password": "Password123!",
            "accountType": "individual",
            "lastName": "Петров",
            "firstName": "Петр",
            "middleName": "Петрович",
            "phone": "+7 (999) 111-22-33"
        })
        user_id = user["id"]

        # 1. Обновление только Имени
        s1, e1, u1 = db.update_user_profile(user_id, {"firstName": "Александр"})
        self.assertTrue(s1)
        self.assertEqual(u1["first_name"], "Александр")
        self.assertEqual(u1["last_name"], "Петров")
        self.assertEqual(u1["email"], email)

        # 2. Обновление только Названия блога
        s2, e2, u2 = db.update_user_profile(user_id, {"blogTitle": "Мой блокчейн дневник"})
        self.assertTrue(s2)
        self.assertEqual(u2["blog_title"], "Мой блокчейн дневник")
        self.assertEqual(u2["first_name"], "Александр")
        self.assertEqual(u2["last_name"], "Петров")

        # 3. Обновление только Телефона
        s3, e3, u3 = db.update_user_profile(user_id, {"phone": "+7 (911) 555-00-11"})
        self.assertTrue(s3)
        self.assertEqual(u3["phone"], "+7 (911) 555-00-11")
        self.assertEqual(u3["blog_title"], "Мой блокчейн дневник")

    def test_02_api_partial_updates(self):
        """Интеграционная проверка REST API точечных обновлений через POST /api/user/update-profile"""
        ts = int(time.time())
        email = f"api_inline_{ts}@test.ru"

        user = db.create_user({
            "email": email,
            "password": "Password123!",
            "accountType": "individual",
            "lastName": "Сидоров",
            "firstName": "Олег",
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

        # Точечное обновление фамилии через API
        st, res = send_req("/api/user/update-profile", {"lastName": "Сидоров-Казанцев"}, token)
        self.assertEqual(st, 200)
        self.assertTrue(res["success"])
        self.assertEqual(res["user"]["last_name"], "Сидоров-Казанцев")
        self.assertEqual(res["user"]["first_name"], "Олег")

        # Точечное обновление блога через API
        st_b, res_b = send_req("/api/user/update-profile", {"blogTitle": "Смарт-контракты в РФ"}, token)
        self.assertEqual(st_b, 200)
        self.assertEqual(res_b["user"]["blog_title"], "Смарт-контракты в РФ")

    def test_03_dashboard_html_and_js_inline_editing(self):
        """Проверка разметки и скриптов: отсутствие общей кнопки и присутствие логики инлайн-редактирования"""
        pub_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

        with open(os.path.join(pub_dir, "dashboard.html"), "r", encoding="utf-8") as f:
            html = f.read()

        self.assertNotIn('id="btn-open-edit-profile"', html)
        self.assertNotIn('id="modal-edit-profile"', html)

        with open(os.path.join(pub_dir, "dashboard.js"), "r", encoding="utf-8") as f:
            js = f.read()

        self.assertIn('renderDetailRow', js)
        self.assertIn('btn-row-edit', js)
        self.assertIn('openRowEditor', js)
        self.assertIn('submitRowEditor', js)
        self.assertIn('btn-inline-save', js)
        self.assertIn('btn-inline-cancel', js)

if __name__ == "__main__":
    unittest.main()
