# TECH_SPEC.md — Техническая спецификация позиционирования иконки «глаз» (TASK-09)

## 1. Архитектурные изменения

### 1.1 Разметка `public/dashboard.html`
```html
<div class="form-group">
  <label class="form-label" for="new-password">Новый пароль <span class="req">*</span></label>
  <div class="input-wrapper">
    <input type="password" id="new-password" class="form-input" placeholder="Не менее 8 символов" autocomplete="new-password">
    <button type="button" class="input-suffix-btn btn-toggle-pwd" aria-label="Показать пароль">👁</button>
  </div>
  ...
</div>

<div class="form-group">
  <label class="form-label" for="confirm-new-password">Подтверждение нового пароля <span class="req">*</span></label>
  <div class="input-wrapper">
    <input type="password" id="confirm-new-password" class="form-input" placeholder="Повторите новый пароль" autocomplete="new-password">
    <button type="button" class="input-suffix-btn btn-toggle-pwd" aria-label="Показать пароль">👁</button>
  </div>
  ...
</div>
```

### 1.2 Стили CSS (`public/styles.css`)
```css
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .form-input {
  padding-right: 40px;
}

.input-suffix-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: var(--radius-sm);
  transition: color 0.2s ease;
}
```

### 1.3 Обработчик переключения (`public/dashboard.js`)
```javascript
document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.input-wrapper') || btn.closest('.pwd-input-wrap');
    if (!wrap) return;
    const input = wrap.querySelector('input');
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerText = '🙈';
    } else {
      input.type = 'password';
      btn.innerText = '👁';
    }
  });
});
```
