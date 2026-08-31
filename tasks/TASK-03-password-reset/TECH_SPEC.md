# TECH_SPEC.md — Техническая спецификация архитектуры сброса пароля (TASK-03)

## 1. Общие сведения и стек
- **Backend API**: Python 3 / `http.server` (`server.py`).
- **Data & Crypto Layer**: SQLite 3 (`db.py`), `hashlib.pbkdf2_hmac`, `secrets`, `hmac`.
- **E-mail Gateway**: Яндекс SMTP SSL (`smtp.yandex.ru:465`).
- **Frontend Layer**: Vanilla JavaScript (`app.js`), CSS Grid/Flexbox (`styles.css`), HTML5 (`index.html`).

---

## 2. Спецификация API эндпоинтов

### 2.1. `POST /api/auth/forgot-password`
Запрос на инициацию сброса пароля и отправку проверочного кода.
- **Request Body**:
  ```json
  {
    "email": "alexander@smartcontractum.ru"
  }
  ```
- **Обработка**:
  1. Нормализация email: `.strip().lower()`.
  2. Проверка наличия пользователя в БД через `db.get_user_by_email(email)`. Если пользователь не найден — возврат ошибки «Пользователь с таким адресом не зарегистрирован».
  3. Генерация 6-значного криптокода: `f"{secrets.randbelow(900000) + 100000}"`.
  4. Сохранение во временном пуле `PASSWORD_RESET_SESSIONS[email]` с TTL = 10 минут (600 сек).
  5. Отправка брендированного HTML-письма через шлюз `send_real_email_code()`.
- **Response Body**:
  ```json
  {
    "success": true,
    "email": "alexander@smartcontractum.ru",
    "cooldown": 60,
    "message": "Письмо с проверочным кодом направлено на alexander@smartcontractum.ru"
  }
  ```

---

### 2.2. `POST /api/auth/forgot-verify-code`
Валидация введенного кода и выдача одноразового токена сброса.
- **Request Body**:
  ```json
  {
    "email": "alexander@smartcontractum.ru",
    "code": "492015"
  }
  ```
- **Обработка**:
  1. Поиск сессии в `PASSWORD_RESET_SESSIONS`.
  2. Проверка срока действия (`time.time() <= expires`).
  3. Сравнение кода через константное время `hmac.compare_digest`.
  4. Генерация 256-битного токена сброса: `reset_token = secrets.token_hex(32)` с TTL = 15 минут.
- **Response Body**:
  ```json
  {
    "success": true,
    "resetToken": "a8f3...256bit_hex..."
  }
  ```

---

### 2.3. `POST /api/auth/forgot-reset-password`
Установка нового пароля в БД и аннуляция всех существующих сессий.
- **Request Body**:
  ```json
  {
    "email": "alexander@smartcontractum.ru",
    "resetToken": "a8f3...256bit_hex...",
    "newPassword": "MyStrongPassword2026!"
  }
  ```
- **Обработка**:
  1. Валидация токена `reset_token` и срока его действия.
  2. Валидация сложности пароля (длина $\ge 8$, наличие букв и цифр).
  3. Вызов `db.update_user_password(email, new_password)`:
     - Генерация новой 16-байтной соли.
     - Вычисление хэша PBKDF2-HMAC-SHA256 (100 000 итераций).
     - Обновление полей `password_hash` и `password_salt` в таблице `users`.
     - Удаление всех строк из таблицы `sessions` для данного `user_id`.
  4. Удаление сессии из `PASSWORD_RESET_SESSIONS`.
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Пароль успешно обновлен. Теперь вы можете войти в систему с новым паролем."
  }
  ```

---

## 3. Расширение модели данных (`db.py`)
```python
def get_user_by_email(email: str) -> dict | None:
    """Извлекает пользователя по email."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_password(email: str, new_password: str) -> bool:
    """
    Обновляет пароль пользователя с новым хэшем PBKDF2 и сбрасывает все активные сессии.
    """
    user = get_user_by_email(email)
    if not user:
        return False
    pwd_hash, pwd_salt = hash_password(new_password)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", (pwd_hash, pwd_salt, user["id"]))
    cursor.execute("DELETE FROM sessions WHERE user_id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return True
```

---

## 4. Архитектура клиентского интерфейса
Интерфейс восстановления строится на трех взаимоисключающих суб-формах внутри контейнера `#auth-card`:
1. `#form-forgot` (Шаг 1: Email + Капча)
2. `#form-forgot-verify` (Шаг 2: 6-значный код + Таймер + Кнопка повторной отправки)
3. `#form-forgot-new-pwd` (Шаг 3: Новый пароль + Повтор + Strength Meter)
