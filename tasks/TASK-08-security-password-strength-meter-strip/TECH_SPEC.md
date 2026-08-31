# TECH_SPEC.md — Техническая спецификация полосы сложности пароля (TASK-08)

## 1. Архитектура компонентов

### 1.1 HTML-структура (`public/dashboard.html`)
```html
<div class="form-group">
  <label class="form-label" for="new-password">Новый пароль <span class="req">*</span></label>
  <div class="pwd-input-wrap">
    <input type="password" id="new-password" class="form-input" placeholder="Не менее 8 символов" autocomplete="new-password">
    <button type="button" class="btn-toggle-pwd" aria-label="Показать пароль">👁</button>
  </div>
  <div class="strength-meter">
    <div class="strength-bar-track">
      <div id="new-pwd-strength-fill" class="strength-bar-fill"></div>
    </div>
    <div class="strength-text">
      <span id="new-pwd-strength-label">Сложность: —</span>
      <span>Мин. 8 знаков, заглавная буква, цифра</span>
    </div>
  </div>
</div>
```

### 1.2 CSS-классы (`public/styles.css` / `public/dashboard.css`)
- `.strength-meter` (`margin-top: 8px;`)
- `.strength-bar-track` (`height: 4px; background: var(--bg-card-border); border-radius: 99px; overflow: hidden; margin-bottom: 5px;`)
- `.strength-bar-fill` (`height: 100%; width: 0%; border-radius: 99px; transition: width 0.3s ease, background-color 0.3s ease;`)
- `.strength-text` (`font-size: 11.5px; display: flex; justify-content: space-between; color: var(--text-muted); font-weight: 500;`)

### 1.3 Логика расчета (`public/dashboard.js`)
```javascript
function calcPasswordStrength(password) {
  if (!password || password.length === 0) {
    return { width: '0%', color: 'transparent', label: '—' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-ZА-Я]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  const levels = [
    { width: '25%', color: '#EF4444', text: 'Слабый' },
    { width: '50%', color: '#F59E0B', text: 'Средний' },
    { width: '75%', color: '#3B82F6', text: 'Хороший' },
    { width: '100%', color: '#10B981', text: 'Надежный' }
  ];

  const current = levels[score - 1] || levels[0];
  return { width: current.width, color: current.color, label: current.text };
}
```
