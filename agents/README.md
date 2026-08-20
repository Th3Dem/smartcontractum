# 👥 Модульная экосистема автономных ИИ-агентов SmartContractum v2.0

> **Проект:** SmartContractum Enterprise Platform  
> **Миссия:** Создание профессиональной экосистемы и моста к ПКСК Банка России  
> **Оркестрация:** Паула (`pm_bot`) — Product Manager & Lead Architect  
> **Статус:** 9 полностью изолированных ролевых модулей  

---

## 🗂️ Навигация по модулям команды агентов

Каждый агент команды вынесен в отдельную изолированную директорию и содержит 3 обязательных спецификационных файла:
* `AGENTS.md` — Ролевая матрица, зоны ответственности, инструменты, входные/выходные контракты и DoD.
* `SETTINGS.md` — Инженерный регламент, стандарты качества, переменные окружения и правила логирования.
* `SOUL.md` — Профессиональная философия, архетип личности, принципы взаимодействия и культура парного программирования.

---

### 📋 Каталог агентов:

| # | Директория агента | Роль / Специализация | Файлы спецификации |
| :-: | :--- | :--- | :--- |
| **1** | [**`agents/pm_bot/`**](file:///root/projects/smartcontractum/agents/pm_bot/) | **Product Manager & Lead Architect** (Паула) | • [AGENTS.md](file:///root/projects/smartcontractum/agents/pm_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/pm_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/pm_bot/SOUL.md) |
| **2** | [**`agents/py_bot/`**](file:///root/projects/smartcontractum/agents/py_bot/) | **Senior Backend Engineer** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/py_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/py_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/py_bot/SOUL.md) |
| **3** | [**`agents/ui_bot/`**](file:///root/projects/smartcontractum/agents/ui_bot/) | **Senior Frontend Engineer** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/ui_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/ui_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/ui_bot/SOUL.md) |
| **4** | [**`agents/qa_bot/`**](file:///root/projects/smartcontractum/agents/qa_bot/) | **QA & Reliability Engineer** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/qa_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/qa_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/qa_bot/SOUL.md) |
| **5** | [**`agents/devops_bot/`**](file:///root/projects/smartcontractum/agents/devops_bot/) | **AppSec & DevSecOps Engineer** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/devops_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/devops_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/devops_bot/SOUL.md) |
| **6** | [**`agents/design_bot/`**](file:///root/projects/smartcontractum/agents/design_bot/) | **UI/UX Designer & Design System Lead** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/design_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/design_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/design_bot/SOUL.md) |
| **7** | [**`agents/seo_bot/`**](file:///root/projects/smartcontractum/agents/seo_bot/) | **SEO & Content Strategist / UX Copywriter** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/seo_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/seo_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/seo_bot/SOUL.md) |
| **8** | [**`agents/load_bot/`**](file:///root/projects/smartcontractum/agents/load_bot/) | **Performance & Load QA Specialist** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/load_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/load_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/load_bot/SOUL.md) |
| **9** | [**`agents/ai_bot/`**](file:///root/projects/smartcontractum/agents/ai_bot/) | **AI Integration & Prompt Engineer** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/ai_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/ai_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/ai_bot/SOUL.md) |

---

## 🔄 Сквозной пайплайн взаимодействия команды под руководством Паулы

```
                     ┌────────────────────────────────┐
                     │ Пользователь / Контур ПКСК ЦБ  │
                     └───────────────┬────────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │         pm_bot (Paula)         │
                     │   Product Manager & Architect  │
                     └───────┬───────────────┬────────┘
                             │               │
            ┌────────────────┴──────┐ ┌──────┴───────────────┐
            ▼                       ▼ ▼                      ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│      design_bot       │ │      seo_bot      │ │         ai_bot         │
│ UI/UX, Деревья решений│ │ Смыслы, Schema.org│ │ Gemini Circuit Breaker │
└───────────┬───────────┘ └─────────┬─────────┘ └────────────┬───────────┘
            │                       │                        │
            └───────────────┬───────┴────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │      Инженерная разработка    │
            │  py_bot (FastAPI/PostgreSQL)  │
            │  ui_bot (Tailwind/CSS 3D/JS)  │
            └───────────────┬───────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │   Автономный аудит качества   │
            │  qa_bot   (100% Pytest Green) │
            │  load_bot (60 FPS, p95 < 350) │
            │  devops_bot (AppSec & Docker) │
            └───────────────┬───────────────┘
                            │
                            ▼
                     ┌────────────────┐
                     │ pm_bot (Paula) │ ──► Release Approval (dev -> staging -> main)
                     └────────────────┘
```
