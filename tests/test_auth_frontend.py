import re
import os
import json
import unittest
import urllib.request
from server import query_egrul_nalog_ru, validate_inn_checksum, EMAIL_SESSIONS

class TestAuthFrontend(unittest.TestCase):
    def setUp(self):
        self.project_root = "/home/dem/Projects_01"
        self.html_path = os.path.join(self.project_root, "public/index.html")
        self.css_path = os.path.join(self.project_root, "public/styles.css")
        self.js_path = os.path.join(self.project_root, "public/app.js")
        self.server_path = os.path.join(self.project_root, "server.py")

    def test_files_exist(self):
        self.assertTrue(os.path.exists(self.html_path), "HTML must exist")
        self.assertTrue(os.path.exists(self.css_path), "CSS must exist")
        self.assertTrue(os.path.exists(self.js_path), "JS must exist")
        self.assertTrue(os.path.exists(self.server_path), "server.py must exist")

    def test_inn_checksum_validator(self):
        self.assertTrue(validate_inn_checksum("7707083893")) # Сбербанк (10 цифр)
        self.assertTrue(validate_inn_checksum("7736207543")) # Яндекс (10 цифр)
        self.assertFalse(validate_inn_checksum("7707083894")) # Неверная контрольная сумма
        self.assertFalse(validate_inn_checksum("1234567890")) # Неверная контрольная сумма

    def test_html_elements_and_email_verify(self):
        with open(self.html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 3 кнопки переключения субъекта
        self.assertIn('id="type-individual"', content)
        self.assertIn('id="type-ip"', content)
        self.assertIn('id="type-organization"', content)

        # Экран подтверждения E-mail
        self.assertIn('id="form-verify-email"', content)
        self.assertIn('id="verify-target-email"', content)
        self.assertIn('id="email-code-input"', content)
        self.assertIn('id="btn-submit-verify-email"', content)
        self.assertIn('id="btn-resend-email"', content)

        # Защитная капча
        self.assertIn('id="reg-captcha-canvas"', content)
        self.assertIn('id="reg-captcha-refresh"', content)
        self.assertIn('id="reg-captcha-input"', content)

    def test_email_verification_api_flow(self):
        # 1. Запрос на регистрацию с отправкой кода на E-mail
        test_email = "qxzib@yandex.ru"
        req = urllib.request.Request(
            "http://127.0.0.1:3000/api/auth/register-send-email",
            data=json.dumps({"email": test_email, "accountType": "individual"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        
        self.assertTrue(data["success"])
        self.assertNotIn("demoCode", data, "Demo code must NEVER be returned in production API responses")

        # 2. Проверка неверного кода
        req_bad = urllib.request.Request(
            "http://127.0.0.1:3000/api/auth/verify-email",
            data=json.dumps({"email": test_email, "code": "000000"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req_bad, timeout=5) as resp_bad:
            data_bad = json.loads(resp_bad.read().decode("utf-8"))
        self.assertFalse(data_bad["success"])

        # 3. Проверка верного 6-значного кода (проверяем что не пустой и верный формат)
        session_info = EMAIL_SESSIONS.get(test_email.lower())
        if session_info:
            code = session_info["code"]
            self.assertEqual(len(code), 6)

            req_good = urllib.request.Request(
                "http://127.0.0.1:3000/api/auth/verify-email",
                data=json.dumps({"email": test_email, "code": code}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req_good, timeout=5) as resp_good:
                data_good = json.loads(resp_good.read().decode("utf-8"))
            self.assertTrue(data_good["success"])
            self.assertTrue(data_good["verified"])

if __name__ == "__main__":
    unittest.main()
