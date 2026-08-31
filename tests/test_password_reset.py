#!/usr/bin/env python3
"""
SmartContractum — Автоматические тесты трехэтапного механизма сброса пароля (TASK-03)
Проверка db.py, серверных эндпоинтов, криптографической валидации, инвалидации сессий и HTML-форм.
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

TEST_PORT = 3099

class TestPasswordReset(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()
        # Запуск тестового HTTP-сервера в отдельном потоке
        cls.httpd = HTTPServer(("127.0.0.1", TEST_PORT), server.SmartContractumHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def test_01_db_get_user_and_update_password(self):
        """Проверка работы get_user_by_email и update_user_password в db.py"""
        email = f"test_reset_{int(time.time())}@smartcontractum.ru"
        old_pwd = "OldPassword123!"
        new_pwd = "BrandNewSecret2026!"

        # Создаем тестового пользователя
        user = db.create_user({
            "email": email,
            "password": old_pwd,
            "accountType": "individual",
            "lastName": "Петров",
            "firstName": "Петр",
            "phone": "+7 (999) 555-44-33"
        })
        self.assertIsNotNone(user)
        self.assertEqual(user["email"], email)

        # Создаем активную сессию
        token = db.create_session(user["id"])
        self.assertIsNotNone(token)
        self.assertIsNotNone(db.get_user_by_token(token))

        # Проверяем успешную аутентификацию со старым паролем
        auth_old = db.authenticate_user(email, old_pwd)
        self.assertIsNotNone(auth_old)

        # Проверяем поиск пользователя
        found = db.get_user_by_email(email)
        self.assertIsNotNone(found)
        self.assertEqual(found["id"], user["id"])

        # Обновляем пароль
        updated = db.update_user_password(email, new_pwd)
        self.assertTrue(updated)

        # Проверяем, что старый пароль больше не подходит
        self.assertIsNone(db.authenticate_user(email, old_pwd))

        # Проверяем, что старая сессия была аннулирована
        self.assertIsNone(db.get_user_by_token(token))

        # Проверяем, что новый пароль успешно аутентифицирует пользователя
        auth_new = db.authenticate_user(email, new_pwd)
        self.assertIsNotNone(auth_new)
        self.assertEqual(auth_new["id"], user["id"])

    def test_02_server_password_reset_full_cycle(self):
        """Сквозной интеграционный тест трех шагов сброса пароля через REST API"""
        email = f"api_reset_{int(time.time())}@smartcontractum.ru"
        old_pwd = "InitialPassword123!"
        new_pwd = "UpdatedSuperPassword999!"

        # Создаем пользователя в БД
        db.create_user({
            "email": email,
            "password": old_pwd,
            "accountType": "individual",
            "lastName": "Сидоров",
            "firstName": "Иван",
            "phone": "+7 (999) 777-88-99"
        })

        base_url = f"http://127.0.0.1:{TEST_PORT}"

        def post_json(path, payload):
            req = urllib.request.Request(
                f"{base_url}{path}",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))

        # ШАГ 1: Запрос кода сброса на несуществующий email (должна быть ошибка)
        res_fake = post_json("/api/auth/forgot-password", {"email": "non_existent_user_999@test.ru"})
        self.assertFalse(res_fake.get("success"))

        # ШАГ 1: Запрос кода на реальный email
        res_step1 = post_json("/api/auth/forgot-password", {"email": email})
        self.assertTrue(res_step1.get("success"))
        self.assertEqual(res_step1.get("email"), email)

        # Извлекаем сгенерированный код из серверной памяти
        self.assertIn(email, server.PASSWORD_RESET_SESSIONS)
        code = server.PASSWORD_RESET_SESSIONS[email]["code"]
        self.assertEqual(len(code), 6)

        # ШАГ 2: Проверка неверного кода
        res_wrong_code = post_json("/api/auth/forgot-verify-code", {"email": email, "code": "000000"})
        self.assertFalse(res_wrong_code.get("success"))

        # ШАГ 2: Проверка корректного кода
        res_step2 = post_json("/api/auth/forgot-verify-code", {"email": email, "code": code})
        self.assertTrue(res_step2.get("success"))
        self.assertTrue(res_step2.get("verified"))
        reset_token = res_step2.get("resetToken")
        self.assertIsNotNone(reset_token)

        # ШАГ 3: Попытка смены с неверным токеном
        res_bad_token = post_json("/api/auth/forgot-reset-password", {
            "email": email,
            "resetToken": "invalid_fake_token_hex_123456",
            "newPassword": new_pwd
        })
        self.assertFalse(res_bad_token.get("success"))

        # ШАГ 3: Попытка установки слишком короткого пароля (<8 символов)
        res_short_pwd = post_json("/api/auth/forgot-reset-password", {
            "email": email,
            "resetToken": reset_token,
            "newPassword": "123"
        })
        self.assertFalse(res_short_pwd.get("success"))

        # ШАГ 3: Успешная установка нового пароля
        res_step3 = post_json("/api/auth/forgot-reset-password", {
            "email": email,
            "resetToken": reset_token,
            "newPassword": new_pwd
        })
        self.assertTrue(res_step3.get("success"))

        # Проверяем, что сессия сброса удалена
        self.assertNotIn(email, server.PASSWORD_RESET_SESSIONS)

        # Проверяем вход со старым паролем (должен вернуть ошибку)
        res_login_old = post_json("/api/auth/login", {"email": email, "password": old_pwd})
        self.assertFalse(res_login_old.get("success"))

        # Проверяем вход с новым паролем (должен быть успешен)
        res_login_new = post_json("/api/auth/login", {"email": email, "password": new_pwd})
        self.assertTrue(res_login_new.get("success"))
        self.assertIsNotNone(res_login_new.get("token"))

    def test_03_html_elements_for_password_reset(self):
        """Проверка наличия всех 3 форм и элементов управления сбросом пароля в public/auth.html"""
        html_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "auth.html")
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Формы 3 шагов
        self.assertIn('id="form-forgot"', content)

        self.assertIn('id="form-forgot-verify"', content)
        self.assertIn('id="form-forgot-new-pwd"', content)

        # Поля ввода
        self.assertIn('id="forgot-email"', content)
        self.assertIn('id="forgot-code-input"', content)
        self.assertIn('id="forgot-new-password"', content)
        self.assertIn('id="forgot-new-password-confirm"', content)

        # Кнопки
        self.assertIn('id="btn-submit-forgot"', content)
        self.assertIn('id="btn-submit-forgot-verify"', content)
        self.assertIn('id="btn-submit-save-new-pwd"', content)
        self.assertIn('id="btn-forgot-resend"', content)

        # Навигационные ссылки
        self.assertIn('id="link-forgot-back-to-step1"', content)
        self.assertIn('id="link-forgot-cancel"', content)

if __name__ == "__main__":
    unittest.main()
