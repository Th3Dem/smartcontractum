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

## 🎯 Спринт 3: Блок 3 — Модуль «Паспорт Смарт-Контракта» (19.08.2026)

| ID Задачи | Название / Описание | Ответственный агент | Статус | Артефакты / Коммит |
| :--- | :--- | :--- | :---: | :--- |
| `TASK-019` | Pydantic схемы валидации паспорта (`models/passport.py`) | `py_bot` | ✅ DONE | `backend/models/passport.py` |
| `TASK-020` | Движок генерации дерева решений (`services/passport_engine.py`) | `py_bot` | ✅ DONE | `backend/services/passport_engine.py` |
| `TASK-021` | REST API генерации и SSR роут (`routers/passport.py`) | `py_bot` | ✅ DONE | `backend/routers/passport.py` |
| `TASK-022` | Wizard интерфейс и терминал предпросмотра (`passport/index.html`) | `ui_bot` | ✅ DONE | `frontend/templates/passport/index.html` |
| `TASK-023` | CSS-стили мастера ввода и терминала (`passport.css`) | `ui_bot` / `design_bot` | ✅ DONE | `frontend/static/css/passport.css` |
| `TASK-024` | JS-контроллер AJAX генерации и экспорта `.md` (`passport.js`) | `ui_bot` | ✅ DONE | `frontend/static/js/passport.js` |
| `TASK-025` | In-Memory Pytest автотесты генератора (23/23 tests total) | `qa_bot` | ✅ DONE | `tests/unit/test_passport_api.py` |
| `TASK-026` | Релизный пайплайн через Staging в Main | `devops_bot` | ✅ DONE | `dev` -> `staging` -> `main` |

---

## 🎯 Спринт 4: Блок 4 — Low-Code Конструктор & 5-этапный пред-аудит (19.08.2026)

| ID Задачи | Название / Описание | Ответственный агент | Статус | Артефакты / Коммит |
| :--- | :--- | :--- | :---: | :--- |
| `TASK-027` | Pydantic схемы узлов и аудита (`models/builder.py`) | `py_bot` | ✅ DONE | `backend/models/builder.py` |
| `TASK-028` | REST API симуляции аудита и SSR роут (`routers/builder.py`) | `py_bot` | ✅ DONE | `backend/routers/builder.py` |
| `TASK-029` | 2-колоночный холст и панель конвейера (`builder/index.html`) | `ui_bot` | ✅ DONE | `frontend/templates/builder/index.html` |
| `TASK-030` | CSS-стили узлов, коннекторов и таймлайна (`builder.css`) | `ui_bot` / `design_bot` | ✅ DONE | `frontend/static/css/builder.css` |
| `TASK-031` | JS-контроллер 5-этапной анимации аудита (`builder.js`) | `ui_bot` | ✅ DONE | `frontend/static/js/builder.js` |
| `TASK-032` | In-Memory Pytest автотесты конструктора (26/26 tests total) | `qa_bot` | ✅ DONE | `tests/unit/test_builder_api.py` |
| `TASK-033` | Релизный пайплайн через Staging в Main | `devops_bot` | ✅ DONE | `dev` -> `staging` -> `main` |

---

## 🎯 Спринт 5: Блок 5 — Маркетплейс Источников Данных & Оракулов (19.08.2026)

| ID Задачи | Название / Описание | Ответственный агент | Статус | Артефакты / Коммит |
| :--- | :--- | :--- | :---: | :--- |
| `TASK-034` | Pydantic схемы источников и валидации (`models/data_sources.py`) | `py_bot` | ✅ DONE | `backend/models/data_sources.py` |
| `TASK-035` | REST API каталога и подачи заявок (`routers/data_sources.py`) | `py_bot` | ✅ DONE | `backend/routers/data_sources.py` |
| `TASK-036` | Таблица источников и модальное окно (`data_sources/index.html`) | `ui_bot` | ✅ DONE | `frontend/templates/data_sources/index.html` |
| `TASK-037` | CSS-стили таблицы, trust-бейджей и алерта (`data_sources.css`) | `ui_bot` / `design_bot` | ✅ DONE | `frontend/static/css/data_sources.css` |
| `TASK-038` | JS-клиент AJAX-фильтрации и отправки заявки (`data_sources.js`) | `ui_bot` | ✅ DONE | `frontend/static/js/data_sources.js` |
| `TASK-039` | In-Memory Pytest тесты фильтрации и XSS (32/32 tests total) | `qa_bot` | ✅ DONE | `tests/unit/test_data_sources_api.py` |
| `TASK-040` | Релизный пайплайн через Staging в Main | `devops_bot` | ✅ DONE | `dev` -> `staging` -> `main` |

---

## 🔮 Бэклог следующих модулей (SmartContractum Roadmap):

| Блок | Название модуля | Ключевой функционал | Приоритет |
| :-: | :--- | :--- | :-: |
| **Блок 6** | **AI Архитектор Контрактов (Gemini Circuit Breaker)** | Генерация деревьев решений на естественном языке от задачи пользователя | ⚡ P1 (Next) |
| **Блок 7** | **Криптографический Сейф & Эскроу (Safe & Escrow)** | Модель депонирования и транзакционного сплита средств | 🛡️ P2 |
