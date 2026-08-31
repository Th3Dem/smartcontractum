# TASK-28: Исправление z-index и наложения выпадающего списка «Темы» поверх следующего блока

## 1. Паспорт задачи
- **Идентификатор**: `TASK-28`
- **Наименование**: `fix-topics-dropdown-zindex`
- **Тип задачи**: `Frontend & Bugfix / CSS Stacking Context & Overflow / Z-Index Layering`
- **Статус**: `COMPLETED`
- **Ветка**: `bugfix/TASK-28-fix-topics-dropdown-zindex`

---

## 2. Объем выполненных работ (Scope)
1. **Исправление CSS Stacking Context и Overflow (`public/forum_social.css`)**:
   - На секции `.feed-hero-strip` заменено `overflow: hidden` на `overflow: visible` и задан `z-index: 50`.
   - Для контейнеров `.feed-hero-container`, `.feed-hero-topics-row`, `.feed-topics-dropdown-wrap` установлена возрастающая иерархия z-index.
   - Для выпадающего меню `.feed-topics-menu` задан `z-index: 9999` с непрозрачной стеклянной подложкой (`background: rgba(11, 20, 38, 0.98)`).
2. **Тестирование**:
   - 30 / 30 PASSED (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-28-fix-topics-dropdown-zindex/RELEASE_REPORT.md` — **APPROVED**

