# TECH_SPEC.md — Техническая спецификация Инкремента 1 (TASK-34)

## 1. Архитектурные изменения
- **`public/feed.html`**:
  - Обновить навигацию в `.header-nav`: ссылки `Главная` (`/`), `Сообщество` (`/feed` с классом `.active`), `База знаний` (`#topicsList` / `/topics`).
  - Переименовать кнопку `#btnHeroWrite` в `+ Создать` с вызовом `openCreateActionMenu()`.
  - Обновить атрибуты `data-hero-tab` вкладок ленты: `for-you`, `following`, `question`, `article`, `discussion`, `case`.
  - Обновить плейсхолдер инпута `#feedHeroSearchInput` на `Поиск по знаниям, людям и компаниям...`.
  - Реорганизовать разметку сайдбара `.feed-sidebar`:
    1. Модуль `#sidebarDiscussing` («Сейчас обсуждают»);
    2. Модуль `#sidebarUnanswered` («Ждут ответа»);
    3. Модуль `#sidebarExperts` («Эксперты сообщества»);
    4. Модуль `#sidebarHubs` («Популярные хабы»).
- **`public/forum_social.js`**:
  - Обновить логику `applyFilters()` для поддержки вкладок `for-you` (все актуальные), `following` (активность авторов), `question`, `article`, `discussion`, `case`.
  - Обновить живой поиск по атрибутам `data-author`, `data-company`, `data-tags`, а также тексту заголовков и сниппетов.
  - Подключить действия `btn-helpful` (Полезно) и подписки на авторов/темы.
- **`public/forum_social.css`**:
  - Стилизовать кнопку `+ Создать` и новые бейджи типов контента.
  - Стилизовать карточки вопросов «Ждут ответа» в сайдбаре.
  - Обеспечить идеальную адаптацию в Dark и Light темах.

## 2. Вердикт
`APPROVED`
