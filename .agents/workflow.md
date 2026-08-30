### Регламент мультиагентной разработки Antigravity 2.0: Операционное руководство

Настоящий документ определяет целевую архитектуру, конечный автомат состояний, правила маршрутизации и протокол взаимодействия 15 специализированных агентов команды в модели **«Фабрика Продукта» (Product Factory)**.

---

## 1. Контекст платформы и этапы развития

Мы создаем **самостоятельную отраслевую цифровую платформу коммерческих смарт-контрактов** вокруг проектируемой Платформы коммерческих смарт-контрактов Банка России — ПКСК.
> **Важнейшее разграничение**: Платформа **НЕ ЯВЛЯЕТСЯ** ПКСК, платформой цифрового рубля, сервисом Банка России или оператором ПКСК.

Платформа развивается по 5 сквозным этапам, накапливающим единую доменную модель:
- **Этап 1**: Профессиональная социальная сеть, база знаний, рейтинги, подтверждение компетенций, SEO/GEO.
- **Этап 2**: Визуальный конструктор смарт-контрактов (бизнес-логика, события, условия, оракулы).
- **Этап 3**: Рынок поставщиков внешних данных (датасеты, SLA, интеграции).
- **Этап 4**: Маркетплейс готовых коммерческих смарт-контрактов.
- **Этап 5**: Биржа заказов, аудита и профессиональных услуг (заказчики, разработчики, юристы, ИБ).

Все доменные сущности (`User`, `Organization`, `Role`, `Competency`, `Publication`, `Question`, `Answer`, `Case`, `Reputation`, `SmartContractScenario`, `SmartContract`, `DataProvider`, `Dataset`, `Order`, `Project`, `Review`) формируют взаимосвязанный граф знаний и доверия.

---

## 2. Принцип минимальной необходимой сложности и Required Gates

Система не запускает всех 15 агентов на каждую задачу. 
`pm_bot` проводит классификацию и активирует **минимально достаточный набор Required Gates** на основе оценки рисков:

### Обязательное ядро для продуктовых задач:
`pm_bot` $\rightarrow$ `product_bot` $\rightarrow$ `architect_bot` $\rightarrow$ `git_bot (PREPARE)` $\rightarrow$ Разработчик (`frontend_bot` / `py_bot` / `dev_bot`) $\rightarrow$ `qa_bot` $\rightarrow$ `git_bot (PUBLISH)`.

### Условные специализированные гейты (подключаются по необходимости):
- **`ux_bot`**: при изменении интерфейса или пользовательских сценариев $\rightarrow$ артефакт `UX_SPEC.md`.
- **`frontend_bot`**: при необходимости веб-разработки (TypeScript / React / Next.js) $\rightarrow$ `DEV_HANDOVER.md`.
- **`data_bot`**: при изменениях схемы БД, миграциях, полнотекстовом поиске, рейтингах $\rightarrow$ `DATA_REVIEW.md`.
- **`domain_bot`**: при затрагивании тематики ПКСК, смарт-контрактов, регуляторики, официальных терминов $\rightarrow$ `DOMAIN_REVIEW.md`.
- **`seo_bot`**: для публичных индексируемых страниц, базы знаний, каталогов, цитируемости в AI $\rightarrow$ `SEO_AUDIT.md`.
- **`security_bot`**: при изменениях авторизации, RBAC, API, загрузке файлов, PII, приватных данных $\rightarrow$ `SECURITY_REVIEW.md` *(Blocking Gate)*.
- **`moderation_bot`**: при внедрении пользовательского контента, голосований, антифрода, подтверждения компетенций $\rightarrow$ `MODERATION_REVIEW.md`.
- **`ops_bot`**: при операциях развертывания, валидации миграций, деплое на Staging/Production $\rightarrow$ `RELEASE_REPORT.md`.

---

## 3. Матрица маршрутизации задач (Routing Matrix)

| Тип задачи | Обязательные агенты (Core) | Условные агенты (Conditional) | Блокирующие гейты (Blocking Gates) |
|---|---|---|---|
| **Frontend UI фича** | pm, product, architect, ux, frontend, qa, git | seo, moderation | Product, Arch, UX, QA |
| **Backend API сервис** | pm, product, architect, py_bot/dev_bot, qa, git | data, security, domain | Product, Arch, QA, (Security/Data при наличии) |
| **Fullstack продуктовая фича** | pm, product, architect, ux, frontend, py/dev, qa, git | data, domain, seo, security, moderation, ops | Product, Arch, UX, Dev, QA, Security, Staging |
| **Изменение БД / Миграция** | pm, architect, data, py/dev, qa, git | security, ops | Arch, Data, QA, Staging |
| **Поиск и индексация** | pm, product, architect, data, frontend, py/dev, qa, git | seo | Product, Arch, Data, QA |
| **Публичный контент / База знаний** | pm, product, architect, ux, frontend, seo, qa, git | moderation, domain | Product, UX, SEO, QA |
| **Авторизация / RBAC / Права** | pm, product, architect, security, py/dev, frontend, qa, git | data | Product, Arch, Security, QA |
| **Пользовательский контент / Репутация** | pm, product, architect, moderation, data, py/dev, frontend, qa, git | security, seo | Product, Arch, Moderation, Data, QA |
| **Сценарии смарт-контрактов / ПКСК** | pm, product, architect, domain, py/dev, frontend, qa, git | security, data | Product, Arch, Domain, QA, Security |
| **Инфраструктура / Релиз** | pm, architect, ops, git | security | Arch, Ops, Staging |
| **Security Hotfix** | pm, security, py/dev/frontend, qa, git | ops | Security, QA, Staging |
| **Обычный Bugfix** | pm, py/dev/frontend, qa, git | architect, security | QA |
| **Косметическая UI-правка** | pm, frontend, qa, git | - | QA |
| **Документация** | pm, product_bot (или технический писатель), git | domain, seo | Product |

---

## 4. Сквозной пайплайн разработки (End-to-End Pipeline)

```mermaid
flowchart TD
    Human["👤 Human Request"] --> PM_Init["1. pm_bot: Анализ, TASK.md, TASK_STATE.json"]
    
    subgraph DesignPhase ["Этап продуктового и технического проектирования"]
        PM_Init --> Prod["2. product_bot: PRODUCT_SPEC.md"]
        Prod --> Arch["3. architect_bot: TECH_SPEC.md / ADR"]
        Arch -.-> UX["* ux_bot: UX_SPEC.md"]
        Arch -.-> Data["* data_bot: DATA_REVIEW.md"]
        Arch -.-> Domain["* domain_bot: DOMAIN_REVIEW.md"]
    end
    
    DesignPhase --> GitPrep["4. git_bot (MODE: PREPARE): Создание ветки/worktree"]
    
    subgraph DevPhase ["Этап реализации (Изолированная ветка)"]
        GitPrep --> Dev["5. frontend_bot / py_bot / dev_bot (TDD + Код в src/)"]
        Dev --> GateCheck{"Compilation Gate (код выхода 0)"}
        GateCheck -- Ошибка --> Dev
        GateCheck -- Успех --> Handover["DEV_HANDOVER.md"]
    end
    
    subgraph ReviewPhase ["Этап специализированных аудитов и QA"]
        Handover -.-> SEO["* seo_bot: SEO_AUDIT.md"]
        Handover -.-> Sec["* security_bot: SECURITY_REVIEW.md"]
        Handover -.-> Mod["* moderation_bot: MODERATION_REVIEW.md"]
        Handover --> QA["6. qa_bot: Независимый аудит QA_REVIEW.md"]
    end
    
    QA --> GatesVerify{"Все Required Gates APPROVED?"}
    GatesVerify -- "REJECTED" --> Rework["pm_bot: Маршрутизация доработки (REWORK)"] --> Dev
    
    GatesVerify -- "APPROVED" --> GitPub["7. git_bot (MODE: PUBLISH): Commit, Push, PR"]
    GitPub --> CI{"CI Pipeline"}
    CI -- "Сбой" --> CI_Err["tasks/<issue>/CICD_ERRORS.md"] --> Rework
    
    CI -- "CI_GREEN" --> StagingGate{"Нужен Staging?"}
    StagingGate -- "Да" --> StageDeploy["8. ops_bot: Staging Deploy & Smoke/E2E"]
    StageDeploy --> StageCheck{"STAGING_APPROVED?"}
    StageCheck -- "Да" --> ProdDeploy["9. ops_bot: Production Deploy"]
    StageCheck -- "Нет" --> Rework
    StagingGate -- "Нет" --> ProdDeploy
    
    ProdDeploy --> DoneDone["10. pm_bot: Done-Done отчет человеку"]
```

---

## 5. Конечный автомат состояний (State Machine)

Жизненный цикл задачи формализован в детерминированные состояния:

```
CREATED 
  ↓
PRODUCT_REVIEW → PRODUCT_READY (или PRODUCT_REWORK)
  ↓
ARCH_REVIEW → ARCH_READY (или ARCH_REWORK)
  ↓
[UX_REVIEW → UX_READY] (условно)
[DATA_REVIEW → DATA_READY] (условно)
[DOMAIN_REVIEW → DOMAIN_READY] (условно)
  ↓
BRANCH_PREPARATION → BRANCH_READY
  ↓
IMPLEMENTATION → DEV_READY (или DEV_REWORK)
  ↓
[SEO_REVIEW → SEO_READY] (условно)
[SECURITY_REVIEW → SECURITY_READY] (условно, или SECURITY_REWORK)
[MODERATION_REVIEW → MODERATION_READY] (условно)
  ↓
QA_REVIEW → QA_APPROVED (или QA_REWORK)
  ↓
PR_PREPARATION → PR_OPEN
  ↓
CI_RUNNING → CI_GREEN (или CI_FAILED)
  ↓
[STAGING_DEPLOY → STAGING_DEPLOYED → STAGING_VALIDATION → STAGING_APPROVED] (условно)
  ↓
[PRODUCTION_DEPLOY → PRODUCTION_DEPLOYED] (условно)
  ↓
DONE
```

Дополнительные служебные состояния: `HUMAN_ESCALATION`, `BLOCKED`.

---

## 6. Управление состоянием: `WORKLOG.md` и `TASK_STATE.json`

### 1. `WORKLOG.md` — Append-Only Event Log
- Располагается в корне репозитория.
- **Единый автор**: Писать в `WORKLOG.md` имеет право **ТОЛЬКО `pm_bot`**.
- Формат записи: `[ISO-8601 TIMESTAMP] | TASK-ID | AGENT | EVENT | DESCRIPTION`
- Пример: `2026-08-30T22:15:00+03:00 | TASK-042 | product_bot | PRODUCT_READY | Спецификация согласована`

### 2. `tasks/<issue-folder>/TASK_STATE.json` — Machine-Readable State
- Располагается в папке задачи. Управляется исключительно `pm_bot`.
- Схема:
```json
{
  "task": "TASK-042",
  "state": "QA_REVIEW",
  "rework_count": 0,
  "required_gates": {
    "product": true,
    "architecture": true,
    "ux": true,
    "data": true,
    "domain": false,
    "seo": false,
    "security": true,
    "moderation": false,
    "qa": true,
    "staging": true
  }
}
```

---

## 7. Комплект артефактов и правила изоляции файлов

### Правило чистоты репозитория:
1. **Корень проекта**: содержит ТОЛЬКО глобальный `WORKLOG.md`.
2. **Production-код**: создается в штатной структуре (`apps/`, `src/`, `packages/`, `tests/`, `migrations/`, `infra/`).
3. **Все артефакты задачи**: хранятся СТРОГО в `tasks/<issue-folder>/`.

### Состав папки задачи `tasks/<issue-folder>/`:
- `TASK.md` — ТЗ задачи (создает `pm_bot`)
- `TASK_STATE.json` — машиночитаемое состояние (создает `pm_bot`)
- `PRODUCT_SPEC.md` — продуктовая спецификация (создает `product_bot`)
- `TECH_SPEC.md` / `ADR-XXX.md` — техническая спецификация (создает `architect_bot`)
- `UX_SPEC.md` — интерфейсная спецификация (создает `ux_bot`, optional)
- `DATA_REVIEW.md` — аудит модели данных и поиска (создает `data_bot`, optional)
- `DOMAIN_REVIEW.md` — предметный аудит ПКСК (создает `domain_bot`, optional)
- `DEV_HANDOVER.md` — отчет разработчика (создает `frontend_bot`/`py_bot`/`dev_bot`)
- `SEO_AUDIT.md` — поисковый и GEO аудит (создает `seo_bot`, optional)
- `SECURITY_REVIEW.md` — независимый AppSec аудит (создает `security_bot`, optional)
- `MODERATION_REVIEW.md` — аудит доверия и антифрода (создает `moderation_bot`, optional)
- `QA_REVIEW.md` — вердикт функционального тестирования (создает `qa_bot`)
- `pr_body.txt` — проект коммита и PR (создает `git_bot`)
- `CICD_ERRORS.md` — локальный лог сбоя CI задачи (создает `git_bot`, при сбое)
- `RELEASE_REPORT.md` — отчет о выкатке на Staging/Prod (создает `ops_bot`, optional)

---

## 8. Иерархия источников правды (Source of Truth)

```
Концепция продукта и бизнес-цель
       ↓
PRODUCT_SPEC.md (Бизнес-правила и Acceptance Criteria)
       ↓
TECH_SPEC.md / ADR (Архитектурное решение и контракты)
       ↓
TASK.md (Scope, исполнители, Required Gates)
       ↓
Реализация в коде (src/ / apps/)
       ↓
Артефакты аудита (QA, Security, Domain, Data, SEO)
```

- При конфликте кода с `TECH_SPEC.md` $\rightarrow$ возврат на разработку.
- При конфликте `TECH_SPEC.md` с `PRODUCT_SPEC.md` $\rightarrow$ согласование с `product_bot`.
- Запрещено «тихо» менять бизнес-логику в коде без обновления спецификаций.

---

## 9. Критерий качества «Done-Done» (Antigravity 2.0)

Задача считается выполненной (**Done-Done**), только если:
1. Выполнены все требования и подтверждены Acceptance Criteria из `PRODUCT_SPEC.md`.
2. Архитектурные инварианты из `TECH_SPEC.md` полностью соблюдены.
3. Код написан, отформатирован, типизирован, все локальные тесты пройдены.
4. Получен вердикт `APPROVED` во всех назначенных специализированных гейтах (`Security`, `Domain`, `Data`, `SEO`, `Moderation`).
5. Получен вердикт `APPROVED` от независимого `qa_bot`.
6. Ветка смержена через PR, удаленный CI завершился со статусом `CI_GREEN`.
7. Staging-валидация успешно пройдена (если гейт `staging` активен).
8. `TASK_STATE.json` переведен в `DONE`.
9. Финальное событие зафиксировано `pm_bot` в `WORKLOG.md`.

---

## 10. Умная эскалация человеку (Escalation Protocol)

`pm_bot` немедленно останавливает автомат и эскалирует задачу человеку в случаях:
- Задача дважды получила статус `REJECTED` по одной причине (`rework_count >= 2`).
- Требуется изменение границ продукта (Scope Change) или бизнес-компромисс.
- `domain_bot` выявил отсутствие нормативно установленного правила в регулировании ПКСК.
- `security_bot` обнаружил критическую уязвимость, требующую фундаментального изменения модели.
- Возник риск потери или повреждения пользовательских данных при миграции.
- Требуются учетные данные, доступы или юридические решения, которые AI не принимает самостоятельно.
