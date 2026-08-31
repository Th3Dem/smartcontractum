# TECH_SPEC.md — Техническая спецификация темы оформления (TASK-30)

## 1. Архитектура темы
- В `public/feed.html`:
  - В `<head>` инлайн скрипт:
    ```javascript
    (function() {
      const savedTheme = localStorage.getItem('sc_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    })();
    ```
  - В `.landing-header-container`:
    ```html
    <div class="header-right-group">
        <button type="button" class="btn-theme-toggle" id="btnThemeToggle" title="Переключить тему (Светлая / Темная)" aria-label="Переключить тему оформления">
            <svg class="theme-icon-sun" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
            </svg>
            <svg class="theme-icon-moon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style="display: none;">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <span class="theme-toggle-text">Тема</span>
        </button>
        <div class="header-user-bar">...</div>
    </div>
    ```
- В `public/forum_social.css`:
  - Добавить переменные и переопределения для `[data-theme="light"]`.
- В `public/forum_social.js`:
  - Добавить переключатель темы и синхронизацию состояния иконок.

## 2. Вердикт
`APPROVED`
