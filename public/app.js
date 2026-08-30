/**
 * SmartContractum — Интерактивная логика авторизации и регистрации
 * Интеграция с официальными реестрами ЕГРЮЛ и ЕГРИП ФНС России (egrul.nalog.ru)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Состояние интерфейса
  let currentMode = 'login'; // 'login' | 'register' | 'forgot'
  let accountType = 'individual'; // 'individual' | 'ip' | 'organization'

  // DOM Элементы навигации
  const tabsContainer = document.getElementById('auth-tabs');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const formForgot = document.getElementById('form-forgot');
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

  // Переключение режимов (Вход / Регистрация / Восстановление)
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
      document.getElementById('auth-title').innerText = 'Вход в личный кабинет';
      document.getElementById('auth-subtitle').innerText = 'Экосистема коммерческих смарт-контрактов';
    } else if (mode === 'register') {
      tabsContainer.style.display = 'flex';
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      formLogin.style.display = 'none';
      formRegister.style.display = 'block';
      formForgot.style.display = 'none';
      document.getElementById('auth-title').innerText = 'Регистрация аккаунта';
      document.getElementById('auth-subtitle').innerText = 'Присоединяйтесь к профессиональному сообществу';
    } else if (mode === 'forgot') {
      tabsContainer.style.display = 'none';
      formLogin.style.display = 'none';
      formRegister.style.display = 'none';
      formForgot.style.display = 'block';
      document.getElementById('auth-title').innerText = 'Восстановление доступа';
      document.getElementById('auth-subtitle').innerText = 'Введите E-mail, указанный при регистрации';
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

  // ===============================================================
  // 1. Поиск Юр. лица в ЕГРЮЛ ФНС России (egrul.nalog.ru)
  // ===============================================================
  async function fetchEgrulData() {
    const cleanInn = innInput.value.trim().replace(/\D/g, '');
    egrulStatus.style.display = 'none';

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
  // 2. Поиск Индивидуального предпринимателя (ИП) в ЕГРИП ФНС РФ
  // ===============================================================
  async function fetchEgripData() {
    const cleanInn = ipInnInput.value.trim().replace(/\D/g, '');
    egripStatus.style.display = 'none';

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
        egripStatus.innerHTML = `✕ ${data.error || 'Индивидуальный предприниматель не найден в ЕГРИП'}`;
        egripStatus.style.display = 'block';
        return;
      }

      const company = data.company;

      if (ipOgrnipInput) ipOgrnipInput.value = company.ogrn || '';

      // Для ИП автозаполняем ФИО, если они извлечены
      if (ipLastNameInput && company.ceoLastName) ipLastNameInput.value = company.ceoLastName;
      if (ipFirstNameInput && company.ceoFirstName) ipFirstNameInput.value = company.ceoFirstName;

      egripStatus.className = 'egrul-status-box success';
      egripStatus.innerHTML = `
        <div><strong>✓ Найдено в ЕГРИП (ФНС России):</strong> ${escapeHtml(company.fullName)}</div>
        <div class="egrul-company-meta">
          Статус: <strong>${escapeHtml(company.statusText)}</strong> • ОГРНИП: ${escapeHtml(company.ogrn)} • ${escapeHtml(company.address)}
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
    innInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchEgrulData();
      }
    });
  }

  if (ipInnInput) {
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

  // Проверка совпадения паролей в реальном времени
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

  // Автоформатирование телефонов
  function formatPhone(input) {
    input.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      if (!x[2]) {
        e.target.value = x[1] ? `+7 (${x[1]}` : '';
      } else {
        e.target.value = `+7 (${x[2]}` + (x[3] ? `) ${x[3]}` : '') + (x[4] ? `-${x[4]}` : '') + (x[5] ? `-${x[5]}` : '');
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

  // Переключение типа субъекта
  btnTypeIndividual.addEventListener('click', () => setAccountType('individual'));
  btnTypeIP.addEventListener('click', () => setAccountType('ip'));
  btnTypeOrg.addEventListener('click', () => setAccountType('organization'));

  // Показ / скрытие пароля (👁)
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

  // Отправка формы регистрации
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearValidationErrors();

    const email = document.getElementById('reg-email').value.trim();
    const password = regPwd.value;
    const passwordConfirm = regPwdConfirm.value;
    const agreement = document.getElementById('reg-agreement').checked;

    // 1. Проверка полей для физ. лица
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

    // 2. Проверка полей для ИП
    if (accountType === 'ip') {
      const ipInn = ipInnInput.value.trim();
      const ipLastName = ipLastNameInput.value.trim();
      const ipFirstName = ipFirstNameInput.value.trim();
      const ipPhone = document.getElementById('reg-ip-phone').value.trim();

      if (!ipInn || ipInn.length !== 12) {
        markInvalid('reg-ip-inn');
        showAlert('ИНН индивидуального предпринимателя должен содержать ровно 12 цифр');
        return;
      }
      if (!ipLastName) {
        markInvalid('reg-ip-lastname');
        showAlert('Пожалуйста, укажите фамилию предпринимателя');
        return;
      }
      if (!ipFirstName) {
        markInvalid('reg-ip-firstname');
        showAlert('Пожалуйста, укажите имя предпринимателя');
        return;
      }
      if (!ipPhone || ipPhone.length < 10) {
        markInvalid('reg-ip-phone');
        showAlert('Пожалуйста, укажите контактный номер телефона');
        return;
      }
    }

    // 3. Проверка полей для юр. лица
    if (accountType === 'organization') {
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
        markInvalid('reg-company');
        showAlert('Пожалуйста, укажите или загрузите из ЕГРЮЛ наименование организации');
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

    // 7. Проверка согласия с 152-ФЗ
    if (!agreement) {
      showAlert('Для завершения регистрации необходимо подтвердить согласие с Условиями использования и 152-ФЗ');
      return;
    }

    const btn = document.getElementById('btn-submit-register');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Создание учетной записи...';

    const accountTypeLabel = accountType === 'organization' ? 'организации' : accountType === 'ip' ? 'индивидуального предпринимателя' : 'физического лица (эксперта)';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showAlert(`Учетная запись для ${accountTypeLabel} успешно создана! На адрес ${email} направлено письмо для подтверждения регистрации.`, 'success');
    }, 800);
  });

  // Отправка формы восстановления
  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearValidationErrors();

    const email = document.getElementById('forgot-email').value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markInvalid('forgot-email');
      showAlert('Пожалуйста, укажите корректный адрес электронной почты (E-mail)');
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
    }, 600);
  });

  // Переключатель тем
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
  });
});
