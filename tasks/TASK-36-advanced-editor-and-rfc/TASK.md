# TASK-36: Продвинутый редактор статей, кода смарт-контрактов и RFC-консультаций (Этап 1)

## 1. Паспорт задачи
- **Идентификатор**: `TASK-36`
- **Наименование**: `advanced-editor-and-rfc`
- **Тип задачи**: `Frontend / Authoring Tools / Markdown Engine / REST API Integration`
- **Статус**: `IN_PROGRESS`
- **Ветка**: `feat/TASK-36-advanced-editor-and-rfc`
- **Ответственный PM**: `pm_bot`

---

## 2. Объем выполняемых работ (Scope)
1. **Интерфейс редактора (`public/editor.html`, `public/forum_editor.css`, `public/forum_editor.js`)**:
   - Переключатель типов публикаций: `Статья (article)`, `Вопрос (question)`, `Обсуждение RFC (discussion)`, `Кейс (case)`.
   - Селектор 6 ключевых тематических разделов (`smart-contracts`, `security`, `oracles`, `cbrf-law`, `escrow-b2b`, `marketplace-jobs`).
   - Markdown-редактор с живым предпросмотром (Редактор / Предпросмотр / Сплит).
   - Вставка шаблонов смарт-контрактов (Solidity 0.8.26, ГОСТ прекомпилы, Эскроу по 860.7 ГК РФ, EIP-1153) с оценкой газа.
   - Вставка интерактивных опросов для консультаций RFC.
   - Автосохранение черновиков (`Draft Auto-save`) в `localStorage`.
   - Публикация через `POST /api/feed/posts` с авторизацией и редиректом в ленту.
   - Поддержка темной и светлой тем оформления (Dark / Light).
2. **Интеграция маршрутизации (`server.py`)**:
   - Гарантированная отдача страницы на `/editor`, `/editor/`, `/editor.html`, `/feed/create`.
3. **Автоматизированное тестирование (`tests/test_editor_and_publishing.py`)**:
   - Проверка отдачи HTML страницы редактора.
   - Проверка сквозной публикации статьи через REST API `/api/feed/posts` с кодом смарт-контракта и тегами.
   - 100% успешное прохождение всех тестов платформы.

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [ ] **Product Gate**: `tasks/TASK-36-advanced-editor-and-rfc/PRODUCT_SPEC.md`
- [ ] **Architecture Gate**: `tasks/TASK-36-advanced-editor-and-rfc/TECH_SPEC.md`
- [ ] **UX Gate**: `tasks/TASK-36-advanced-editor-and-rfc/UX_SPEC.md`
- [ ] **Data Gate**: `tasks/TASK-36-advanced-editor-and-rfc/DATA_REVIEW.md`
- [ ] **Security Gate**: `tasks/TASK-36-advanced-editor-and-rfc/SECURITY_REVIEW.md`
- [ ] **QA Gate**: `tasks/TASK-36-advanced-editor-and-rfc/QA_REVIEW.md`
- [ ] **Release Gate**: `tasks/TASK-36-advanced-editor-and-rfc/RELEASE_REPORT.md`
