# TECH_SPEC.md — Техническая спецификация разделителя (TASK-26)

## 1. Разметка и стили
- В `public/feed.html`:
  ```html
  <div class="feed-nav-sep" aria-hidden="true"></div>
  ```
- В `public/forum_social.css`:
  ```css
  .feed-nav-sep {
      width: 1px;
      height: 20px;
      background: linear-gradient(180deg, transparent, rgba(56, 189, 248, 0.4), transparent);
      margin: 0 8px;
      align-self: center;
      flex-shrink: 0;
  }
  ```

## 2. Вердикт
`APPROVED`
