import re
import os
import json
import unittest
import urllib.request
import db
from server import query_egrul_nalog_ru, validate_inn_checksum

class TestAuthFrontend(unittest.TestCase):
    def setUp(self):
        self.project_root = "/home/dem/Projects_01"
        self.html_path = os.path.join(self.project_root, "public/index.html")
        self.dash_html_path = os.path.join(self.project_root, "public/dashboard.html")
        self.css_path = os.path.join(self.project_root, "public/styles.css")
        self.js_path = os.path.join(self.project_root, "public/app.js")
        self.server_path = os.path.join(self.project_root, "server.py")
        self.db_path = os.path.join(self.project_root, "db.py")

    def test_files_exist(self):
        self.assertTrue(os.path.exists(self.html_path), "index.html must exist")
        self.assertTrue(os.path.exists(self.dash_html_path), "dashboard.html must exist")
        self.assertTrue(os.path.exists(self.css_path), "styles.css must exist")
        self.assertTrue(os.path.exists(self.js_path), "app.js must exist")
        self.assertTrue(os.path.exists(self.server_path), "server.py must exist")
        self.assertTrue(os.path.exists(self.db_path), "db.py must exist")

    def test_inn_checksum_validator(self):
        self.assertTrue(validate_inn_checksum("7707083893")) # Сбербанк (10 цифр)
        self.assertTrue(validate_inn_checksum("7736207543")) # Яндекс (10 цифр)
        self.assertFalse(validate_inn_checksum("7707083894")) # Неверная контрольная сумма
        self.assertFalse(validate_inn_checksum("1234567890")) # Неверная контрольная сумма

    def test_password_hashing_pbkdf2(self):
        pwd = "SecretPassword123!"
        hash1, salt1 = db.hash_password(pwd)
        self.assertEqual(len(salt1), 32) # 16 байт в hex
        self.assertTrue(db.verify_password(pwd, hash1, salt1))
        self.assertFalse(db.verify_password("WrongPassword!", hash1, salt1))

    def test_db_user_creation_and_auth_flow(self):
        # 1. Создание физлица
        user_data = {
            "email": "test.user@smartcontractum.ru",
            "password": "SuperSecret123!",
            "accountType": "individual",
            "phone": "+7 (999) 111-22-33",
            "lastName": "Иванов",
            "firstName": "Алексей",
            "middleName": "Сергеевич"
        }
        created = db.create_user(user_data)
        self.assertEqual(created["email"], "test.user@smartcontractum.ru")
        self.assertEqual(created["account_type"], "individual")
        self.assertEqual(created["displayName"], "Иванов Алексей Сергеевич")

        # 2. Аутентификация с верным паролем
        auth_success = db.authenticate_user("test.user@smartcontractum.ru", "SuperSecret123!")
        self.assertIsNotNone(auth_success)
        self.assertEqual(auth_success["id"], created["id"])

        # 3. Аутентификация с неверным паролем
        auth_fail = db.authenticate_user("test.user@smartcontractum.ru", "BadPassword!")
        self.assertIsNone(auth_fail)

        # 4. Сессия
        token = db.create_session(created["id"])
        user_by_token = db.get_user_by_token(token)
        self.assertIsNotNone(user_by_token)
        self.assertEqual(user_by_token["email"], "test.user@smartcontractum.ru")

        # 5. Контракты
        contracts = db.get_user_contracts(created["id"])
        self.assertGreaterEqual(len(contracts), 1)

    def test_api_login_endpoint(self):
        # Регистрация пользователя в БД
        db.create_user({
            "email": "api.tester@smartcontractum.ru",
            "password": "Password777!",
            "accountType": "organization",
            "phone": "+7 (999) 555-44-33",
            "orgInn": "7707083893",
            "companyFullName": "ПАО СБЕРБАНК",
            "companyShortName": "Сбербанк"
        })

        # Успешный вход через API
        req = urllib.request.Request(
            "http://127.0.0.1:3000/api/auth/login",
            data=json.dumps({"email": "api.tester@smartcontractum.ru", "password": "Password777!"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["user"]["account_type"], "organization")

        # Запрос профиля /api/auth/me
        token = data["token"]
        req_me = urllib.request.Request(
            "http://127.0.0.1:3000/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )
        with urllib.request.urlopen(req_me, timeout=5) as resp_me:
            data_me = json.loads(resp_me.read().decode("utf-8"))

        self.assertTrue(data_me["success"])
        self.assertEqual(data_me["user"]["email"], "api.tester@smartcontractum.ru")
        self.assertGreaterEqual(len(data_me["contracts"]), 1)

if __name__ == "__main__":
    unittest.main()
