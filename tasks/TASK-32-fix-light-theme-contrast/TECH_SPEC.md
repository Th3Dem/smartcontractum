# TECH_SPEC.md — Техническая спецификация исправления контрастности (TASK-32)

## 1. Архитектура темы в CSS
- Все компоненты с фиксированным цветом `#ffffff` получают селекторы `[data-theme="light"] .selector`:
  - `[data-theme="light"] .post-title, [data-theme="light"] .author-name { color: #0f172a !important; }`
  - `[data-theme="light"] .passport-summary-box, [data-theme="light"] .data-specs-grid, [data-theme="light"] .interactive-poll-box { background: #f8fafc; border-color: rgba(203, 213, 225, 0.9); }`
  - `[data-theme="light"] .pass-val, [data-theme="light"] .spec-val, [data-theme="light"] .poll-opt-content { color: #0f172a !important; }`
  - `[data-theme="light"] .article-rich-text { background: #f8fafc; color: #334155; }`
  - `[data-theme="light"] .article-rich-text h3 { color: #0f172a !important; }`
  - `[data-theme="light"] .thread-inner { background: #f1f5f9; }`
  - `[data-theme="light"] .thread-heading, [data-theme="light"] .comment-author-name { color: #0f172a; }`
  - `[data-theme="light"] .comment-bubble { background: #ffffff; color: #1e293b; }`
  - `[data-theme="light"] .sidebar-box-widget { background: #ffffff; }`
  - `[data-theme="light"] .sidebar-widget-title, [data-theme="light"] .bounty-info strong, [data-theme="light"] .leader-details strong, [data-theme="light"] .source-mini-item strong { color: #0f172a !important; }`
  - `[data-theme="light"] .quick-create-modal-card { background: #ffffff; }`
  - `[data-theme="light"] .modal-input-title, [data-theme="light"] .modal-textarea-content, [data-theme="light"] .modal-select-cat, [data-theme="light"] .modal-input-tags, [data-theme="light"] .poll-opt-input { background: #f8fafc; color: #0f172a; border-color: rgba(203, 213, 225, 0.9); }`

## 2. Вердикт
`APPROVED`
