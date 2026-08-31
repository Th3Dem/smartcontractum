# TECH_SPEC.md — Техническая спецификация интеграции 3D Hero лендинга (TASK-14)

## 1. Состав файлов
- `public/index.html` — Главная страница с чистой разметкой без внешних браузерных инъекций.
- `public/landing_main.css` — Базовые стили оболочки портала, хедера, футера и модальных окон.
- `public/hero.css` — Стили 3D spatial cube, дорожной карты, метрик и шрифтов.
- `public/hero_constellation.css` — Стили интерактивного радиального графа созвездий.
- `public/landing_main.js` — Логика меню, навигации и модальных окон.
- `public/hero.js` — Логика 3D параллакса куба, счетчиков и интерактивной дорожной карты.
- `public/hero_constellation.js` — Canvas-движок частиц и связей между узлами платформы.

## 2. Интеграция с сессией
В конце `public/index.html` добавляется скрипт:
```javascript
const userBtn = document.getElementById('headerLoginBtn');
const userLabel = document.getElementById('headerUserLabel');
const userDot = document.getElementById('headerUserDot');
const token = localStorage.getItem('auth_token');
const userProfileRaw = localStorage.getItem('user_profile');

if (token && userProfileRaw) {
    try {
        const u = JSON.parse(userProfileRaw);
        const name = u.displayName || u.firstName || u.email || 'Кабинет';
        if (userLabel) userLabel.textContent = `Кабинет (${name})`;
        if (userBtn) userBtn.setAttribute('href', '/dashboard.html');
        if (userDot) userDot.style.background = '#10b981';
    } catch(e) {
        if (userBtn) userBtn.setAttribute('href', '/dashboard.html');
    }
} else {
    if (userLabel) userLabel.textContent = 'Войти / Регистрация';
    if (userBtn) userBtn.setAttribute('href', '/auth.html');
}
```

## 3. Вердикт
`APPROVED`
