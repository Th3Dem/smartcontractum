# Antigravity 2.0 Multi-Agent Development Team

В этой директории содержатся профили ролей, инструкции и операционные регламенты для мультиагентной команды разработки платформы коммерческих смарт-контрактов Antigravity 2.0.

Система построена по принципу **«Фабрики Продукта» (Product Factory)**: каждый агент изолирован в своем контексте, решает строго определенную задачу и взаимодействует через стандартизированные файловые артефакты в папках `tasks/<issue-folder>/`.

---

## Состав команды (15 специализированных ролей)

### Руководство и архитектура (Core Management & Design):
1. **`pm_bot.md`** — Project Manager & Orchestrator (единая точка контакта с человеком, классификация задач, управление конечным автоматом `TASK_STATE.json`, Required Gates, журнал `WORKLOG.md`, Done-Done).
2. **`product_bot.md`** — Senior Product Manager / Business Analyst (выявление целей, User Stories, бизнес-правила, Acceptance Criteria, артефакт `PRODUCT_SPEC.md`).
3. **`architect_bot.md`** — Senior Solution / System Architect (System Design, DDD, API-контракты, транзакционность, артефакты `TECH_SPEC.md` и `ADR-XXX.md`).
4. **`ux_bot.md`** — Senior UX Architect / Product Designer (пользовательские сценарии, матрица состояний Loading/Empty/Error/Forbidden, формы, артефакт `UX_SPEC.md`).

### Разработка (Engineering & Data):
5. **`frontend_bot.md`** — Senior Frontend Developer (TypeScript, React, Next.js, компонентная архитектура, a11y, отчет `DEV_HANDOVER.md`).
6. **`py_bot.md`** — Senior Python Backend Developer (FastAPI, Pydantic, асинхронные сервисы, TDD, отчет `DEV_HANDOVER.md`).
7. **`dev_bot.md`** — Senior Go / System Backend Developer (Go, системная архитектура, конкурентность, высоконагруженные модули, отчет `DEV_HANDOVER.md`).
8. **`data_bot.md`** — Senior Data Architecture, Database & Search Engineer (PostgreSQL, схемы БД, миграции, полнотекстовый поиск, доменная модель платформы, артефакт `DATA_REVIEW.md`).

### Предметная экспертиза, Безопасность и Доверие:
9. **`domain_bot.md`** — PKSK & Smart Contracts Domain Reviewer (регуляторика ПКСК, жизненный цикл смарт-контрактов, фиксация assumptions, артефакт `DOMAIN_REVIEW.md`).
10. **`seo_bot.md`** — SEO & GEO/AEO Specialist (индексация, семантический HTML5, Schema.org JSON-LD, цитируемость в ответах LLM, артефакт `SEO_AUDIT.md`).
11. **`security_bot.md`** — Senior Application Security & Privacy Reviewer (независимый AppSec, RBAC, IDOR, OWASP Top 10, аудит секретов и 152-ФЗ, артефакт `SECURITY_REVIEW.md`).
12. **`moderation_bot.md`** — Trust, Content Quality & Reputation Specialist (антиспам, защита от накруток рейтинга, модерация контента, артефакт `MODERATION_REVIEW.md`).

### Качество, Версионирование и Релиз:
13. **`qa_bot.md`** — Independent Quality Assurance Engineer (независимая проверка Acceptance Criteria, регрессионные, интеграционные и E2E тесты, артефакт `QA_REVIEW.md`).
14. **`git_bot.md`** — GitHub Operations & CI/CD Watchdog (изолированные ветки/worktree до старта, атомарные коммиты, PR, мониторинг CI, артефакты `pr_body.txt`, `CICD_ERRORS.md`).
15. **`ops_bot.md`** — DevOps & Infrastructure Operations (развертывание на Staging/Production, валидация миграций, health checks, rollback, артефакт `RELEASE_REPORT.md`).

---

## Регламент взаимодействия

Полный регламент жизненного цикла, матрицы маршрутизации, конечный автомат состояний и правила изоляции артефактов зафиксированы в [`workflow.md`](./workflow.md).
