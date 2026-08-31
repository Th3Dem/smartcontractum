# TECH_SPEC.md — Техническая спецификация навигации Hero (TASK-33)

## 1. Разметка и обработчики
- В `public/feed.html`:
  - Переместить `<button class="btn-hero-write" id="btnHeroWrite">` внутрь `.feed-hero-nav-tabs` перед `<button data-hero-tab="all">`.
  - Добавить `<div class="feed-hero-search-box" id="feedHeroSearchBox">` после `<button data-hero-tab="companies">`.
- В `public/forum_social.js`:
  - Подключить `feedHeroSearchInput` к событию `input` для обновления `activeSearch` и вызова `applyFilters()`.

## 2. Вердикт
`APPROVED`
