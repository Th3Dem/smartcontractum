# 📊 SPRINT_TRACKER.md — Трекер задач и спринтов команды

> **Проект:** SmartContractum Enterprise Platform  
> **Менеджер спринта:** `pm_bot` (Paula)  
> **Текущий статус:** Спринт 1 — Инициализация и Базовый каркас (Завершен)

---

## 🎯 Спринт 1: Foundation & Base Shell (19.08.2026)

| ID Задачи | Название / Описание | Ответственный агент | Статус | Артефакты / Коммит |
| :--- | :--- | :--- | :---: | :--- |
| `TASK-001` | Инициализация структуры репозитория и каталогов | `pm_bot` / `devops_bot` | ✅ DONE | `a430083` / Repo init |
| `TASK-002` | Формирование ролевой матрицы 9 агентов (`AGENTS.md`) | `pm_bot` | ✅ DONE | `AGENTS.md` |
| `TASK-003` | Конфигурация Enterprise-стека и Staging Gate (`SETTINGS.md`) | `pm_bot` / `devops_bot` | ✅ DONE | `SETTINGS.md` |
| `TASK-004` | Формирование ДНК и миссии Umbrella-интегратора (`SOUL.md`) | `pm_bot` / `seo_bot` | ✅ DONE | `SOUL.md` |
| `TASK-005` | Верстка семантического HTML5 каркаса (`base.html`) | `ui_bot` | ✅ DONE | `frontend/templates/base.html` |
| `TASK-006` | Разработка темной дизайн-системы Deep Slate (`main.css`) | `ui_bot` / `design_bot` | ✅ DONE | `frontend/static/css/main.css` |
| `TASK-007` | Клиентский JS-контроллер навигации и гамбургера (`main.js`) | `ui_bot` | ✅ DONE | `frontend/static/js/main.js` |
| `TASK-008` | FastAPI веб-роутинг и монтирование Jinja2/Static | `py_bot` | ✅ DONE | `backend/routers/base.py` |
| `TASK-009` | ASGI Middleware внедрения Security Headers | `devops_bot` | ✅ DONE | `backend/app.py` |
| `TASK-010` | Разработка и прогон Unit/API автотестов (5/5 tests) | `qa_bot` | ✅ DONE | `tests/unit/test_base_routes.py` |
| `TASK-011` | Релизный пайплайн через Staging в Main | `devops_bot` | ✅ DONE | `7c55b06` / `staging` -> `main` |

---

## 🎯 Спринт 2: Блок 2 — Раздел «Лента & Форум» (19.08.2026)

| ID Задачи | Название / Описание | Ответственный агент | Статус | Артефакты / Коммит |
| :--- | :--- | :--- | :---: | :--- |
| `TASK-012` | Схемы данных и валидация Pydantic (`models/forum.py`) | `py_bot` | ✅ DONE | `backend/models/forum.py` |
| `TASK-013` | REST API эндпоинты категорий и топиков (`routers/forum.py`) | `py_bot` | ✅ DONE | `backend/routers/forum.py` |
| `TASK-014` | 3-колоночный Jinja2 шаблон форума (`templates/forum/index.html`) | `ui_bot` | ✅ DONE | `frontend/templates/forum/index.html` |
| `TASK-015` | CSS-стили карточек, бейджей, таймлайна и модалки (`forum.css`) | `ui_bot` / `design_bot` | ✅ DONE | `frontend/static/css/forum.css` |
| `TASK-016` | AJAX клиент фильтрации и отправки тем (`forum.js`) | `ui_bot` | ✅ DONE | `frontend/static/js/forum.js` |
| `TASK-017` | Набор Pytest-тестов API, фильтрации и XSS-защиты (14/14 tests) | `qa_bot` | ✅ DONE | `tests/unit/test_forum_api.py` |
| `TASK-018` | Релизный пайплайн через Staging в Main | `devops_bot` | ✅ DONE | `dev` -> `staging` -> `main` |

---

## 🔮 Бэклог следующих модулей (SmartContractum Roadmap):

| Блок | Название модуля | Ключевой функционал | Приоритет |
| :-: | :--- | :--- | :-: |
| **Блок 1** | **Конструктор смарт-контрактов («Дерево решений»)** | Визуальный конструктор, узлы условий, оракулы, валидация логики | 🔥 P0 (Next) |
| **Блок 3** | **Паспорт Контракта (Contract Passport Engine)** | Формирование паспорта, хеширование, экспорт в Markdown/PDF, чеклист ЦБ | 🔥 P0 |
| **Блок 4** | **Реестр Доверенных Оракулов (Oracle Hub)** | Каталог поставщиков данных, симуляция оракульных ответов, подписи ГОСТ | ⚡ P1 |
| **Блок 5** | **AI Архитектор Контрактов (Gemini Circuit Breaker)** | Генерация деревьев решений на естественном языке от задачи пользователя | ⚡ P1 |
| **Блок 6** | **Криптографический Сейф & Эскроу (Safe & Escrow)** | Модель депонирования и транзакционного сплита средств | 🛡️ P2 |
