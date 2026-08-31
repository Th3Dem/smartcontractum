# TECH_SPEC.md — Техническая спецификация (TASK-31)

## 1. Удаление HTML элементов
- Удаление узлов `#quickCreatorCard` и `.feed-controls-bar` из `public/feed.html`.
- Проверка JS в `public/forum_social.js`: обработчики обращаются к элементам через безопасные проверки `if (element)`.

## 2. Вердикт
`APPROVED`
