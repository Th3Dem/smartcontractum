# 🏛️ SmartContractum — Платформа & Мост к ПКСК Банка России

> **Версия:** 2.0.0 (Enterprise Architecture Baseline)  
> **Организация:** SmartContractum  
> **Лицензионный контур:** Umbrella-интегратор для независимых разработчиков и бизнеса  
> **Команда:** 9 автономных специализированных ИИ-агентов

---

## 📌 О проекте

**SmartContractum** — это высокотехнологичная веб-платформа и профессиональная среда, выступающая официальным технологическим и правовым мостом к **Платформе Конструктор Смарт-Контрактов (ПКСК) Банка России**.

Платформа позволяет компаниям, банкам и независимым разработчикам проектировать, верифицировать, визуализировать в виде «деревьев решений» и выводить смарт-контракты в защищенный регуляторный периметр.

---

## 📁 Структура репозитория

```
smartcontractum/
├── backend/                  # FastAPI 0.115+, Python 3.12, PostgreSQL, Redis, Uvicorn
│   ├── app.py                # Точка входа ASGI-приложения и маршрутизация
│   └── requirements.txt      # Зависимости бэкенда
├── frontend/                 # Vite, PostCSS, Tailwind CSS, Jinja2, Vanilla JS
│   ├── package.json          # Конфигурация сборки
│   └── tailwind.config.js    # Настройки дизайн-системы и цветовых токенов
├── docs/                     # Документация, Паспорт контракта, регуляторные спецификации
│   └── PASSPORT.md           # Архитектурный паспорт смарт-контракта
├── tests/                    # Комплексная пирамида автоматического тестирования
│   ├── unit/                 # Pytest юнит- и API-тесты бэкенда
│   ├── e2e/                  # Playwright сквозные сценарии
│   └── load/                 # k6 нагрузочные сценарии
├── .github/workflows/        # CI/CD автоматизация (Staging Gate Protocol)
│   └── ci.yml                # Сквозной пайплайн валидации
├── AGENTS.md                 # Ролевая матрица 9 специализированных агентов
├── SETTINGS.md               # Enterprise-стек, Circuit Breaker и релизный протокол
└── SOUL.md                   # ДНК проекта, миссия Umbrella-интегратора и стандарты качества
```

---

## 👥 Ролевая матрица команды агентов (9 агентов)

1. **`pm_bot` (Paula)** — Product Manager & Lead Architect
2. **`py_bot`** — Senior Backend Engineer (FastAPI / PostgreSQL / Redis)
3. **`ui_bot`** — Senior Frontend Engineer (Vite / Tailwind / Vanilla JS)
4. **`qa_bot`** — QA & Reliability Engineer (Pytest / Zero Bad Commits)
5. **`devops_bot`** — AppSec & DevSecOps Engineer (SAST/DAST / Standoff 365 Audit)
6. **`design_bot`** — UI/UX Designer & Design System Lead (Figma / Деревья решений)
7. **`seo_bot`** — SEO & Content Strategist / UX Copywriter (ПКСК семантика / Schema.org)
8. **`load_bot`** — Performance & Load QA Specialist (k6 / Locust нагрузочные тесты)
9. **`ai_bot`** — AI Integration & Prompt Engineer (Gemini Circuit Breaker / Fallback)

---

## 🚦 Релизный маршрут (Staging Gate Protocol)

```
feat/* ──► dev ──► staging ──► main (Production)
```
Прямой мердж в `main` заблокирован. Релиз разрешен только после 100% зеленого отчета тестов (Pytest + Playwright + k6) и подписи Gatekeeper.
