# TECH_SPEC.md — Техническая спецификация архитектуры (TASK-02)

## 1. Архитектурный стек
- **База данных**: SQLite 3 (`data/smartcontractum.db`) с пулом потокобезопасных соединений.
- **Криптография**: `hashlib.pbkdf2_hmac('sha256', ...)`, `secrets.token_hex(32)`, `hmac.compare_digest`.
- **Серверный слой**: `Python 3 / http.server` (`server.py`).
- **Клиентский слой**: Vanilla JavaScript (`dashboard.js`), CSS Grid/Flexbox (`dashboard.css`).

## 2. Спецификация API
- `POST /api/auth/login`:
  - Request: `{"email": "...", "password": "..."}`
  - Response: `{"success": true, "token": "...", "user": {...}}`
- `GET /api/auth/me`:
  - Header: `Authorization: Bearer <token>`
  - Response: `{"success": true, "user": {...}, "contracts": [...]}`
- `POST /api/auth/logout`:
  - Header: `Authorization: Bearer <token>`
  - Response: `{"success": true, "message": "Сессия успешно завершена"}`

## 3. Модель данных и безопасность
- Хранение паролей: только в виде `password_hash` и `password_salt`.
- Токены: 256 бит, срок жизни 7 дней.
- Сессионный кэш браузера: `localStorage.getItem('auth_token')`.
