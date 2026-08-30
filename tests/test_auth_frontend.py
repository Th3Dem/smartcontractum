import re
import os
import unittest

class TestAuthFrontend(unittest.TestCase):
    def setUp(self):
        self.project_root = "/home/dem/Projects_01"
        self.html_path = os.path.join(self.project_root, "public/index.html")
        self.css_path = os.path.join(self.project_root, "public/styles.css")
        self.js_path = os.path.join(self.project_root, "public/app.js")
        self.egrul_service_path = os.path.join(self.project_root, "src/services/egrulService.ts")

    def test_files_exist(self):
        self.assertTrue(os.path.exists(self.html_path), "HTML must exist")
        self.assertTrue(os.path.exists(self.css_path), "CSS must exist")
        self.assertTrue(os.path.exists(self.js_path), "JS must exist")
        self.assertTrue(os.path.exists(self.egrul_service_path), "EGRUL service must exist")

    def test_html_egrul_and_form_elements(self):
        with open(self.html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Проверка кнопки ЕГРЮЛ и контейнера статуса
        self.assertIn('id="btn-fetch-egrul"', content)
        self.assertIn('id="egrul-status"', content)
        self.assertIn('Найти в ЕГРЮЛ', content)

        # Раздельные поля ФИО и телефон для физ. лица
        self.assertIn('id="reg-lastname"', content)
        self.assertIn('id="reg-firstname"', content)
        self.assertIn('id="reg-middlename"', content)
        self.assertIn('id="reg-phone"', content)

        # Поля для представителя организации
        self.assertIn('id="reg-org-lastname"', content)
        self.assertIn('id="reg-org-firstname"', content)
        self.assertIn('id="reg-org-phone"', content)

        # Двойной ввод пароля
        self.assertIn('id="reg-password"', content)
        self.assertIn('id="reg-password-confirm"', content)
        self.assertIn('id="password-match-msg"', content)

    def test_inn_validation_logic(self):
        def validate_inn(inn: str):
            clean = inn.strip().replace(" ", "")
            if not clean.isdigit():
                return False
            return len(clean) in (10, 12)

        self.assertTrue(validate_inn("7707083893"))
        self.assertTrue(validate_inn("500100732259"))
        self.assertFalse(validate_inn("12345"))
        self.assertFalse(validate_inn("7707083893a"))

    def test_password_match_logic(self):
        def check_passwords_match(p1: str, p2: str):
            return bool(p1 and p2 and p1 == p2)

        self.assertTrue(check_passwords_match("Pass1234!", "Pass1234!"))
        self.assertFalse(check_passwords_match("Pass1234!", "Pass1234"))
        self.assertFalse(check_passwords_match("", ""))

if __name__ == "__main__":
    unittest.main()
