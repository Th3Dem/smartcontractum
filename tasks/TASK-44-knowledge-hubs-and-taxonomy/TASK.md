# TASK-44: Хабы базы знаний, тематические страницы и структурированная таксономия (Этап 1)

## 1. Паспорт задачи
- **Идентификатор**: `TASK-44`
- **Наименование**: `knowledge-hubs-and-taxonomy`
- **Тип задачи**: `Fullstack / Knowledge Taxonomy / Hubs Engine / SEO & GEO Optimization`
- **Статус**: `IN_PROGRESS`
- **Ветка**: `feat/TASK-44-knowledge-hubs-and-taxonomy`
- **Ответственный PM**: `pm_bot`

---

## 2. Объем выполняемых работ (Scope)
1. **База данных (`db.py`)**:
   - Реализовать методы агрегации статистики по 6 ключевым хабам экосистемы (`get_hubs_list()`, `get_hub_details(slug)`).
   - Хабы:
     1. `smart-contracts` (EVM, Solidity, Yul, оптимизация газа)
     2. `security` (Аудит ИБ, формальная верификация, ГОСТ)
     3. `oracles` (Оракулы данных, ЕГРЮЛ, внешние API)
     4. `cbrf-law` (Право, ст. 860.7 ГК РФ, Банк России, ЦФА)
     5. `escrow-b2b` (Смарт-эскроу, 1С:Предприятие, закрывающие акты)
     6. `marketplace-jobs` (Биржа заказов, проектные команды)
2. **Серверный слой (`server.py`)**:
   - Маршрутизация страницы хабов `/hubs`, `/hubs/`, `/hubs.html`.
   - REST API:
     - `GET /api/hubs` — список всех хабов с агрегированной статистикой (статьи, вопросы, эксперты).
     - `GET /api/hubs/<slug>` — детальная информация о хабе, его публикации и топ авторов.
3. **Клиентский интерфейс (`public/hubs.html`, `public/hubs.js`)**:
   - Витрина 6 тематических хабов с интерактивными счетчиками, тегами, лучшими материалами и экспертами.
   - Фильтрация публикаций по выбранному хабу с переходом в ленту или модальным просмотром.
   - Поддержка темной и светлой тем оформления (Dark / Light).
4. **Интеграция навигации**:
   - Связка ссылки `База знаний` в шапке (`feed.html`, `experts.html`, `index.html`) с разделом `/hubs`.
5. **Тестирование (`tests/test_hubs_and_taxonomy.py`)**:
   - Автоматизированные тесты БД, REST API и маршрутизации.
   - 100% успешное прохождение всех тестов платформы.

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [ ] **Product Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/PRODUCT_SPEC.md`
- [ ] **Architecture Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/TECH_SPEC.md`
- [ ] **UX Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/UX_SPEC.md`
- [ ] **Data Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/DATA_REVIEW.md`
- [ ] **Security Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/SECURITY_REVIEW.md`
- [ ] **QA Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/QA_REVIEW.md`
- [ ] **Release Gate**: `tasks/TASK-44-knowledge-hubs-and-taxonomy/RELEASE_REPORT.md`
