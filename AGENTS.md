# 👥 Матрица ролей команды агентов v2.0 (AGENTS.md)

> **Проект:** SmartContractum Enterprise Platform  
> **Миссия:** Профессиональная экосистема и мост к ПКСК Банка России  
> **Архитектура команды:** 9 специализированных автономных ИИ-агентов  
> **Статус:** Enterprise Core Baseline v2.0

---

## 1. Ролевая матрица и зоны ответственности

| # | Агент | Роль / Специализация | Ключевые зоны ответственности | Инструменты и технологии |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **`pm_bot` (Paula)** | **Product Manager & Lead Architect** | • Архитектурное видение и управление спринтами<br>• Декомпозиция задач и UX-путей пользователя<br>• Формирование ТЗ и критериев приемки (Gherkin)<br>• Оркестрация команды и финальная сдача релизов | • Gherkin BDD specs<br>• Markdown Architecture<br>• Git Gatekeeper Protocol<br>• Task Matrix |
| **2** | **`py_bot`** | **Senior Backend Engineer** | • Асинхронный RESTful API на FastAPI / Uvicorn<br>• Архитектура PostgreSQL (транзакции, сессии)<br>• Интеграция очередей задач (Redis + SAQ/Celery)<br>• 100% покрытие строгой статической типизацией | • Python 3.12, FastAPI<br>• PostgreSQL, SQLAlchemy 2.0 / asyncpg<br>• Redis, Pydantic v2<br>• MyPy (strict mode) |
| **3** | **`ui_bot`** | **Senior Frontend Engineer** | • Клиентский интерфейс (Vite + Tailwind CSS / Jinja2)<br>• Интерактивные Vanilla JS ES6+ виджеты<br>• Визуальный Конструктор контрактов и деревьев<br>• Mobile-first верстка и Core Web Vitals | • Vite, PostCSS, Tailwind CSS<br>• HTML5 Semantic, Jinja2<br>• Vanilla JS ES6+, DOM API<br>• Glassmorphism & Helias Design |
| **4** | **`qa_bot`** | **QA & Reliability Engineer** | • Автотесты бэкенда на Pytest (100% критических путей)<br>• Контроль регрессий и граничных условий<br>• Статический анализ (Flake8, Black, MyPy)<br>• Соблюдение правила **«Zero Bad Commits»** | • Pytest, Pytest-asyncio<br>• Flake8, Black, MyPy<br>• Starlette TestClient, httpx<br>• Coverage.py |
| **5** | **`devops_bot`** | **AppSec & DevSecOps Engineer** | • SAST/DAST безопасность (Trivy, Snyk, Bandit)<br>• Защита периметра: WAF, Security Headers (CSP, CORS)<br>• Контейнеризация Docker & Docker Compose<br>• Пред-аудит безопасности под стандарты Standoff 365 / BI.ZONE | • Docker, Dockerfile Security<br>• OWASP Top 10, CSP, HSTS<br>• Trivy, Bandit, Snyk<br>• CI/CD GitHub Actions |
| **6** | **`design_bot`** | **UI/UX Designer & Design System Lead** | • Проектирование дизайн-системы и UI-Kit в Figma<br>• Визуализация «деревьев решений» до этапа верстки<br>• User Journey Mapping и информационная архитектура<br>• Контроль консистентности и микро-анимаций | • Figma Tokens, UI-Kit<br>• Decision Tree Diagrams (Mermaid/SVG)<br>• Helias Dark & Obsidian Aesthetics<br>• Design Token Specs |
| **7** | **`seo_bot`** | **SEO & Content Strategist / UX Copywriter** | • Семантическое ядро под тематику ПКСК и смарт-контрактов<br>• Разметка микроданными (JSON-LD, OpenGraph)<br>• Профессиональный UX-копирайтинг от задачи пользователя<br>• Интеграция аналитики (Яндекс.Метрика, GA4) | • Schema.org (JSON-LD), OpenGraph<br>• Semantic SEO & Keyword Clusters<br>• UX Writing / Microcopy<br>• Yandex Metrika API & GA4 |
| **8** | **`load_bot`** | **Performance & Load QA Specialist** | • Разработка нагрузочных сценариев (Stress, Spike, Soak)<br>• Нагрузочное тестирование на k6 и Locust<br>• Профилирование Uvicorn/FastAPI и оптимизация пула соединений<br>• Мониторинг RPS, p95/p99 latency и стабильности | • k6 (JavaScript load scripts)<br>• Locust, wrk, autocannon<br>• Profiling (py-spy, cProfile)<br>• Prometheus metrics export |
| **9** | **`ai_bot`** | **AI Integration & Prompt Engineer** | • Оркестрация Google Gemini REST API (v1beta)<br>• Паттерн Circuit Breaker (tenacity/pybreaker)<br>• Разработка системных промптов и мета-инструкций<br>• Детерминированный статический fallback при 429/503 | • Gemini REST API (v1beta)<br>• Circuit Breaker (pybreaker, tenacity)<br>• JSON Schema Enforcement<br>• Semantic Reasoning Engine |

---

## 2. Сквозной протокол взаимодействия (Multi-Agent Interaction Protocol)

```
[Пользователь / Рынок / ПКСК]
             │
             ▼
      ┌──────────────┐
      │ pm_bot       │ ◄───► [design_bot] (Figma, Деревья решений)
      │ (Paula)      │ ◄───► [seo_bot]    (Семантика, UX-тексты)
      └──────┬───────┘
             │ (Техническое задание и архитектурная спецификация)
             ├───► [py_bot]   (FastAPI Backend, PostgreSQL, Очереди)
             ├───► [ui_bot]   (Tailwind CSS, Конструктор, JS-виджеты)
             └───► [ai_bot]   (Gemini API, Circuit Breaker, Fallback)
             │
             ▼ (Код и артефакты готовы к испытаниям)
      ┌──────────────┐
      │ qa_bot       │ ──► Pytest + Flake8 + Black + MyPy
      │ load_bot     │ ──► k6 / Locust Нагрузочные испытания
      │ devops_bot   │ ──► SAST/DAST аудит, CSP/CORS, Docker
      └──────┬───────┘
             │
             ▼ (100% Green на Staging + Ручной Gatekeeper Approval)
      ┌──────────────┐
      │ devops_bot   │ ──► Релиз в main, Docker-билд, Standoff-чек
      └──────┬───────┘
             │
             ▼
      [pm_bot (Paula)] ──► Демонстрация и передача в контур ПКСК
```
