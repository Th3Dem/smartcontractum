# TECH_SPEC.md — Техническая спецификация (TASK-21)

## 1. Изменения в коде
- В `public/feed.html`: удалить `<section class="feed-hero-strip" id="feedHeroStrip">...</section>`.
- `public/forum_social.js`: `initFeedCanvas()` проверяет наличие canvas и безопасно завершается.

## 2. Вердикт
`APPROVED`
