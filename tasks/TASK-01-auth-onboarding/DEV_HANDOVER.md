# DEV_HANDOVER.md — Передача реализованного функционала в релиз (TASK-01)

## 1. Состав артефактов и файлов разработки
| Файл | Назначение |
|---|---|
| [`db.py`](file:///home/dem/Projects_01/db.py) | Модуль базы данных SQLite, криптографии PBKDF2, сессий и защиты ПДн (152-ФЗ). |
| [`server.py`](file:///home/dem/Projects_01/server.py) | HTTP-сервер, эндпоинты `/api/egrul`, `/api/auth/login`, `/api/auth/verify-email`, `/api/auth/me`, `/api/auth/logout`, SMTP. |
| [`public/index.html`](file:///home/dem/Projects_01/public/index.html) | Формы входа, регистрации для 3 категорий субъектов, восстановления доступа. |
| [`public/styles.css`](file:///home/dem/Projects_01/public/styles.css) | Система дизайна, темы оформления (Dark/Light), адаптивная верстка. |
| [`public/app.js`](file:///home/dem/Projects_01/public/app.js) | Клиентская логика авторизации, капчи, валидации и интеграции с ФНС. |
| [`public/dashboard.html`](file:///home/dem/Projects_01/public/dashboard.html) | Личный кабинет пользователя (минималистичный интерфейс). |
| [`public/dashboard.css`](file:///home/dem/Projects_01/public/dashboard.css) | Стили личного кабинета с идеальным выравниванием. |
| [`public/dashboard.js`](file:///home/dem/Projects_01/public/dashboard.js) | Защита маршрута ЛК, загрузка профиля и обработка выхода. |
| [`tests/test_auth_frontend.py`](file:///home/dem/Projects_01/tests/test_auth_frontend.py) | Набор автоматических тестов (100% покрытие ключевых сценариев). |

---

## 2. Инструкция по запуску
1. Запуск сервера:
   ```bash
   python3 server.py 3000
   ```
2. Запуск тестов:
   ```bash
   python3 -m unittest tests/test_auth_frontend.py
   ```
3. Открытие в браузере: `http://localhost:3000`
