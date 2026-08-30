/**
 * SmartContractum — Интерактивная логика авторизации и регистрации
 * Интеграция с ЕГРЮЛ/ЕГРИП ФНС РФ, Защитная Canvas-капча,
 * Отправка реальных писем с 6-значным кодом подтверждения E-mail
 */

document.addEventListener('DOMContentLoaded', () => {
  // Состояние интерфейса
  let currentMode = 'login'; // 'login' | 'register' | 'forgot' | 'verify-email'
  let accountType = 'individual'; // 'individual' | 'ip' | 'organization'
  let pendingRegistrationEmail = '';
  let emailCountdownInterval = null;

  // Флаги ликвидации / прекращения деятельности
  let isOrgLiquidated = false;
  let isIPLiquidated = false;

  // Активные коды капчи
  let regCaptchaCode = '';
  let forgotCaptchaCode = '';

  // DOM Элементы навигации
  const tabsContainer = document.getElementById('auth-tabs');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const formForgot = document.getElementById('form-forgot');
  const formVerifyEmail = document.getElementById('form-verify-email');
  const alertBox = document.getElementById('auth-alert');
  const themeToggle = document.getElementById('theme-toggle');

  // Выбор типа субъекта (Физлицо, ИП, Юрлицо)
  const btnTypeIndividual = document.getElementById('type-individual');
  const btnTypeIP = document.getElementById('type-ip');
  const btnTypeOrg = document.getElementById('type-organization');
  
  const individualFields = document.querySelectorAll('.individual-only');
  const ipFields = document.querySelectorAll('.ip-only');
  const orgFields = document.querySelectorAll('.org-only');

  // ЕГРЮЛ элементы (Юр. лицо)
  const btnFetchEgrul = document.getElementById('btn-fetch-egrul');
  const innInput = document.getElementById('reg-inn');
  const companyInput = document.getElementById('reg-company');
  const shortNameInput = document.getElementById('reg-short-name');
  const ogrnInput = document.getElementById('reg-ogrn');
  const kppInput = document.getElementById('reg-kpp');
  const egrulStatus = document.getElementById('egrul-status');

  // ЕГРИП элементы (ИП)
  const btnFetchEgrip = document.getElementById('btn-fetch-egrip');
  const ipInnInput = document.getElementById('reg-ip-inn');
  const ipOgrnipInput = document.getElementById('reg-ip-ogrnip');
  const ipLastNameInput = document.getElementById('reg-ip-lastname');
  const ipFirstNameInput = document.getElementById('reg-ip-firstname');
  const ipMiddleNameInput = document.getElementById('reg-ip-middlename');
  const egripStatus = document.getElementById('egrip-status');

  // Пароли и проверка совпадения
  const regPwd = document.getElementById('reg-password');
  const regPwdConfirm = document.getElementById('reg-password-confirm');
  const matchMsg = document.getElementById('password-match-msg');

  // Элементы подтверждения E-mail
  const verifyTargetEmailText = document.getElementById('verify-target-email');
  const emailCodeInput = document.getElementById('email-code-input');
  const emailTimerText = document.getElementById('email-timer-text');
  const btnResendEmail = document.getElementById('btn-resend-email');
  const linkBackToRegister = document.getElementById('link-back-to-register');

  // ===============================================================
  // 0. Защитная графическая капча (Canvas CAPTCHA)
  // ===============================================================
  const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const CAPTCHA_COLORS = ['#2f6fce', '#2f9cad', '#173e6d', '#278565', '#c77c32', '#6366f1'];

  function createCaptcha(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#0b1b30' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    let code = '';
    for (let i = 0; i < 5; i++) {
      code += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
    }

    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)];
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    ctx.font = 'bold 20px Manrope, Inter, sans-serif';
    ctx.textBaseline = 'middle';

    const charSpacing = (width - 24) / 5;
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = 12 + i * charSpacing + Math.random() * 4;
      const y = height / 2 + (Math.random() - 0.5) * 6;
      const angle = (Math.random() - 0.5) * 0.45;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = isDark ? (Math.random() > 0.5 ? '#93c5fd' : '#38bdf8') : CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)];
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    return code;
  }

  function refreshRegCaptcha() {
    regCaptchaCode = createCaptcha('reg-captcha-canvas');
    const input = document.getElementById('reg-captcha-input');
    if (input) input.value = '';
  }

  function refreshForgotCaptcha() {
    forgotCaptchaCode = createCaptcha('forgot-captcha-canvas');
    const input = document.getElementById('forgot-captcha-input');
    if (input) input.value = '';
  }

  const regCaptchaRefreshBtn = document.getElementById('reg-captcha-refresh');
  const regCaptchaCanvas = document.getElementById('reg-captcha-canvas');
  if (regCaptchaRefreshBtn) regCaptchaRefreshBtn.addEventListener('click', refreshRegCaptcha);
  if (regCaptchaCanvas) regCaptchaCanvas.addEventListener('click', refreshRegCaptcha);

  const forgotCaptchaRefreshBtn = document.getElementById('forgot-captcha-refresh');
  const forgotCaptchaCanvas = document.getElementById('forgot-captcha-canvas');
  if (forgotCaptchaRefreshBtn) forgotCaptchaRefreshBtn.addEventListener('click', refreshForgotCaptcha);
  if (forgotCaptchaCanvas) forgotCaptchaCanvas.addEventListener('click', refreshForgotCaptcha);

  refreshRegCaptcha();
  refreshForgotCaptcha();

  // ===============================================================
  // 1. Таймер повторной отправки E-mail кода
  // ===============================================================
  function startEmailTimer(seconds = 60) {
    clearInterval(emailCountdownInterval);
    let remaining = seconds;
    emailTimerText.style.display = 'inline';
    btnResendEmail.style.display = 'none';
    emailTimerText.innerText = `Запросить код повторно через ${remaining} сек.`;

    emailCountdownInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(emailCountdownInterval);
        emailTimerText.style.display = 'none';
        btnResendEmail.style.display = 'inline-block';
      } else {
        emailTimerText.innerText = `Запросить код повторно через ${remaining} сек.`;
      }
    }, 1000);
  }

  // ===============================================================
  // 2. Переключение режимов (Вход / Регистрация / Восстановление / E-mail)
  // ===============================================================
  function setMode(mode) {
    currentMode = mode;
    hideAlert();
    clearValidationErrors();

    if (mode === 'login') {
      tabsContainer.style.display = 'flex';
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
      formForgot.style.display = 'none';
      formVerifyEmail.style.display = 'none';
      document.getElementById('auth-title').innerText = 'Вход в личный кабинет';
      document.getElementById('auth-subtitle').innerText = 'Экосистема коммерческих смарт-контрактов';
    } else if (mode === 'register') {
      tabsContainer.style.display = 'flex';
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      formLogin.style.display = 'none';
      formRegister.style.display = 'block';
      formForgot.style.display = 'none';
      formVerifyEmail.style.display = 'none';
      document.getElementById('auth-title').innerText = 'Регистрация аккаунта';
      document.getElementById('auth-subtitle').innerText = 'Присоединяйтесь к профессиональному сообществу';
      refreshRegCaptcha();
    } else if (mode === 'forgot') {
      tabsContainer.style.display = 'none';
      formLogin.style.display = 'none';
      formRegister.style.display = 'none';
      formForgot.style.display = 'block';
      formVerifyEmail.style.display = 'none';
      document.getElementById('auth-title').innerText = 'Восстановление доступа';
      document.getElementById('auth-subtitle').innerText = 'Введите E-mail, указанный при регистрации';
      refreshForgotCaptcha();
    } else if (mode === 'verify-email') {
      tabsContainer.style.display = 'none';
      formLogin.style.display = 'none';
      formRegister.style.display = 'none';
      formForgot.style.display = 'none';
      formVerifyEmail.style.display = 'block';
      document.getElementById('auth-title').innerText = 'Подтверждение E-mail';
      document.getElementById('auth-subtitle').innerText = 'Остался один шаг для завершения регистрации';
      if (verifyTargetEmailText) verifyTargetEmailText.innerText = pendingRegistrationEmail;
      if (emailCodeInput) {
        emailCodeInput.value = '';
        emailCodeInput.focus();
      }
      startEmailTimer(60);
    }
  }

  // Переключение типа субъекта (3 сегмента)
  function setAccountType(type) {
    accountType = type;
    clearValidationErrors();

    btnTypeIndividual.classList.toggle('active', type === 'individual');
    btnTypeIP.classList.toggle('active', type === 'ip');
    btnTypeOrg.classList.toggle('active', type === 'organization');

    individualFields.forEach(el => el.style.display = type === 'individual' ? 'block' : 'none');
    ipFields.forEach(el => el.style.display = type === 'ip' ? 'block' : 'none');
    orgFields.forEach(el => el.style.display = type === 'organization' ? 'block' : 'none');
  }

  // Уведомления
  function showAlert(message, type = 'error') {
    alertBox.className = `auth-alert ${type}`;
    alertBox.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span> <div>${message}</div>`;
    alertBox.style.display = 'flex';
  }

  function hideAlert() {
    alertBox.style.display = 'none';
  }

  function clearValidationErrors() {
    document.querySelectorAll('.form-input').forEach(input => input.classList.remove('is-invalid'));
  }

  function markInvalid(inputId) {
    const el = document.getElementById(inputId);
    if (el) {
      el.classList.add('is-invalid');
      el.focus();
    }
  }

  function extractFioFromFullName(rawName) {
    if (!rawName) return { lastName: '', firstName: '', middleName: '' };
    let clean = rawName.toUpperCase();
    const prefixes = [
      'ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ',
      'ИП',
      'ГЛАВА КФХ',
      'ГЛАВА КРЕСТЬЯНСКОГО (ФЕРМЕРСКОГО) ХОЗЯЙСТВА',
      'КРЕСТЬЯНСКОЕ (ФЕРМЕРСКОЕ) ХОЗЯЙСТВО'
    ];
    prefixes.forEach(p => { clean = clean.replace(p, ''); });
    clean = clean.replace(/["']/g, '').trim();
    const tokens = clean.split(/\s+/).filter(Boolean);
    
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const lastName = tokens[0] ? capitalize(tokens[0]) : '';
    const firstName = tokens[1] ? capitalize(tokens[1]) : '';
    const middleName = tokens.slice(2).map(capitalize).join(' ');
    return { lastName, firstName, middleName };
  }

  // ===============================================================
  // 3. Поиск Юр. лица в ЕГРЮЛ ФНС России (egrul.nalog.ru)
  // ===============================================================
  async function fetchEgrulData() {
    const cleanInn = innInput.value.trim().replace(/\D/g, '');
    egrulStatus.style.display = 'none';
    isOrgLiquidated = false;

    if (cleanInn.length !== 10) {
      innInput.classList.add('is-invalid');
      egrulStatus.className = 'egrul-status-box error';
      egrulStatus.innerHTML = '✕ ИНН юридического лица должен содержать ровно 10 цифр';
      egrulStatus.style.display = 'block';
      return;
    }

    innInput.classList.remove('is-invalid');
    const originalBtnHTML = btnFetchEgrul.innerHTML;
    btnFetchEgrul.disabled = true;
    btnFetchEgrul.innerHTML = '<span class="spinner-small"></span> Поиск в ЕГРЮЛ...';

    try {
      const response = await fetch(`/api/egrul?inn=${encodeURIComponent(cleanInn)}`);
      const data = await response.json();

      btnFetchEgrul.disabled = false;
      btnFetchEgrul.innerHTML = originalBtnHTML;

      if (!data.success || !data.company) {
        innInput.classList.add('is-invalid');
        egrulStatus.className = 'egrul-status-box error';
        egrulStatus.innerHTML = `✕ ${data.error || 'Организация не найдена в ЕГРЮЛ ФНС России'}`;
        egrulStatus.style.display = 'block';
        return;
      }

      const company = data.company;

      if (company.isLiquidated || company.statusType === 'LIQUIDATED' || company.terminationDate) {
        isOrgLiquidated = true;
        innInput.classList.add('is-invalid');
        companyInput.value = company.fullName || '';
        if (shortNameInput) shortNameInput.value = company.shortName || '';
        if (ogrnInput) ogrnInput.value = company.ogrn || '';
        if (kppInput) kppInput.value = company.kpp || '';

        egrulStatus.className = 'egrul-status-box error';
        egrulStatus.innerHTML = `
          <div><strong>✕ Деятельность прекращена / стадия ликвидации:</strong> ${escapeHtml(company.fullName)}</div>
          <div class="egrul-company-meta" style="color: #ef4444; font-weight: 700; margin-top: 5px;">
            ⚠️ Статус в ЕГРЮЛ: <strong>${escapeHtml(company.statusText)}</strong>.
            ${company.ceoRaw ? `<br>Руководитель / Ликвидатор: ${escapeHtml(company.ceoRaw)}` : ''}
            <br>Регистрация организаций на стадии ликвидации или прекративших деятельность запрещена.
          </div>
        `;
        egrulStatus.style.display = 'block';
        return;
      }

      companyInput.value = company.fullName || '';
      companyInput.classList.remove('is-invalid');

      if (shortNameInput) shortNameInput.value = company.shortName || '';
      if (ogrnInput) ogrnInput.value = company.ogrn || '';
      if (kppInput) kppInput.value = company.kpp || '';

      egrulStatus.className = 'egrul-status-box success';
      egrulStatus.innerHTML = `
        <div><strong>✓ Найдено в ЕГРЮЛ (ФНС России):</strong> ${escapeHtml(company.fullName)}</div>
        <div class="egrul-company-meta">
          Статус: <strong>${escapeHtml(company.statusText)}</strong> • ОГРН: ${escapeHtml(company.ogrn)}${company.kpp ? ` • КПП: ${escapeHtml(company.kpp)}` : ''} • ${escapeHtml(company.address)}
          ${company.ceoRaw ? `<br>Руководитель по реестру: ${escapeHtml(company.ceoRaw)}` : ''}
        </div>
      `;
      egrulStatus.style.display = 'block';

    } catch (err) {
      btnFetchEgrul.disabled = false;
      btnFetchEgrul.innerHTML = originalBtnHTML;
      egrulStatus.className = 'egrul-status-box error';
      egrulStatus.innerHTML = '✕ Ошибка связи с сервисом ЕГРЮЛ ФНС России. Проверьте сеть.';
      egrulStatus.style.display = 'block';
    }
  }

  // ===============================================================
  // 4. Поиск Индивидуального предпринимателя (ИП) в ЕГРИП ФНС РФ
  // ===============================================================
  async function fetchEgripData() {
    const cleanInn = ipInnInput.value.trim().replace(/\D/g, '');
    egripStatus.style.display = 'none';
    isIPLiquidated = false;

    if (cleanInn.length !== 12) {
      ipInnInput.classList.add('is-invalid');
      egripStatus.className = 'egrul-status-box error';
      egripStatus.innerHTML = '✕ ИНН индивидуального предпринимателя должен содержать ровно 12 цифр';
      egripStatus.style.display = 'block';
      return;
    }

    ipInnInput.classList.remove('is-invalid');
    const originalBtnHTML = btnFetchEgrip.innerHTML;
    btnFetchEgrip.disabled = true;
    btnFetchEgrip.innerHTML = '<span class="spinner-small"></span> Поиск в ЕГРИП...';

    try {
      const response = await fetch(`/api/egrul?inn=${encodeURIComponent(cleanInn)}`);
      const data = await response.json();

      btnFetchEgrip.disabled = false;
      btnFetchEgrip.innerHTML = originalBtnHTML;

      if (!data.success || !data.company) {
        ipInnInput.classList.add('is-invalid');
        egripStatus.className = 'egrul-status-box error';
        egripStatus.innerHTML = `✕ ${data.error || 'Индивидуальный предприниматель не найден в реестре ЕГРИП'}`;
        egripStatus.style.display = 'block';
        return;
      }

      const company = data.company;

      if (ipOgrnipInput) {
        ipOgrnipInput.value = company.ogrnip || company.ogrn || '';
        ipOgrnipInput.classList.remove('is-invalid');
      }

      const fio = extractFioFromFullName(company.fullName || company.shortName || '');
      const lastName = company.ipLastName || fio.lastName || company.ceoLastName || '';
      const firstName = company.ipFirstName || fio.firstName || company.ceoFirstName || '';
      const middleName = company.ipMiddleName || fio.middleName || '';

      if (ipLastNameInput) {
        ipLastNameInput.value = lastName;
        ipLastNameInput.classList.remove('is-invalid');
      }
      if (ipFirstNameInput) {
        ipFirstNameInput.value = firstName;
        ipFirstNameInput.classList.remove('is-invalid');
      }
      if (ipMiddleNameInput) {
        ipMiddleNameInput.value = middleName;
        ipMiddleNameInput.classList.remove('is-invalid');
      }

      if (company.isLiquidated || company.statusType === 'LIQUIDATED' || company.terminationDate) {
        isIPLiquidated = true;
        ipInnInput.classList.add('is-invalid');

        egripStatus.className = 'egrul-status-box error';
        egripStatus.innerHTML = `
          <div><strong>✕ Деятельность индивидуального предпринимателя прекращена${company.terminationDate ? ` (дата: ${escapeHtml(company.terminationDate)})` : ''}:</strong> ${escapeHtml(company.fullName)}</div>
          <div class="egrul-company-meta" style="color: #ef4444; font-weight: 700; margin-top: 5px;">
            ⚠️ Регистрация предпринимателей, прекративших деятельность, на платформе запрещена.
          </div>
        `;
        egripStatus.style.display = 'block';
        return;
      }

      egripStatus.className = 'egrul-status-box success';
      egripStatus.innerHTML = `
        <div><strong>✓ Найдено в ЕГРИП (ФНС России):</strong> ${escapeHtml(company.fullName)}</div>
        <div class="egrul-company-meta">
          Статус: <strong>${escapeHtml(company.statusText)}</strong> • ОГРНИП: ${escapeHtml(company.ogrnip || company.ogrn)}${company.registrationDate ? ` • Регистрация: ${escapeHtml(company.registrationDate)}` : ''} • ${escapeHtml(company.address)}
        </div>
      `;
      egripStatus.style.display = 'block';

    } catch (err) {
      btnFetchEgrip.disabled = false;
      btnFetchEgrip.innerHTML = originalBtnHTML;
      egripStatus.className = 'egrul-status-box error';
      egripStatus.innerHTML = '✕ Ошибка связи с сервисом ЕГРИП ФНС России.';
      egripStatus.style.display = 'block';
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  if (btnFetchEgrul) btnFetchEgrul.addEventListener('click', fetchEgrulData);
  if (btnFetchEgrip) btnFetchEgrip.addEventListener('click', fetchEgripData);

  if (innInput) {
    innInput.addEventListener('input', () => {
      companyInput.value = '';
      if (shortNameInput) shortNameInput.value = '';
      if (ogrnInput) ogrnInput.value = '';
      if (kppInput) kppInput.value = '';
      egrulStatus.style.display = 'none';
      isOrgLiquidated = false;
    });

    innInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchEgrulData();
      }
    });
  }

  if (ipInnInput) {
    ipInnInput.addEventListener('input', () => {
      if (ipLastNameInput) ipLastNameInput.value = '';
      if (ipFirstNameInput) ipFirstNameInput.value = '';
      if (ipMiddleNameInput) ipMiddleNameInput.value = '';
      if (ipOgrnipInput) ipOgrnipInput.value = '';
      egripStatus.style.display = 'none';
      isIPLiquidated = false;
    });

    ipInnInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchEgripData();
      }
    });
  }

  // Расчет сложности пароля
  function checkPasswordStrength(password) {
    const meter = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');

    if (!password || password.length === 0) {
      meter.style.width = '0%';
      label.innerText = 'Сложность: —';
      return;
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
    meter.style.width = current.width;
    meter.style.backgroundColor = current.color;
    label.innerText = `Сложность: ${current.text}`;
  }

  // Проверка совпадения паролей
  function validatePasswordMatch() {
    const p1 = regPwd.value;
    const p2 = regPwdConfirm.value;

    if (!p2 || p2.length === 0) {
      matchMsg.style.display = 'none';
      regPwdConfirm.classList.remove('is-invalid');
      return true;
    }

    matchMsg.style.display = 'flex';
    if (p1 === p2) {
      matchMsg.className = 'password-match-status match';
      matchMsg.innerHTML = '✓ Пароли совпадают';
      regPwdConfirm.classList.remove('is-invalid');
      return true;
    } else {
      matchMsg.className = 'password-match-status mismatch';
      matchMsg.innerHTML = '✕ Пароли не совпадают';
      regPwdConfirm.classList.add('is-invalid');
      return false;
    }
  }

  // Автоформатирование телефонов (+7 (XXX) XXX-XX-XX)
  function formatPhone(input) {
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

  ['reg-phone', 'reg-ip-phone', 'reg-org-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) formatPhone(el);
  });

  // Слушатели событий паролей
  if (regPwd) {
    regPwd.addEventListener('input', (e) => {
      checkPasswordStrength(e.target.value);
      if (regPwdConfirm.value.length > 0) validatePasswordMatch();
    });
  }

  if (regPwdConfirm) {
    regPwdConfirm.addEventListener('input', validatePasswordMatch);
  }

  // Слушатели событий табов и ссылок
  tabLogin.addEventListener('click', () => setMode('login'));
  tabRegister.addEventListener('click', () => setMode('register'));
  document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    setMode('register');
  });
  document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    setMode('login');
  });
  document.getElementById('link-forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    setMode('forgot');
  });
  document.getElementById('link-back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    setMode('login');
  });
  if (linkBackToRegister) {
    linkBackToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      setMode('register');
    });
  }

  document.querySelectorAll('.checkbox-label a.link-btn').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showAlert(`Документ «${link.innerText.trim()}» откроется в отдельном окне после утверждения финальной редакции.`, 'info');
    });
  });

  btnTypeIndividual.addEventListener('click', () => setAccountType('individual'));
  btnTypeIP.addEventListener('click', () => setAccountType('ip'));
  btnTypeOrg.addEventListener('click', () => setAccountType('organization'));

  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = '🙈';
        btn.setAttribute('aria-label', 'Скрыть пароль');
      } else {
        input.type = 'password';
        btn.innerText = '👁';
        btn.setAttribute('aria-label', 'Показать пароль');
      }
    });
  });

  // Отправка формы входа
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearValidationErrors();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email) {
      markInvalid('login-email');
      showAlert('Пожалуйста, укажите адрес электронной почты (E-mail)');
      return;
    }

    if (!password) {
      markInvalid('login-password');
      showAlert('Пожалуйста, введите пароль');
      return;
    }

    const btn = formLogin.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Проверка учетных данных...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;

      if (email === 'demo@platform.ru' && password === 'Secret123!') {
        showAlert('Успешная авторизация! Выполняется перенаправление в личный кабинет...', 'success');
      } else {
        markInvalid('login-password');
        showAlert('Неверный адрес электронной почты (E-mail) или пароль');
      }
    }, 600);
  });

  // Отправка формы регистрации -> Отправка РЕАЛЬНОГО проверочного письма на E-mail
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearValidationErrors();

    const email = document.getElementById('reg-email').value.trim();
    const password = regPwd.value;
    const passwordConfirm = regPwdConfirm.value;
    const captchaInput = document.getElementById('reg-captcha-input');
    const captchaVal = captchaInput ? captchaInput.value.trim().toUpperCase() : '';
    const agreement = document.getElementById('reg-agreement').checked;

    // 1. Проверка для физ. лица
    if (accountType === 'individual') {
      const lastName = document.getElementById('reg-lastname').value.trim();
      const firstName = document.getElementById('reg-firstname').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();

      if (!lastName) {
        markInvalid('reg-lastname');
        showAlert('Пожалуйста, укажите фамилию');
        return;
      }
      if (!firstName) {
        markInvalid('reg-firstname');
        showAlert('Пожалуйста, укажите имя');
        return;
      }
      if (!phone || phone.length < 10) {
        markInvalid('reg-phone');
        showAlert('Пожалуйста, укажите контактный номер телефона');
        return;
      }
    }

    // 2. Проверка для ИП
    if (accountType === 'ip') {
      if (isIPLiquidated) {
        markInvalid('reg-ip-inn');
        showAlert('Невозможно завершить регистрацию: деятельность индивидуального предпринимателя прекращена в соответствии с данными ЕГРИП ФНС РФ.');
        return;
      }

      const ipInn = ipInnInput.value.trim();
      const ipLastName = ipLastNameInput.value.trim();
      const ipFirstName = ipFirstNameInput.value.trim();
      const ipPhone = document.getElementById('reg-ip-phone').value.trim();

      if (!ipInn || ipInn.length !== 12) {
        markInvalid('reg-ip-inn');
        showAlert('ИНН индивидуального предпринимателя должен содержать ровно 12 цифр');
        return;
      }
      if (!ipLastName || !ipFirstName) {
        markInvalid('reg-ip-inn');
        showAlert('Пожалуйста, нажмите кнопку «Найти в ЕГРИП» для автоматического заполнения данных предпринимателя');
        return;
      }
      if (!ipPhone || ipPhone.length < 10) {
        markInvalid('reg-ip-phone');
        showAlert('Пожалуйста, укажите контактный номер телефона предпринимателя');
        return;
      }
    }

    // 3. Проверка для юр. лица
    if (accountType === 'organization') {
      if (isOrgLiquidated) {
        markInvalid('reg-inn');
        showAlert('Невозможно завершить регистрацию: деятельность организации прекращена (ликвидирована) в соответствии с данными ЕГРЮЛ ФНС РФ.');
        return;
      }

      const inn = innInput.value.trim();
      const company = companyInput.value.trim();
      const orgLastName = document.getElementById('reg-org-lastname').value.trim();
      const orgFirstName = document.getElementById('reg-org-firstname').value.trim();
      const orgPhone = document.getElementById('reg-org-phone').value.trim();

      if (!inn || inn.length !== 10) {
        markInvalid('reg-inn');
        showAlert('ИНН организации должен состоять ровно из 10 цифр');
        return;
      }
      if (!company) {
        markInvalid('reg-inn');
        showAlert('Пожалуйста, нажмите кнопку «Найти в ЕГРЮЛ» для автоматического заполнения реквизитов организации');
        return;
      }
      if (!orgLastName) {
        markInvalid('reg-org-lastname');
        showAlert('Пожалуйста, укажите фамилию представителя организации');
        return;
      }
      if (!orgFirstName) {
        markInvalid('reg-org-firstname');
        showAlert('Пожалуйста, укажите имя представителя организации');
        return;
      }
      if (!orgPhone || orgPhone.length < 10) {
        markInvalid('reg-org-phone');
        showAlert('Пожалуйста, укажите контактный телефон представителя');
        return;
      }
    }

    // 4. Проверка E-mail
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markInvalid('reg-email');
      showAlert('Пожалуйста, укажите корректный адрес электронной почты (E-mail)');
      return;
    }

    // 5. Проверка сложности и длины пароля
    if (password.length < 8) {
      markInvalid('reg-password');
      showAlert('Пароль учетной записи должен содержать не менее 8 символов');
      return;
    }

    // 6. Проверка совпадения двух паролей
    if (password !== passwordConfirm) {
      markInvalid('reg-password-confirm');
      showAlert('Введенные пароли не совпадают. Пожалуйста, проверьте правильность ввода');
      return;
    }

    // 7. Проверка капчи
    if (!captchaVal || captchaVal !== regCaptchaCode) {
      markInvalid('reg-captcha-input');
      showAlert('Неверно указан защитный код с картинки (капча). Мы обновили код, попробуйте еще раз');
      refreshRegCaptcha();
      return;
    }

    // 8. Проверка согласия с 152-ФЗ
    if (!agreement) {
      showAlert('Для завершения регистрации необходимо подтвердить согласие с Условиями использования и 152-ФЗ');
      return;
    }

    const btn = document.getElementById('btn-submit-register');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Отправка проверочного письма...';

    try {
      const response = await fetch('/api/auth/register-send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          accountType: accountType
        })
      });
      const data = await response.json();

      btn.disabled = false;
      btn.innerHTML = originalText;

      if (!data.success) {
        showAlert(data.error || 'Ошибка при отправке письма с кодом подтверждения');
        return;
      }

      // Переход на экран верификации E-mail
      pendingRegistrationEmail = email;
      setMode('verify-email');
      showAlert(`Письмо с 6-значным проверочным кодом отправлено на адрес ${email}. Пожалуйста, проверьте ваш почтовый ящик.`, 'success');

    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showAlert('Ошибка связи с сервером при отправке письма');
    }
  });

  // Подтверждение E-mail (проверка 6-значного кода)
  formVerifyEmail.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearValidationErrors();

    const code = emailCodeInput.value.trim();

    if (!code || code.length !== 6) {
      markInvalid('email-code-input');
      showAlert('Пожалуйста, введите полный 6-значный проверочный код из электронного письма');
      return;
    }

    const btn = document.getElementById('btn-submit-verify-email');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Проверка кода и создание аккаунта...';

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingRegistrationEmail,
          code: code
        })
      });
      const data = await response.json();

      btn.disabled = false;
      btn.innerHTML = originalText;

      if (!data.success || !data.verified) {
        markInvalid('email-code-input');
        showAlert(data.error || 'Введен неверный проверочный код из письма');
        return;
      }

      // УСПЕХ! Аккаунт активирован
      showAlert('🎉 Поздравляем! Ваш E-mail успешно подтвержден, учетная запись активирована! Выполняется перенаправление...', 'success');
      
      setTimeout(() => {
        setMode('login');
        showAlert('Регистрация успешно завершена. Войдите в личный кабинет, используя указанный E-mail и пароль', 'success');
      }, 1500);

    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showAlert('Ошибка связи с сервером при проверке кода');
    }
  });

  // Повторная отправка кода на E-mail
  if (btnResendEmail) {
    btnResendEmail.addEventListener('click', async (e) => {
      e.preventDefault();
      hideAlert();

      const originalText = btnResendEmail.innerText;
      btnResendEmail.innerText = 'Отправка...';

      try {
        const response = await fetch('/api/auth/register-send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: pendingRegistrationEmail,
            accountType: accountType
          })
        });
        const data = await response.json();
        btnResendEmail.innerText = originalText;

        if (data.success) {
          startEmailTimer(60);
          showAlert(`Новое письмо с проверочным кодом отправлено на адрес ${pendingRegistrationEmail}. Пожалуйста, проверьте почту.`, 'success');
        } else {
          showAlert(data.error || 'Не удалось отправить код повторно');
        }
      } catch (err) {
        btnResendEmail.innerText = originalText;
        showAlert('Ошибка связи с сервером при повторной отправке');
      }
    });
  }

  // Отправка формы восстановления пароля
  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearValidationErrors();

    const email = document.getElementById('forgot-email').value.trim();
    const captchaInput = document.getElementById('forgot-captcha-input');
    const captchaVal = captchaInput ? captchaInput.value.trim().toUpperCase() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markInvalid('forgot-email');
      showAlert('Пожалуйста, укажите корректный адрес электронной почты (E-mail)');
      return;
    }

    if (!captchaVal || captchaVal !== forgotCaptchaCode) {
      markInvalid('forgot-captcha-input');
      showAlert('Неверно указан защитный код с картинки (капча). Мы обновили код, попробуйте еще раз');
      refreshForgotCaptcha();
      return;
    }

    const btn = formForgot.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Отправка запроса...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showAlert(`Инструкции и ссылка для сброса пароля направлены на адрес ${email}`, 'success');
      refreshForgotCaptcha();
    }, 600);
  });

  // Переключатель тем
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
    refreshRegCaptcha();
    refreshForgotCaptcha();
  });
});
