# TASK-21: Удаление Hero-баннера и полосы метрик со страницы «Лента»

## 1. Паспорт задачи
- **Идентификатор**: `TASK-21`
- **Наименование**: `feed-remove-hero-strip`
- **Тип задачи**: `Frontend & UI / Layout Streamlining / Feed Header Cleanup`
- **Статус**: `COMPLETED`
- **Ветка**: `feat/TASK-21-feed-remove-hero-strip`

---

## 2. Объем выполненных работ (Scope)
1. **Удаление Hero-баннера (`public/feed.html`)**:
   - Удален блок `<section class="feed-hero-strip" id="feedHeroStrip">...</section>` с бейджем НИР ЦБ РФ, заголовками и блоком метрик (142+ Экспертов, 38 Паспортов, 19 Источников данных, 6 RFC-голосований, 1.2M ₽ Гранты/Баунти).
   - Лента начинается сразу с рабочей области публикаций и сайдбара.
2. **Тестирование**:
   - 30 / 30 PASSED (100% OK).

---

## 3. Матрица обязательных гейтов качества (Required Gates)
- [x] **Product Gate**: `tasks/TASK-21-feed-remove-hero-strip/PRODUCT_SPEC.md` — **APPROVED**
- [x] **Architecture Gate**: `tasks/TASK-21-feed-remove-hero-strip/TECH_SPEC.md` — **APPROVED**
- [x] **UX Gate**: `tasks/TASK-21-feed-remove-hero-strip/UX_SPEC.md` — **APPROVED**
- [x] **Data Gate**: `tasks/TASK-21-feed-remove-hero-strip/DATA_REVIEW.md` — **APPROVED**
- [x] **Security Gate**: `tasks/TASK-21-feed-remove-hero-strip/SECURITY_REVIEW.md` — **APPROVED**
- [x] **QA Gate**: `tasks/TASK-21-feed-remove-hero-strip/QA_REVIEW.md` — **APPROVED**
- [x] **Release Gate**: `tasks/TASK-21-feed-remove-hero-strip/RELEASE_REPORT.md` — **APPROVED**

