import re
import os
import unittest

class TestAuthFrontend(unittest.TestCase):
    def setUp(self):
        self.project_root = "/home/dem/Projects_01"
        self.html_path = os.path.join(self.project_root, "public/index.html")
        self.css_path = os.path.join(self.project_root, "public/styles.css")
        self.js_path = os.path.join(self.project_root, "public/app.js")
        self.ts_types_path = os.path.join(self.project_root, "src/types/auth.ts")
        self.ts_service_path = os.path.join(self.project_root, "src/services/authClient.ts")

    def test_files_exist(self):
        self.assertTrue(os.path.exists(self.html_path), "HTML must exist")
        self.assertTrue(os.path.exists(self.css_path), "CSS must exist")
        self.assertTrue(os.path.exists(self.js_path), "JS must exist")
        self.assertTrue(os.path.exists(self.ts_types_path), "TS types must exist")
        self.assertTrue(os.path.exists(self.ts_service_path), "TS service must exist")

    def test_html_structure_and_a11y(self):
        with open(self.html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Check essential elements
        self.assertIn('id="form-login"', content)
        self.assertIn('id="form-register"', content)
        self.assertIn('id="form-forgot"', content)
        self.assertIn('id="type-individual"', content)
        self.assertIn('id="type-organization"', content)
        self.assertIn('id="strength-fill"', content)
        self.assertIn('id="theme-toggle"', content)
        self.assertIn('152-ФЗ', content)
        self.assertIn('aria-label', content)

    def test_inn_validation_logic(self):
        def validate_inn(inn: str):
            clean = inn.strip()
            if not clean.isdigit():
                return False
            return len(clean) in (10, 12)

        self.assertTrue(validate_inn("7707083893"))
        self.assertTrue(validate_inn("500100732259"))
        self.assertFalse(validate_inn("12345"))
        self.assertFalse(validate_inn("7707083893a"))

    def test_password_strength_calculation(self):
        def calc_strength(p: str):
            if not p:
                return 0
            score = 0
            if len(p) >= 8: score += 1
            if re.search(r'[A-ZА-Я]', p): score += 1
            if re.search(r'[0-9]', p): score += 1
            if re.search(r'[!@#$%^&*(),.?":{}|<>]', p): score += 1
            return score

        self.assertEqual(calc_strength(""), 0)
        self.assertEqual(calc_strength("123"), 1)
        self.assertEqual(calc_strength("Pass1234"), 3)
        self.assertEqual(calc_strength("Pass1234!"), 4)

if __name__ == "__main__":
    unittest.main()
