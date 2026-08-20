# 🏛️ Универсальное Инженерное Ядро Команды: `/_core_agents/`

> **Лидер Ядра:** Паула (`pm_bot`) — Chief Orchestrator & Lead System Architect  
> **Миссия Ядра:** Обеспечение архитектурного управления, бэкенд-надежности, 100% покрытия автотестами и безопасности периметра  

---

## 🗂️ Состав Инженерного Ядра (`_core_agents`)

| # | Модуль Ядра | Роль / Назначение | Документы спецификации |
| :-: | :--- | :--- | :--- |
| **1** | [**`/_core_agents/pm_bot/`**](file:///root/projects/smartcontractum/_core_agents/pm_bot/) | **Chief Orchestrator & Lead Architect** (Паула) | • [AGENTS.md](file:///root/projects/smartcontractum/_core_agents/pm_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/_core_agents/pm_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/_core_agents/pm_bot/SOUL.md) |
| **2** | [**`/_core_agents/py_bot/`**](file:///root/projects/smartcontractum/_core_agents/py_bot/) | **Senior Backend Engineer** (FastAPI, PostgreSQL) | • [AGENTS.md](file:///root/projects/smartcontractum/_core_agents/py_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/_core_agents/py_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/_core_agents/py_bot/SOUL.md) |
| **3** | [**`/_core_agents/qa_bot/`**](file:///root/projects/smartcontractum/_core_agents/qa_bot/) | **QA & Reliability Engineer** (Pytest In-Memory) | • [AGENTS.md](file:///root/projects/smartcontractum/_core_agents/qa_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/_core_agents/qa_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/_core_agents/qa_bot/SOUL.md) |
| **4** | [**`/_core_agents/devops_bot/`**](file:///root/projects/smartcontractum/_core_agents/devops_bot/) | **AppSec & DevSecOps Engineer** (Docker, Git Flow) | • [AGENTS.md](file:///root/projects/smartcontractum/_core_agents/devops_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/_core_agents/devops_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/_core_agents/devops_bot/SOUL.md) |

---

## 🎯 Взаимодействие с прикладными агентами проекта (`/agents/`)

Инженерное Ядро `_core_agents/` предоставляет стабильную инфраструктурную платформу, поверх которой работают узкоспециализированные продуктовые агенты в `/agents/` (`ui_bot`, `seo_bot`, `ai_bot`, `load_qa_bot`, `design_bot`).
Паула (`pm_bot`) осуществляет прямое сквозное руководство и подписывает допуск каждого релиза.
