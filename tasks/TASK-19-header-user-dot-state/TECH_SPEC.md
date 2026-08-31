# TECH_SPEC.md — Техническая спецификация индикатора статуса сессии (TASK-19)

## 1. Стили и JS логика
- `public/landing_main.css`: `.btn-user-status-dot { display: none; background: #10b981; ... }`
- `public/index.html` и `public/forum_social.js`:
  - `if (token)` $\rightarrow$ `userDot.style.display = 'block'; userDot.style.background = '#10b981'; userDot.style.boxShadow = '0 0 6px #10b981';`
  - `else` $\rightarrow$ `userDot.style.display = 'none';`

## 2. Вердикт
`APPROVED`
