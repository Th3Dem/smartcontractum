# TECH_SPEC.md — Техническая спецификация: Сайдбар и эндпоинт смены пароля (TASK-05)

## 1. Схема API и серверные контракты

### 1.1 Эндпоинт: `POST /api/user/change-password`
- **Заголовки**: `Authorization: Bearer <session_token>`, `Content-Type: application/json`
- **Тело запроса**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword2026!"
  }
  ```
- **Успешный ответ (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Пароль успешно изменен"
  }
  ```
- **Ошибки (400 Bad Request)**:
  - Неверный текущий пароль: `{"success": false, "error": "Неверно указан текущий пароль"}`
  - Короткий пароль: `{"success": false, "error": "Новый пароль должен содержать не менее 8 символов"}`

### 1.2 Обновление `POST /api/user/update-profile`
- Принимает дополнительное поле `blogTitle` / `blog_title` (строка, до 150 символов).
- Сохраняет в столбец `blog_title` таблицы `users`.

---

## 2. База данных (`db.py`)
1. **Миграция схемы**:
   - Проверка наличия колонки `blog_title` в таблице `users`. При отсутствии:
     `ALTER TABLE users ADD COLUMN blog_title TEXT DEFAULT ''`.
2. **Функция `change_user_password(user_id, current_pwd, new_pwd)`**:
   - Извлечение хэша и соли текущего пароля.
   - Сверка через `verify_password(current_pwd, pwd_hash, pwd_salt)`.
   - При успехе — генерация новой соли (`secrets.token_hex(16)`) и хэша PBKDF2-HMAC-SHA256 (100k итераций).
   - Выполнение `UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?`.
3. **Функция `update_user_profile(user_id, data)`**:
   - Сохранение `blog_title` вместе с ФИО, телефоном и E-mail.
