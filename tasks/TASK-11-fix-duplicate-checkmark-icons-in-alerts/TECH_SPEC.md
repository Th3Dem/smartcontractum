# TECH_SPEC.md — Техническая спецификация очистки уведомлений (TASK-11)

## 1. Архитектура функций отображения уведомлений

### 1.1 `public/dashboard.js`
```javascript
function formatAlertText(message) {
  if (!message) return '';
  return String(message).replace(/^[\s✓✅✔️*]+/, '').trim();
}

function showDashAlert(message, type = 'success') {
  if (!dashAlert) return;
  const cleanMsg = formatAlertText(message);
  dashAlert.className = 'auth-alert ' + type;
  dashAlert.innerHTML = '<span>' + (type === 'error' ? '⚠️' : '✅') + '</span> <div>' + cleanMsg + '</div>';
  dashAlert.style.display = 'flex';
  setTimeout(() => {
    dashAlert.style.display = 'none';
  }, 5000);
}

function showSecurityAlert(message, type = 'success') {
  if (!securityAlert) return;
  const cleanMsg = formatAlertText(message);
  securityAlert.className = 'auth-alert ' + type;
  securityAlert.innerHTML = '<span>' + (type === 'error' ? '⚠️' : '✅') + '</span> <div>' + cleanMsg + '</div>';
  securityAlert.style.display = 'flex';
  setTimeout(() => {
    securityAlert.style.display = 'none';
  }, 6000);
}
```

### 1.2 `public/app.js`
```javascript
function showAlert(message, type = 'error') {
  const cleanMsg = String(message || '').replace(/^[\s✓✅✔️*]+/, '').trim();
  alertBox.className = 'auth-alert ' + type;
  alertBox.innerHTML = '<span>' + (type === 'error' ? '⚠️' : '✅') + '</span> <div>' + cleanMsg + '</div>';
  alertBox.style.display = 'flex';
}
```
