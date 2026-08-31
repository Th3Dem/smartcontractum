# TECH_SPEC.md — Техническая спецификация редактора статей (TASK-36)

## 1. Архитектура клиентского редактора (`public/forum_editor.js`)
- **Режимы отображения**: `editor` (только редактор), `preview` (только предпросмотр), `split` (двухколоночный режим).
- **Парсер Markdown**: преобразование заголовков, списков, цитат, блоков кода ````solidity ... ```` и тегов опросов.
- **Интеграция с API**:
  - `POST /api/feed/posts`: передача `{ title, type, category, tags, content, code_snippet, authorName }`.
  - Авторизация через заголовок `Authorization: Bearer <token>` из `localStorage.getItem('auth_token')`.
- **Автосохранение**: таймер с дебаунсом 1 сек, сохраняющий состояние формы в `localStorage.getItem('sc_editor_draft')`.

## 2. Вердикт
`APPROVED`
