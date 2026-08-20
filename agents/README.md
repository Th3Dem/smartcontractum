# 🎯 Проектные специализированные агенты: `/agents/`

> **Проект:** SmartContractum Enterprise Platform  
> **Оркестрация:** Паула (`pm_bot`) — Лидер Ядра (`/_core_agents/pm_bot/`)  
> **Назначение каталога:** Узкоспециализированные продуктовые агенты платформы SmartContractum  

---

## 🗂️ Состав прикладных агентов платформы

| # | Директория агента | Роль / Специализация | Файлы спецификации |
| :-: | :--- | :--- | :--- |
| **1** | [**`/agents/ui_bot/`**](file:///root/projects/smartcontractum/agents/ui_bot/) | **Senior Frontend & UI/UX Конструктора** | • [AGENTS.md](file:///root/projects/smartcontractum/agents/ui_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/ui_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/ui_bot/SOUL.md) |
| **2** | [**`/agents/seo_bot/`**](file:///root/projects/smartcontractum/agents/seo_bot/) | **SEO & Content Strategist** (Семантика ПКСК, JSON-LD) | • [AGENTS.md](file:///root/projects/smartcontractum/agents/seo_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/seo_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/seo_bot/SOUL.md) |
| **3** | [**`/agents/ai_bot/`**](file:///root/projects/smartcontractum/agents/ai_bot/) | **AI Integration Engineer** (Оркестрация Gemini, Circuit Breaker) | • [AGENTS.md](file:///root/projects/smartcontractum/agents/ai_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/ai_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/ai_bot/SOUL.md) |
| **4** | [**`/agents/load_qa_bot/`**](file:///root/projects/smartcontractum/agents/load_qa_bot/) | **Load & Performance Specialist** (k6, Locust, 60 FPS) | • [AGENTS.md](file:///root/projects/smartcontractum/agents/load_qa_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/load_qa_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/load_qa_bot/SOUL.md) |
| **5** | [**`/agents/design_bot/`**](file:///root/projects/smartcontractum/agents/design_bot/) | **UI/UX Design System Lead** (CoinMarketCap Tokens) | • [AGENTS.md](file:///root/projects/smartcontractum/agents/design_bot/AGENTS.md)<br>• [SETTINGS.md](file:///root/projects/smartcontractum/agents/design_bot/SETTINGS.md)<br>• [SOUL.md](file:///root/projects/smartcontractum/agents/design_bot/SOUL.md) |

---

## 🏛️ Связь с Универсальным Инженерным Ядром (`/_core_agents/`)

Все прикладные агенты работают под управлением **Паулы (`pm_bot`)** и опираются на базовые инженерные сервисы ядра:
* [**`/_core_agents/pm_bot/`**](file:///root/projects/smartcontractum/_core_agents/pm_bot/) — Главный архитектор и оркестратор.
* [**`/_core_agents/py_bot/`**](file:///root/projects/smartcontractum/_core_agents/py_bot/) — Серверный API и транзакции PostgreSQL.
* [**`/_core_agents/qa_bot/`**](file:///root/projects/smartcontractum/_core_agents/qa_bot/) — Регрессионный контроль и 100% покрытие Pytest.
* [**`/_core_agents/devops_bot/`**](file:///root/projects/smartcontractum/_core_agents/devops_bot/) — Защита периметра и CI/CD деплой.
