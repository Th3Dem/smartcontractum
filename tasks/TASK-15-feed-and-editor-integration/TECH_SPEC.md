# TECH_SPEC.md — Техническая спецификация интеграции Ленты и Редактора (TASK-15)

## 1. Структура файлов
- `public/feed.html` — Полнофункциональная страница ленты статей Хабр 2.0.
- `public/editor.html` — Полнофункциональная страница редактора статей.
- `public/forum_social.css` — Стили ленты, категорий, карточек статей и сайдбара.
- `public/forum_editor.css` — Стили редактора, тулбара, подсветки синтаксиса и сплит-экрана.
- `public/forum_social.js` — Логика ленты, фильтрации, лайков, закладок.

## 2. Роутинг в `server.py`
```python
if parsed.path in ["/feed", "/feed/", "/feed.html", "/forum", "/forum.html"]:
    self.serve_static_file(os.path.join(PUBLIC_DIR, "feed.html"))
    return

if parsed.path in ["/editor", "/editor/", "/editor.html"]:
    self.serve_static_file(os.path.join(PUBLIC_DIR, "editor.html"))
    return
```

## 3. Вердикт
`APPROVED`
