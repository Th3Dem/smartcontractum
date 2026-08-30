# DEV_HANDOVER.md — Передача функционала Личного кабинета (TASK-02)

## 1. Состав файлов задачи
- `db.py` — модуль SQLite базы данных, криптографии и сессий.
- `server.py` — эндпоинты `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`.
- `public/dashboard.html` — разметка личного кабинета.
- `public/dashboard.css` — система стилей и выравнивания ЛК.
- `public/dashboard.js` — клиентский модуль авторизации и рендеринга профиля.
- `tests/test_auth_frontend.py` — интеграционные и юнит-тесты.
