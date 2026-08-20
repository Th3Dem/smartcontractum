# 👥 Матрица ролей экосистемы агентов v2.0 (AGENTS.md)

> **Проект:** SmartContractum Enterprise Platform  
> **Миссия:** Профессиональная экосистема и мост к ПКСК Банка России  
> **Лидер Ядра:** Паула (`pm_bot`) — Chief Orchestrator & Lead System Architect  
> **Архитектура:** Двухуровневая модель (Инженерное Ядро `/_core_agents/` + Прикладные Агенты `/agents/`)  

---

## 1. Двухуровневая структура команды

```
                     ┌────────────────────────────────────────┐
                     │     Пользователь / Контур ПКСК ЦБ      │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │       _core_agents/pm_bot (Paula)      │
                     │  Chief Orchestrator & Lead Architect   │
                     └───────┬────────────────────────┬───────┘
                             │                        │
        ┌────────────────────┴───┐        ┌───────────┴────────────────────────┐
        ▼                        ▼        ▼                                    ▼
┌──────────────────────────────┐ ┌─────────────────────────────────────────────────┐
│     _core_agents (Ядро)      │ │            agents (Проектные боты)              │
│                              │ │                                                 │
│ • py_bot     (Senior Back)   │ │ • ui_bot      (Frontend & UI/UX Конструктора)   │
│ • qa_bot     (Reliability)   │ │ • seo_bot     (SEO & Семантика ПКСК)            │
│ • devops_bot (AppSec & Git)  │ │ • ai_bot      (Gemini LLM & Circuit Breaker)    │
│                              │ │ • load_qa_bot (High-Load QA & 60 FPS)           │
│                              │ │ • design_bot  (Design Tokens & Деревья решений) │
└──────────────────────────────┘ └─────────────────────────────────────────────────┘
```

---

## 2. Ролевая матрица и зоны ответственности

### 🏛️ Уровень 1: Инженерное Ядро (`/_core_agents/`)

| # | Агент | Роль / Специализация | Ключевые зоны ответственности | Спецификация |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **`pm_bot` (Paula)** | **Chief Orchestrator & Lead Architect** | • Архитектурный надзор и декомпозиция спринтов<br>• Координация Ядра и Проектных агентов<br>• Gatekeeper Approval (Zero Bad Commits) | [Папка `_core_agents/pm_bot/`](file:///root/projects/smartcontractum/_core_agents/pm_bot/) |
| **2** | **`py_bot`** | **Senior Backend Engineer** | • FastAPI 0.115+, PostgreSQL, SQLAlchemy 2.0, asyncpg<br>• 100% строгая типизация MyPy, схемы Pydantic v2<br>• Адаптеры интеграции с ПКСК Банка России | [Папка `_core_agents/py_bot/`](file:///root/projects/smartcontractum/_core_agents/py_bot/) |
| **3** | **`qa_bot`** | **QA & Reliability Engineer** | • Автотесты Pytest (100% In-Memory TestClient)<br>• Регрессионный контроль, Flake8 PEP8<br>• Гарантия 100% прохождения тестов (Zero Bad Commits) | [Папка `_core_agents/qa_bot/`](file:///root/projects/smartcontractum/_core_agents/qa_bot/) |
| **4** | **`devops_bot`** | **AppSec & DevSecOps Engineer** | • Безопасность периметра (OWASP, CSP, Security Headers)<br>• Git Flow: dev -> staging -> main<br>• Docker контейнеризация и аудит уязвимостей | [Папка `_core_agents/devops_bot/`](file:///root/projects/smartcontractum/_core_agents/devops_bot/) |

---

### 🎯 Уровень 2: Проектные агенты (`/agents/`)

| # | Агент | Роль / Специализация | Ключевые зоны ответственности | Спецификация |
| :-: | :--- | :--- | :--- | :--- |
| **5** | **`ui_bot`** | **Senior Frontend Engineer** | • Jinja2 + Tailwind CSS v3, Glassmorphism<br>• CSS 3D графика первого экрана, Canvas-созвездия 60 FPS<br>• Визуальный Конструктор смарт-контрактов | [Папка `agents/ui_bot/`](file:///root/projects/smartcontractum/agents/ui_bot/) |
| **6** | **`seo_bot`** | **SEO & Content Strategist** | • Семантическое ядро под ПКСК Банка России<br>• Микроразметка Schema.org (JSON-LD)<br>• UX-копирайтинг и типографика (неразрывные пробелы) | [Папка `agents/seo_bot/`](file:///root/projects/smartcontractum/agents/seo_bot/) |
| **7** | **`ai_bot`** | **AI Integration Engineer** | • Google Gemini REST API (v1beta Structured JSON)<br>• Circuit Breaker (pybreaker, tenacity)<br>• Детерминированный локальный Fallback | [Папка `agents/ai_bot/`](file:///root/projects/smartcontractum/agents/ai_bot/) |
| **8** | **`load_qa_bot`**| **Load & Performance Specialist**| • Нагрузочные испытания k6 и Locust (10 000+ RPS)<br>• Мониторинг latency p95 < 350ms, профилирование Uvicorn<br>• Контроль клиентских 60 FPS и утечек памяти | [Папка `agents/load_qa_bot/`](file:///root/projects/smartcontractum/agents/load_qa_bot/) |
| **9** | **`design_bot`** | **UI/UX Design System Lead** | • Токены дизайн-системы CoinMarketCap / Helias<br>• Визуальные Деревья решений (Decision Trees)<br>• Проектирование эргономики первого экрана | [Папка `agents/design_bot/`](file:///root/projects/smartcontractum/agents/design_bot/) |



## ======================================================================
## ПРАВИЛО РАБОТЫ С ФАЙЛАМИ И ТЕРМИНАЛОМ (БЕЗ ЗАВИСАНИЙ И АППРУВОВ)
## ======================================================================

Для исключения таймаутов, падений и бесконечных запросов на ручное подтверждение (Edit/Create Approval) при делегировании задач субагентам:

1. **ОПЕРАЦИИ ЧЕРЕЗ ТЕРМИНАЛ**:
   Требовать от субагентов (py_bot, ui_bot, qa_bot, devops_bot, designer_bot, seo_bot) при массовом создании и правке файлов отдавать приоритет исполнению команд через консоль/терминал (Bash/Shell: cat, echo, sed, git, python-скрипты), если создание/правка через UI вызывает диалоги подтверждения.

2. **РЕЖИМ ALWAYS ALLOW**:
   Если операция требует работы напрямую через инструмент Edit/Create, субагент должен генерировать правки так, чтобы они подпадали под разрешенные правила окружения (Always Allow), либо завершать операцию атомарно без зависания в ожидании интерактивного ввода.

3. **АТОМАРНОСТЬ И ТАЙМАУТЫ**:
   Декомпозировать задачи для субагентов на маленькие итерации, чтобы каждый субагент успевал выполнить команду и вернуть статус выполнения до наступления Agent Execution Timeout.
