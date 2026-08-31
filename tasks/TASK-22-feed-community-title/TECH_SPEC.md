# TECH_SPEC.md — Техническая спецификация заголовка сообщества (TASK-22)

## 1. Разметка и стили
- В `public/feed.html`:
  ```html
  <div class="feed-page-header-box">
      <h1 class="feed-page-headline">
          <span class="hero-title-opt4-white">Сообщество</span> <span class="hero-title-opt4-electric">Smart</span><span class="hero-title-opt4-emerald">Contractum</span>
      </h1>
  </div>
  ```
- В `public/forum_social.css`:
  ```css
  .feed-page-header-box {
      margin-bottom: 24px;
  }
  .feed-page-headline {
      font-family: 'Manrope', sans-serif;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
      line-height: 1.2;
  }
  ```

## 2. Вердикт
`APPROVED`
