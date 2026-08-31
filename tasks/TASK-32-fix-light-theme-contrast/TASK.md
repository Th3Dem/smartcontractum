# TASK-32: Полная коррекция контрастности и стилей Светлой темы Ленты (устранение белого текста на белом фоне)

## 1. Паспорт задачи
- **Идентификатор**: `TASK-32`
- **Наименование**: `fix-light-theme-contrast`
- **Тип задачи**: `Frontend & UI / Theme System / Contrast & Legibility Bugfix`
- **Статус**: `COMPLETED`
- **Ветка**: `fix/TASK-32-light-theme-contrast`

---

## 2. Объем выполненных работ (Scope)
1. **Стили Светлой темы (`public/forum_social.css`)**:
   - Переопределены все хардкодные цвета `#ffffff` и `#cbd5e1` для режима `[data-theme="light"]`:
     - Заголовки постов (`.post-title`, `.post-title-link`) -> темный контрастный цвет `#0f172a`.
     - Авторы постов и комментариев (`.author-name`, `.leader-details strong`, `.bounty-info strong`, `.source-mini-item strong`, `.poll-mini-title`).
     - Блоки интерактивных опросов (`.interactive-poll-box`, `.poll-option-btn`, `.poll-opt-content`).
     - Паспорта решений и блоки данных (`.passport-summary-box`, `.pass-val`, `.data-specs-grid`, `.spec-val`).
     - Развернутые статьи и принятые ответы (`.article-rich-text`, `.article-rich-text h3`, `.accepted-answer-box`, `.accepted-answer-body`).
     - Сайдбар и мини-виджеты (`.sidebar-box-widget`, `.sidebar-widget-title`, `.bounty-item`, `.source-mini-item`, `.stage-num`, `.btn-sidebar-secondary`).
     - Ветка комментариев (`.thread-inner`, `.thread-heading`, `.comment-bubble`, `.comment-body`, `.input-comment-text`).
     - Модальное окно публикации (`.quick-create-modal-card`, инпуты, селекты, текстовые поля, футер).
     - Всплывающие подсказки и плашки (`.feed-toast`, `.tag-pill`, `.hub-chip`).
2. **Тестирование**:
   - 30 / 30 PASSED (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-32-fix-light-theme-contrast/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-32-fix-light-theme-contrast/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-32-fix-light-theme-contrast/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-32-fix-light-theme-contrast/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-32-fix-light-theme-contrast/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-32-fix-light-theme-contrast/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-32-fix-light-theme-contrast/RELEASE_REPORT.md` — **APPROVED**

