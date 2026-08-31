# DEV_HANDOVER.md — Передача функционала трехэтапного сброса пароля (TASK-03)

## 1. Состав артефактов разработки
| Файл | Описание внесенных изменений |
|---|---|
| [`db.py`](file:///home/dem/Projects_01/db.py) | Реализованы функции `get_user_by_email()` и `update_user_password()`. Новое хеширование PBKDF2-HMAC-SHA256 (100k итераций, 16 байт соль), атомарная очистка старых сессий в `sessions`. |
| [`server.py`](file:///home/dem/Projects_01/server.py) | Добавлены эндпоинты `POST /api/auth/forgot-password`, `POST /api/auth/forgot-verify-code`, `POST /api/auth/forgot-reset-password` и модуль `send_reset_password_email()`. |
| [`public/index.html`](file:///home/dem/Projects_01/public/index.html) | Добавлены формы трех шагов сброса пароля (`form-forgot`, `form-forgot-verify`, `form-forgot-new-pwd`). |
| [`public/app.js`](file:///home/dem/Projects_01/public/app.js) | Реализована логика трехэтапного перехода, таймер 60 сек, Password Strength Meter, проверка совпадения паролей, вызовы API. |

---

## 2. Инструкции по проверке и запуску
1. **Запуск сервера**:
   ```bash
   python3 server.py 3000
   ```
2. **Запуск автоматических тестов**:
   ```bash
   python3 -m unittest tests/test_password_reset.py
   python3 -m unittest tests/test_auth_frontend.py
   ```
3. **Ручная проверка**:
   - Открыть `http://localhost:3000`.
   - Нажать «Забыли пароль?».
   - Ввести зарегистрированный E-mail и капчу.
   - Ввести 6-значный код из письма.
   - Задать новый пароль (не менее 8 символов).
   - Войти с новым паролем.
