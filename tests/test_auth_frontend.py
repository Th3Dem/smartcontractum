import re
import os
import unittest
from server import query_egrul_nalog_ru, validate_inn_checksum

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

    def test_html_all_three_subject_types(self):
        with open(self.html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 3 кнопки переключения субъекта
        self.assertIn('id="type-individual"', content)
        self.assertIn('id="type-ip"', content)
        self.assertIn('id="type-organization"', content)

        # Поля для физ. лица
        self.assertIn('id="reg-lastname"', content)
        self.assertIn('id="reg-firstname"', content)
        self.assertIn('id="reg-phone"', content)

        # Поля для ИП
        self.assertIn('id="reg-ip-inn"', content)
        self.assertIn('id="reg-ip-ogrnip"', content)
        self.assertIn('id="btn-fetch-egrip"', content)
        self.assertIn('id="reg-ip-lastname"', content)
        self.assertIn('id="reg-ip-firstname"', content)
        self.assertIn('id="reg-ip-phone"', content)

        # Поля для юр. лица
        self.assertIn('id="reg-inn"', content)
        self.assertIn('id="btn-fetch-egrul"', content)
        self.assertIn('id="reg-company"', content)
        self.assertIn('id="reg-short-name"', content)
        self.assertIn('id="reg-ogrn"', content)
        self.assertIn('id="reg-kpp"', content)
        self.assertIn('id="reg-org-lastname"', content)
        self.assertIn('id="reg-org-firstname"', content)
        self.assertIn('id="reg-org-phone"', content)

        # Двойной ввод пароля
        self.assertIn('id="reg-password"', content)
        self.assertIn('id="reg-password-confirm"', content)

    def test_live_egrul_query(self):
        # Онлайн-запрос к ФНС ЕГРЮЛ (Сбербанк 7707083893)
        res = query_egrul_nalog_ru("7707083893")
        self.assertTrue(res["success"], f"EGRUL query failed: {res.get('error')}")
        self.assertIn("СБЕРБАНК", res["company"]["fullName"].upper())
        self.assertEqual(res["company"]["ogrn"], "1027700132195")
        self.assertEqual(res["company"]["statusType"], "ACTIVE")

        # Запрос с несуществующим в ЕГРЮЛ ИНН
        res_fake = query_egrul_nalog_ru("9999999999")
        self.assertFalse(res_fake["success"])

if __name__ == "__main__":
    unittest.main()
