# TECH_SPEC.md — Техническая спецификация кнопки выхода в шапке (TASK-18)

## 1. Логика работы фронтенда
- В `public/index.html` и `public/forum_social.js`:
  ```javascript
  const userBtn = document.getElementById('headerLoginBtn');
  const userLabel = document.getElementById('headerUserLabel');
  const userDot = document.getElementById('headerUserDot');
  const token = localStorage.getItem('auth_token');

  if (token) {
      if (userLabel) userLabel.textContent = 'Выйти';
      if (userDot) userDot.style.background = '#ef4444';
      if (userBtn) {
          userBtn.setAttribute('href', '#logout');
          userBtn.setAttribute('title', 'Выйти из аккаунта');
          userBtn.onclick = function(e) {
              e.preventDefault();
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_profile');
              localStorage.removeItem('user');
              window.location.reload();
          };
      }
  } else {
      if (userLabel) userLabel.textContent = 'Войти / Регистрация';
      if (userBtn) {
          userBtn.setAttribute('href', '/auth.html');
          userBtn.setAttribute('title', 'Войти в личный кабинет');
          userBtn.onclick = null;
      }
  }
  ```

## 2. Вердикт
`APPROVED`
