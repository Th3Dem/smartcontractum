# TASK-33: Перемещение кнопки «Написать» влево и добавление поиска справа от кнопки «Компании»

## 1. Паспорт задачи
- **Идентификатор**: `TASK-33`
- **Наименование**: `hero-nav-reorder-and-search`
- **Тип задачи**: `Frontend & UI / Hero Navigation / Search Integration`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-33-hero-nav-reorder-and-search`

---

## 2. Объем выполненных работ (Scope)
1. **Перекомпоновка навигационного меню в Hero-баннере (`public/feed.html`)**:
   - Перемещена кнопка `.btn-hero-write` («Написать») в крайнюю левую позицию — слева от кнопки «Все».
   - Добавлено поле живого поиска `.feed-hero-search-box` с лупой и кнопкой очистки (✕) справа от кнопки «Компании».
2. **Стилизация (`public/forum_social.css`)**:
   - Оформлено поле поиска с анимацией фокуса, неоновой подсветкой, поддержкой темной и светлой тем.
   - Скорректированы отступы между кнопкой «Написать» и вкладками.
3. **Логика поиска (`public/forum_social.js`)**:
   - Подключен `feedHeroSearchInput` к функции `applyFilters()` для живой фильтрации карточек по тексту.
4. **Тестирование**:
   - 30 / 30 PASSED (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-33-hero-nav-reorder-and-search/RELEASE_REPORT.md` — **APPROVED**

