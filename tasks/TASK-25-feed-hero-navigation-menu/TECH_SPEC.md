# TECH_SPEC.md — Техническая спецификация Hero-меню навигации (TASK-25)

## 1. Архитектура компонента
- В `public/feed.html`:
  ```html
  <div class="feed-hero-nav-bar">
      <div class="feed-hero-nav-tabs">
          <button type="button" class="feed-hero-tab is-active" data-hero-tab="all">Все</button>
          <button type="button" class="feed-hero-tab" data-hero-tab="article">Статьи</button>
          <button type="button" class="feed-hero-tab" data-hero-tab="post">Посты</button>
          <button type="button" class="feed-hero-tab" data-hero-tab="news">Новости</button>
          <button type="button" class="feed-hero-tab" data-hero-tab="authors">Авторы</button>
          <button type="button" class="feed-hero-tab" data-hero-tab="companies">Компании</button>
      </div>
      <div class="feed-hero-write-action">
          <button type="button" class="btn-hero-write" id="btnHeroWrite">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
              </svg>
              <span>Написать</span>
          </button>
      </div>
  </div>
  ```
- В `public/forum_social.js`:
  - Добавить обработчик клика для кнопок `.feed-hero-tab`, фильтрующий `.feed-posts-stream` по типам (`article`, `post`, `poll` / `news`, `authors`, `companies`).
  - Добавить обработчик клика на `#btnHeroWrite`, вызывающий открытие модального окна создания `openQuickModal()`.

## 2. Вердикт
`APPROVED`
