# TECH_SPEC.md — Архитектурная спецификация: Двухфакторная смена пароля (TASK-07)

## 1. Схема REST API

### 1.1 Эндпоинт: `POST /api/security/request-password-change`
- **Заголовки**: `Authorization: Bearer <token>`
- **Поведение**:
  - Идентификация пользователя по токену.
  - Генерация 6-значного криптографически стойкого кода (`secrets.randbelow(900000) + 100000`).
  - Сохранение в словаре оперативной памяти:
    ```python
    SEC_PWD_CHANGE_SESSIONS[user_id] = {
        "code": code,
        "expires": time.time() + 600,
        "verified": False,
        "change_token": None,
        "token_expires": 0
    }
    ```
  - Отправка письма через `send_reset_password_email(user["email"], code)` или специализированную функцию.
- **Ответ**:
  ```json
  {
    "success": true,
    "email": "user@domain.ru",
    "cooldown": 60,
    "message": "Проверочный код отправлен на адрес user@domain.ru"
  }
  ```

### 1.2 Эндпоинт: `POST /api/security/verify-password-code`
- **Заголовки**: `Authorization: Bearer <token>`
- **Тело**: `{ "code": "123456" }`
- **Поведение**:
  - Проверка срока жизни кода.
  - Сравнение через `hmac.compare_digest(session["code"], code)`.
  - Генерация одноразового `change_token` (32 байта hex).
- **Ответ**:
  ```json
  {
    "success": true,
    "verified": true,
    "changeToken": "32_byte_hex_string",
    "message": "Код успешно подтвержден"
  }
  ```

### 1.3 Эндпоинт: `POST /api/security/change-password-verified`
- **Заголовки**: `Authorization: Bearer <token>`
- **Тело**: `{ "changeToken": "...", "newPassword": "..." }`
- **Поведение**:
  - Валидация `changeToken`.
  - Проверка длины пароля $\ge 8$.
  - Вызов `db.update_user_password(user["email"], newPassword)` (PBKDF2-HMAC-SHA256, 100 000 итераций).
  - Сброс сессии смены пароля `SEC_PWD_CHANGE_SESSIONS.pop(user_id, None)`.
- **Ответ**:
  ```json
  {
    "success": true,
    "message": "Пароль успешно изменен!"
  }
  ```
