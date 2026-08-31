/**
 * SmartContractum — Логика личного кабинета (Dashboard v3.2)
 * Боковое меню, построчное изменение реквизитов на вкладке «Основные» и 3-шаговый мастер смены пароля по E-mail коду в «Безопасности»
 */

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('auth_token');

  // 1. Проверка сессии при загрузке
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const loader = document.getElementById('dashboard-loader');
  const app = document.getElementById('dashboard-app');
  const themeToggle = document.getElementById('theme-toggle-dash');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');
  const dashAlert = document.getElementById('dash-alert');
  const securityAlert = document.getElementById('security-alert');

  // Навигация по разделам
  const navItemGeneral = document.getElementById('nav-item-general');
  const navItemSecurity = document.getElementById('nav-item-security');
  const sectionGeneral = document.getElementById('section-general');
  const sectionSecurity = document.getElementById('section-security');

  // Мобильное меню
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const dashSidebar = document.getElementById('dash-sidebar');

  // Элементы мастера смены пароля в разделе "Безопасность"
  const secStepInit = document.getElementById('sec-step-init');
  const secStepCode = document.getElementById('sec-step-code');
  const secStepNewPwd = document.getElementById('sec-step-newpwd');
  const secUserEmail = document.getElementById('sec-user-email');
  const secCodeSentEmail = document.getElementById('sec-code-sent-email');
  const btnInitPwdChange = document.getElementById('btn-init-pwd-change');
  const secCodeInput = document.getElementById('sec-code-input');
  const btnVerifySecCode = document.getElementById('btn-verify-sec-code');
  const btnResendSecCode = document.getElementById('btn-resend-sec-code');
  const btnCancelSecCode = document.getElementById('btn-cancel-sec-code');
  const formSecNewPassword = document.getElementById('form-sec-new-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmNewPasswordInput = document.getElementById('confirm-new-password');
  const newPwdStrengthFill = document.getElementById('new-pwd-strength-fill');
  const newPwdStrengthLabel = document.getElementById('new-pwd-strength-label');
  const newPwdMatchMsg = document.getElementById('new-pwd-match-msg');
  const btnCancelNewPwd = document.getElementById('btn-cancel-newpwd');

  let currentUser = null;
  let currentChangeToken = null;
  let resendTimer = null;
  let resendCountdown = 60;

  // ===============================================================
  // Тема оформления (Dark / Light)
  // ===============================================================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
    if (themeIcon) themeIcon.innerText = theme === 'dark' ? '🌙' : '☀️';
    if (themeLabel) themeLabel.innerText = theme === 'dark' ? 'Темная тема' : 'Светлая тема';
  }

  const savedTheme = localStorage.getItem('app_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ===============================================================
  // Уведомления (Alerts)
  // ===============================================================
  function formatAlertText(message) {
    if (!message) return '';
    return String(message).replace(/^[\s✓✅✔️🎉⚠️🔐🔒🔔💡📌*—–-]+/, '').trim();
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


  // ===============================================================
  // Переключение разделов (Основные / Безопасность)
  // ===============================================================
  function switchSection(section) {
    if (section === 'general') {
      navItemGeneral.classList.add('active');
      navItemSecurity.classList.remove('active');
      sectionGeneral.style.display = 'block';
      sectionSecurity.style.display = 'none';
    } else if (section === 'security') {
      navItemSecurity.classList.add('active');
      navItemGeneral.classList.remove('active');
      sectionSecurity.style.display = 'block';
      sectionGeneral.style.display = 'none';
      resetSecurityWizard();
    }

    if (dashSidebar) dashSidebar.classList.remove('mobile-open');
  }

  if (navItemGeneral) navItemGeneral.addEventListener('click', () => switchSection('general'));
  if (navItemSecurity) navItemSecurity.addEventListener('click', () => switchSection('security'));

  if (btnMobileMenu && dashSidebar) {
    btnMobileMenu.addEventListener('click', () => {
      dashSidebar.classList.toggle('mobile-open');
    });
  }

  // ===============================================================
  // Маска телефона (+7 (XXX) XXX-XX-XX)
  // ===============================================================
  function formatPhoneInput(input) {
    function applyFormat() {
      let raw = input.value;
      if (!raw) return;

      let digits = raw.replace(/\D/g, '');
      if (!digits) {
        input.value = '';
        return;
      }

      if (digits.startsWith('8') || digits.startsWith('7')) {
        digits = digits.substring(1);
      }

      digits = digits.substring(0, 10);
      if (digits.length === 0) {
        input.value = '';
        return;
      }

      let formatted = '+7 ';
      if (digits.length > 0) {
        formatted += '(' + digits.substring(0, Math.min(3, digits.length));
      }
      if (digits.length >= 3) {
        formatted += ') ' + digits.substring(3, Math.min(6, digits.length));
      }
      if (digits.length >= 6) {
        formatted += '-' + digits.substring(6, Math.min(8, digits.length));
      }
      if (digits.length >= 8) {
        formatted += '-' + digits.substring(8, Math.min(10, digits.length));
      }

      input.value = formatted;
    }

    input.addEventListener('input', applyFormat);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        let curPos = input.selectionStart;
        let endPos = input.selectionEnd;

        if (curPos !== endPos) return;

        let val = input.value;
        let charBefore = val[curPos - 1];

        if (charBefore && /\D/.test(charBefore)) {
          e.preventDefault();

          let left = val.substring(0, curPos);
          let right = val.substring(curPos);

          let lastDigitIdx = -1;
          for (let i = left.length - 1; i >= 0; i--) {
            if (/\d/.test(left[i])) {
              lastDigitIdx = i;
              break;
            }
          }

          if (lastDigitIdx !== -1) {
            let digitsOnly = val.replace(/\D/g, '');
            if (digitsOnly.length <= 2) {
              input.value = '';
              return;
            }
            left = left.substring(0, lastDigitIdx) + left.substring(lastDigitIdx + 1);
          } else {
            input.value = '';
            return;
          }

          input.value = left + right;
          applyFormat();
        } else {
          let digitsOnly = val.replace(/\D/g, '');
          if (digitsOnly.length <= 2) {
            e.preventDefault();
            input.value = '';
          }
        }
      }
    });
  }

  // ===============================================================
  // Первоначальная загрузка данных пользователя
  // ===============================================================
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success || !data.user) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      window.location.href = 'index.html';
      return;
    }

    currentUser = data.user;

    // Рендеринг данных профиля
    renderUserProfile(currentUser);

    // Скрываем лоадер и показываем личный кабинет
    loader.style.display = 'none';
    app.style.display = 'flex';

  } catch (err) {
    console.error('Ошибка загрузки профиля:', err);
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
    return;
  }

  // ===============================================================
  // Отображение профиля и построчных кнопок редактирования
  // ===============================================================
  function renderDetailRow(label, value, fieldKey, isEditable = true, isMono = false, isBlogBadge = false) {
    let displayHtml = escapeHtml(value || '—');
    if (isBlogBadge && value) {
      displayHtml = `<span class="blog-title-badge">${escapeHtml(value)}</span>`;
    }
    const monoClass = isMono ? ' mono-num' : '';

    if (!isEditable) {
      return `
        <div class="detail-row" data-field="${fieldKey}">
          <span class="detail-label">${escapeHtml(label)}:</span>
          <div class="detail-val-wrap">
            <span class="detail-val${monoClass}">${displayHtml}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="detail-row" data-field="${fieldKey}">
        <span class="detail-label">${escapeHtml(label)}:</span>
        <div class="detail-val-wrap" id="wrap-view-${fieldKey}">
          <span class="detail-val${monoClass}" id="val-${fieldKey}">${displayHtml}</span>
          <button class="btn-row-edit" data-field="${fieldKey}" title="Изменить ${label.toLowerCase()}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Изменить</span>
          </button>
        </div>
        <div class="detail-edit-wrap" id="wrap-edit-${fieldKey}" style="display: none;">
          <input type="${fieldKey === 'email' ? 'email' : fieldKey === 'phone' ? 'tel' : 'text'}" 
                 class="form-input-inline" 
                 id="input-${fieldKey}" 
                 value="${escapeHtml(value || '')}" 
                 placeholder="Введите ${label.toLowerCase()}"
                 ${fieldKey === 'blog_title' ? 'maxlength="150"' : ''}>
          <div class="inline-actions">
            <button class="btn-inline-save" data-field="${fieldKey}" title="Сохранить">
              <span>✓ Сохранить</span>
            </button>
            <button class="btn-inline-cancel" data-field="${fieldKey}" title="Отмена">
              <span>✕</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderUserProfile(user) {
    currentUser = user;
    const displayName = user.displayName || user.company_short_name || `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.email;
    const typeLabel = user.typeLabel || (user.account_type === 'organization' ? 'Юридическое лицо' : user.account_type === 'ip' ? 'Индивидуальный предприниматель' : 'Физическое лицо');
    const firstLetter = displayName.charAt(0).toUpperCase() || 'У';

    // Шапка профиля
    document.getElementById('prof-display-name').innerText = displayName;
    document.getElementById('prof-type-badge').innerText = typeLabel;
    document.getElementById('prof-avatar').innerText = firstLetter;

    // Боковое меню
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserBadge = document.getElementById('sidebar-user-badge');

    if (sidebarAvatar) sidebarAvatar.innerText = firstLetter;
    if (sidebarUserName) sidebarUserName.innerText = displayName;
    if (sidebarUserBadge) sidebarUserBadge.innerText = typeLabel;

    // Почта в блоке безопасности
    if (secUserEmail) secUserEmail.innerText = user.email;

    const detailsContainer = document.getElementById('prof-details-list');
    detailsContainer.innerHTML = '';

    let formattedDate = user.created_at || 'Сегодня';
    if (user.created_at && user.created_at.includes('T')) {
      const d = new Date(user.created_at);
      formattedDate = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    let rows = '';

    if (user.account_type === 'individual') {
      rows += renderDetailRow('Фамилия', user.last_name, 'last_name', true);
      rows += renderDetailRow('Имя', user.first_name, 'first_name', true);
      rows += renderDetailRow('Отчество', user.middle_name, 'middle_name', true);
      rows += renderDetailRow('Название блога', user.blog_title, 'blog_title', true, false, true);
      rows += renderDetailRow('Контактный телефон', user.phone, 'phone', true, true);
      rows += renderDetailRow('Электронная почта (E-mail)', user.email, 'email', true);
      rows += renderDetailRow('Дата регистрации', formattedDate, 'created_at', false);
    } else if (user.account_type === 'ip') {
      const ipFullName = `ИП ${`${user.ip_last_name || user.last_name || ''} ${user.ip_first_name || user.first_name || ''} ${user.ip_middle_name || user.middle_name || ''}`.trim()}`;
      rows += renderDetailRow('Наименование ИП', ipFullName, 'ip_name', false);
      rows += renderDetailRow('Фамилия', user.ip_last_name || user.last_name, 'last_name', true);
      rows += renderDetailRow('Имя', user.ip_first_name || user.first_name, 'first_name', true);
      rows += renderDetailRow('Отчество', user.ip_middle_name || user.middle_name, 'middle_name', true);
      rows += renderDetailRow('Название блога', user.blog_title, 'blog_title', true, false, true);
      rows += renderDetailRow('ИНН предпринимателя (12 цифр)', user.ip_inn, 'ip_inn', false, true);
      rows += renderDetailRow('ОГРНИП (15 цифр)', user.ip_ogrnip, 'ip_ogrnip', false, true);
      rows += renderDetailRow('Статус в ЕГРИП ФНС РФ', '✓ Действующий предприниматель', 'status_egrip', false);
      rows += renderDetailRow('Контактный телефон', user.phone, 'phone', true, true);
      rows += renderDetailRow('Электронная почта (E-mail)', user.email, 'email', true);
      rows += renderDetailRow('Дата регистрации', formattedDate, 'created_at', false);
    } else if (user.account_type === 'organization') {
      rows += renderDetailRow('Полное наименование', user.company_full_name, 'org_full_name', false);
      rows += renderDetailRow('Сокращенное наименование', user.company_short_name, 'org_short_name', false);
      rows += renderDetailRow('Фамилия представителя', user.rep_last_name || user.last_name, 'last_name', true);
      rows += renderDetailRow('Имя представителя', user.rep_first_name || user.first_name, 'first_name', true);
      rows += renderDetailRow('Название блога', user.blog_title, 'blog_title', true, false, true);
      rows += renderDetailRow('ИНН организации (10 цифр)', user.org_inn, 'org_inn', false, true);
      rows += renderDetailRow('КПП (9 цифр)', user.org_kpp, 'org_kpp', false, true);
      rows += renderDetailRow('ОГРН (13 цифр)', user.org_ogrn, 'org_ogrn', false, true);
      rows += renderDetailRow('Статус в ЕГРЮЛ ФНС РФ', '✓ Действующее юридическое лицо', 'status_egrul', false);
      rows += renderDetailRow('Корпоративный телефон', user.phone, 'phone', true, true);
      rows += renderDetailRow('Электронная почта (E-mail)', user.email, 'email', true);
      rows += renderDetailRow('Дата регистрации', formattedDate, 'created_at', false);
    }

    detailsContainer.innerHTML = rows;

    // Привязка обработчиков инлайн-редактирования
    attachInlineEditHandlers();
  }

  // ===============================================================
  // Логика инлайн-редактирования параметров
  // ===============================================================
  function attachInlineEditHandlers() {
    // 1. Кнопки "Изменить"
    document.querySelectorAll('.btn-row-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const fieldKey = btn.getAttribute('data-field');
        openRowEditor(fieldKey);
      });
    });

    // 2. Кнопки "Отмена"
    document.querySelectorAll('.btn-inline-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const fieldKey = btn.getAttribute('data-field');
        closeRowEditor(fieldKey);
      });
    });

    // 3. Кнопки "Сохранить"
    document.querySelectorAll('.btn-inline-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const fieldKey = btn.getAttribute('data-field');
        submitRowEditor(fieldKey, btn);
      });
    });

    // 4. Горячие клавиши Enter и Escape
    document.querySelectorAll('.form-input-inline').forEach(input => {
      if (input.type === 'tel' || input.id === 'input-phone') {
        formatPhoneInput(input);
      }

      input.addEventListener('keydown', (e) => {
        const fieldKey = input.id.replace('input-', '');
        if (e.key === 'Enter') {
          e.preventDefault();
          const saveBtn = document.querySelector(`.btn-inline-save[data-field="${fieldKey}"]`);
          if (saveBtn) submitRowEditor(fieldKey, saveBtn);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeRowEditor(fieldKey);
        }
      });
    });
  }

  function openRowEditor(fieldKey) {
    const viewWrap = document.getElementById(`wrap-view-${fieldKey}`);
    const editWrap = document.getElementById(`wrap-edit-${fieldKey}`);
    const input = document.getElementById(`input-${fieldKey}`);

    if (viewWrap && editWrap && input) {
      viewWrap.style.display = 'none';
      editWrap.style.display = 'flex';
      input.focus();
      if (input.select) input.select();
    }
  }

  function closeRowEditor(fieldKey) {
    const viewWrap = document.getElementById(`wrap-view-${fieldKey}`);
    const editWrap = document.getElementById(`wrap-edit-${fieldKey}`);
    const input = document.getElementById(`input-${fieldKey}`);

    if (viewWrap && editWrap && input) {
      let originalVal = '';
      if (fieldKey === 'last_name') originalVal = currentUser.last_name || currentUser.ip_last_name || currentUser.rep_last_name || '';
      else if (fieldKey === 'first_name') originalVal = currentUser.first_name || currentUser.ip_first_name || currentUser.rep_first_name || '';
      else if (fieldKey === 'middle_name') originalVal = currentUser.middle_name || currentUser.ip_middle_name || '';
      else if (fieldKey === 'blog_title') originalVal = currentUser.blog_title || '';
      else if (fieldKey === 'phone') originalVal = currentUser.phone || '';
      else if (fieldKey === 'email') originalVal = currentUser.email || '';

      input.value = originalVal;
      input.classList.remove('is-invalid');
      editWrap.style.display = 'none';
      viewWrap.style.display = 'flex';
    }
  }

  async function submitRowEditor(fieldKey, saveBtn) {
    const input = document.getElementById(`input-${fieldKey}`);
    if (!input) return;

    const rawVal = input.value.trim();

    if ((fieldKey === 'last_name' || fieldKey === 'first_name') && !rawVal) {
      input.classList.add('is-invalid');
      showDashAlert('Поле не может быть пустым', 'error');
      input.focus();
      return;
    }

    if (fieldKey === 'phone' && (!rawVal || rawVal.length < 10)) {
      input.classList.add('is-invalid');
      showDashAlert('Укажите корректный номер телефона', 'error');
      input.focus();
      return;
    }

    if (fieldKey === 'email' && (!rawVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawVal))) {
      input.classList.add('is-invalid');
      showDashAlert('Укажите корректный адрес электронной почты', 'error');
      input.focus();
      return;
    }

    input.classList.remove('is-invalid');

    const payload = {};
    if (fieldKey === 'last_name') payload.lastName = rawVal;
    else if (fieldKey === 'first_name') payload.firstName = rawVal;
    else if (fieldKey === 'middle_name') payload.middleName = rawVal;
    else if (fieldKey === 'blog_title') payload.blogTitle = rawVal;
    else if (fieldKey === 'phone') payload.phone = rawVal;
    else if (fieldKey === 'email') payload.email = rawVal.toLowerCase();

    const origBtnHtml = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-small"></span>';

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      saveBtn.disabled = false;
      saveBtn.innerHTML = origBtnHtml;

      if (!data.success || !data.user) {
        showDashAlert(data.error || 'Ошибка при сохранении параметра', 'error');
        return;
      }

      currentUser = data.user;
      localStorage.setItem('user_profile', JSON.stringify(data.user));
      renderUserProfile(data.user);
      showDashAlert('Параметр успешно обновлен!', 'success');


    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origBtnHtml;
      showDashAlert('Ошибка соединения с сервером при сохранении параметра', 'error');
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = String(text);
    return div.innerHTML;
  }

  // ===============================================================
  // Мастер смены пароля в разделе "Безопасность"
  // ===============================================================
  function resetSecurityWizard() {
    if (resendTimer) clearInterval(resendTimer);
    currentChangeToken = null;
    if (secStepInit) secStepInit.style.display = 'block';
    if (secStepCode) secStepCode.style.display = 'none';
    if (secStepNewPwd) secStepNewPwd.style.display = 'none';
    if (secCodeInput) secCodeInput.value = '';
    if (formSecNewPassword) formSecNewPassword.reset();
    if (newPwdStrengthFill) {
      newPwdStrengthFill.style.width = '0%';
      newPwdStrengthFill.style.backgroundColor = 'transparent';
    }
    if (newPwdStrengthLabel) {
      newPwdStrengthLabel.innerText = 'Сложность: —';
    }
    if (newPwdMatchMsg) newPwdMatchMsg.style.display = 'none';

  }

  // ШАГ 1: Запрос кода на E-mail
  if (btnInitPwdChange) {
    btnInitPwdChange.addEventListener('click', async () => {
      btnInitPwdChange.disabled = true;
      const origHtml = btnInitPwdChange.innerHTML;
      btnInitPwdChange.innerHTML = '<span class="spinner-small"></span> Отправка проверочного письма...';

      try {
        const response = await fetch('/api/security/request-password-change', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        btnInitPwdChange.disabled = false;
        btnInitPwdChange.innerHTML = origHtml;

        if (!data.success) {
          showSecurityAlert(data.error || 'Не удалось отправить проверочный код', 'error');
          return;
        }

        // Переходим к шагу 2
        secStepInit.style.display = 'none';
        secStepCode.style.display = 'block';
        if (secCodeSentEmail) secCodeSentEmail.innerText = data.email || (currentUser && currentUser.email) || '';
        if (secCodeInput) {
          secCodeInput.value = '';
          secCodeInput.focus();
        }
        startResendTimer(data.cooldown || 60);
        showSecurityAlert(data.message || 'Проверочный код отправлен на ваш E-mail', 'success');

      } catch (err) {
        btnInitPwdChange.disabled = false;
        btnInitPwdChange.innerHTML = origHtml;
        showSecurityAlert('Ошибка соединения с почтовым сервером', 'error');
      }
    });
  }

  function startResendTimer(seconds = 60) {
    if (resendTimer) clearInterval(resendTimer);
    resendCountdown = seconds;
    if (btnResendSecCode) {
      btnResendSecCode.disabled = true;
      btnResendSecCode.innerText = `Отправить повторно (${resendCountdown})`;
    }

    resendTimer = setInterval(() => {
      resendCountdown -= 1;
      if (resendCountdown <= 0) {
        clearInterval(resendTimer);
        if (btnResendSecCode) {
          btnResendSecCode.disabled = false;
          btnResendSecCode.innerText = 'Отправить код повторно';
        }
      } else {
        if (btnResendSecCode) {
          btnResendSecCode.innerText = `Отправить повторно (${resendCountdown})`;
        }
      }
    }, 1000);
  }

  // Повторная отправка кода
  if (btnResendSecCode) {
    btnResendSecCode.addEventListener('click', async () => {
      btnResendSecCode.disabled = true;
      btnResendSecCode.innerText = 'Отправка...';

      try {
        const response = await fetch('/api/security/request-password-change', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!data.success) {
          btnResendSecCode.disabled = false;
          btnResendSecCode.innerText = 'Отправить код повторно';
          showSecurityAlert(data.error || 'Ошибка повторной отправки', 'error');
          return;
        }

        startResendTimer(data.cooldown || 60);
        showSecurityAlert('Новый проверочный код отправлен на почту', 'success');
      } catch (e) {
        btnResendSecCode.disabled = false;
        btnResendSecCode.innerText = 'Отправить код повторно';
        showSecurityAlert('Ошибка связи с сервером', 'error');
      }
    });
  }

  // ШАГ 2: Проверка кода
  async function submitVerifySecCode() {
    const code = secCodeInput ? secCodeInput.value.trim() : '';
    if (!code || code.length !== 6) {
      showSecurityAlert('Введите 6-значный проверочный код из электронного письма', 'error');
      if (secCodeInput) secCodeInput.focus();
      return;
    }

    const origHtml = btnVerifySecCode.innerHTML;
    btnVerifySecCode.disabled = true;
    btnVerifySecCode.innerHTML = '<span class="spinner-small"></span> Проверка...';

    try {
      const response = await fetch('/api/security/verify-password-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      btnVerifySecCode.disabled = false;
      btnVerifySecCode.innerHTML = origHtml;

      if (!data.success || !data.changeToken) {
        showSecurityAlert(data.error || 'Неверный или просроченный проверочный код', 'error');
        return;
      }

      currentChangeToken = data.changeToken;
      secStepCode.style.display = 'none';
      secStepNewPwd.style.display = 'block';
      if (newPasswordInput) {
        newPasswordInput.value = '';
        newPasswordInput.focus();
      }
      showSecurityAlert('Код подтвержден! Теперь введите новый пароль.', 'success');


    } catch (err) {
      btnVerifySecCode.disabled = false;
      btnVerifySecCode.innerHTML = origHtml;
      showSecurityAlert('Ошибка соединения с сервером при проверке кода', 'error');
    }
  }

  if (btnVerifySecCode) {
    btnVerifySecCode.addEventListener('click', submitVerifySecCode);
  }

  if (secCodeInput) {
    secCodeInput.addEventListener('input', () => {
      secCodeInput.value = secCodeInput.value.replace(/\D/g, '').slice(0, 6);
      if (secCodeInput.value.length === 6) {
        submitVerifySecCode();
      }
    });

    secCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitVerifySecCode();
      }
    });
  }

  // Кнопки отмены
  if (btnCancelSecCode) btnCancelSecCode.addEventListener('click', resetSecurityWizard);
  if (btnCancelNewPwd) btnCancelNewPwd.addEventListener('click', resetSecurityWizard);

  // ШАГ 3: Сохранение нового пароля
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

  if (newPasswordInput && newPwdStrengthFill && newPwdStrengthLabel) {
    newPasswordInput.addEventListener('input', () => {
      const val = newPasswordInput.value;
      const res = calcPasswordStrength(val);
      newPwdStrengthFill.style.width = res.width;
      newPwdStrengthFill.style.backgroundColor = res.color;
      newPwdStrengthLabel.innerText = `Сложность: ${res.label}`;
      checkNewPasswordMatch();
    });
  }


  function checkNewPasswordMatch() {
    if (!confirmNewPasswordInput || !newPwdMatchMsg) return;
    const newPwd = newPasswordInput.value;
    const confirmPwd = confirmNewPasswordInput.value;

    if (!confirmPwd) {
      newPwdMatchMsg.style.display = 'none';
      return;
    }

    newPwdMatchMsg.style.display = 'block';
    if (newPwd === confirmPwd) {
      newPwdMatchMsg.className = 'password-match-status match';
      newPwdMatchMsg.innerText = '✓ Пароли совпадают';
    } else {
      newPwdMatchMsg.className = 'password-match-status mismatch';
      newPwdMatchMsg.innerText = '✕ Пароли не совпадают';
    }
  }

  if (confirmNewPasswordInput) {
    confirmNewPasswordInput.addEventListener('input', checkNewPasswordMatch);
  }

  // Переключение видимости паролей (👁 / 🙈)
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

  if (formSecNewPassword) {
    formSecNewPassword.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentChangeToken) {
        showSecurityAlert('Сессия смены пароля недействительна. Начните сначала.', 'error');
        resetSecurityWizard();
        return;
      }

      const newPassword = newPasswordInput ? newPasswordInput.value : '';
      const confirmPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

      if (!newPassword || newPassword.length < 8) {
        showSecurityAlert('Новый пароль должен содержать не менее 8 символов', 'error');
        if (newPasswordInput) newPasswordInput.focus();
        return;
      }

      if (newPassword !== confirmPassword) {
        showSecurityAlert('Пароли не совпадают', 'error');
        if (confirmNewPasswordInput) confirmNewPasswordInput.focus();
        return;
      }

      const btnSubmit = document.getElementById('btn-save-new-pwd');
      const origHtml = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-small"></span> Обновление...';

      try {
        const response = await fetch('/api/security/change-password-verified', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            changeToken: currentChangeToken,
            newPassword
          })
        });

        const data = await response.json();
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = origHtml;

        if (!data.success) {
          showSecurityAlert(data.error || 'Ошибка смены пароля', 'error');
          return;
        }

        resetSecurityWizard();
        showSecurityAlert('Пароль успешно обновлен!', 'success');


      } catch (err) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = origHtml;
        showSecurityAlert('Ошибка связи с сервером при смене пароля', 'error');
      }
    });
  }

  // ===============================================================
  // Выход из личного кабинета (Logout)
  // ===============================================================
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}

      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      window.location.href = 'index.html';
    });
  }
});
