# TECH_SPEC.md — Техническая архитектура: Обновление профиля пользователя (TASK-04)

## 1. Архитектурная схема и API Контракты

### Эндпоинт: `POST /api/user/update-profile`
- **Аутентификация**: Обязательный заголовок `Authorization: Bearer <session_token>`
- **Content-Type**: `application/json`

#### Формат запроса (Request Payload):
```json
{
  "lastName": "Петров",
  "firstName": "Петр",
  "middleName": "Сергеевич",
  "phone": "+7 (999) 555-44-33",
  "email": "petrov@smartcontractum.ru"
}
```

#### Ответ при успехе (Response 200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "petrov@smartcontractum.ru",
    "account_type": "individual",
    "last_name": "Петров",
    "first_name": "Петр",
    "middle_name": "Сергеевич",
    "phone": "+7 (999) 555-44-33",
    "displayName": "Петров Петр Сергеевич",
    "typeLabel": "Физическое лицо",
    "is_verified": 1,
    "created_at": "2026-08-30 20:00:00"
  },
  "message": "Данные профиля успешно обновлены"
}
```

#### Ответ при коллизии E-mail (Response 409 Conflict):
```json
{
  "success": false,
  "error": "Пользователь с таким адресом электронной почты уже зарегистрирован"
}
```

---

## 2. Логика слоя данных (`db.py`)
Функция `update_user_profile(user_id: int, data: dict) -> tuple[bool, str | None, dict | None]`:
1. Получение текущего пользователя по `user_id`. Если не найден — ошибка `Пользователь не найден`.
2. Проверка нового `email`:
   - Приведение к `lower().strip()`.
   - Запрос `SELECT id FROM users WHERE email = ? AND id != ?`. Если запись найдена — возвращает ошибку уникальности.
3. Определение типа аккаунта и параметров обновления:
   - `individual`: обновление `last_name`, `first_name`, `middle_name`, `phone`, `email`.
   - `ip`: обновление `ip_last_name`, `ip_first_name`, `ip_middle_name`, `phone`, `email`.
   - `organization`: обновление `rep_last_name`, `rep_first_name`, `phone`, `email`.
4. Выполнение параметризованного запроса `UPDATE users SET ... WHERE id = ?`.
5. Возврат обновленного санированного объекта пользователя.
