/**
 * SmartContractum — Интерактивная логика авторизации и регистрации
 */

document.addEventListener('DOMContentLoaded', () => {
  // База данных ЕГРЮЛ для демонстрации и поиска
  const EGRUL_REGISTRY = {
    '7707083893': {
      inn: '7707083893',
      ogrn: '1027700132195',
      fullName: 'Публичное акционерное общество «Сбербанк России»',
      shortName: 'ПАО Сбербанк',
      statusText: 'Действующая организация',
      address: 'г. Москва, ул. Вавилова, д. 19',
      ceoLastName: 'Греф',
      ceoFirstName: 'Герман'
    },
    '7736207543': {
      inn: '7736207543',
      ogrn: '1027700229193',
      fullName: 'Общество с ограниченной ответственностью «ЯНДЕКС»',
      shortName: 'ООО «ЯНДЕКС»',
      statusText: 'Действующая организация',
      address: 'г. Москва, ул. Льва Толстого, д. 16',
      ceoLastName: 'Савиновский',
      ceoFirstName: 'Артем'
    },
    '7710140679': {
      inn: '7710140679',
      ogrn: '1027739642281',
      fullName: 'Акционерное общество «ТБанк»',
      shortName: 'АО «ТБанк»',
      statusText: 'Действующая организация',
      address: 'г. Москва, ул. Хуторская 2-Я, д. 38А, стр. 26',
      ceoLastName: 'Близнюк',
      ceoFirstName: 'Станислав'
    },
    '7736050003': {
      inn: '7736050003',
      ogrn: '1027700070518',
      fullName: 'Публичное акционерное общество «Газпром»',
      shortName: 'ПАО «Газпром»',
      statusText: 'Действующая организация',
      address: 'г. Санкт-Петербург, Лахтинский пр-кт, д. 2, к. 3, стр. 1',
      ceoLastName: 'Миллер',
      ceoFirstName: 'Алексей'
    },
    '9705118142': {
      inn: '9705118142',
      ogrn: '1187746473060',
      fullName: 'Общество с ограниченной ответственностью «Финтех Смарт Системы»',
      shortName: 'ООО «Финтех Смарт Системы»',
      statusText: 'Действующая организация',
      address: 'г. Москва, Пресненская наб., д. 12, эт. 45',
      ceoLastName: 'Смирнов',
      ceoFirstName: 'Дмитрий'
    }
  };

  // Состояние интерфейса
  let currentMode = 'login'; // 'login' | 'register' | 'forgot'
  let accountType = 'individual'; // 'individual' | 'organization'

  // DOM Элементы
  const tabsContainer = document.getElementById('auth-tabs');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const formForgot = document.getElementById('form-forgot');
  const alertBox = document.getElementById('auth-alert');
  const themeToggle = document.getElementById('theme-toggle');

  // Выбор субъекта
  const btnTypeIndividual = document.getElementById('type-individual');
  const btnTypeOrg = document.getElementById('type-organization');
  const orgFields = document.querySelectorAll('.org-only');
  const individualFields = document.querySelectorAll('.individual-only');

  // ЕГРЮЛ элементы
  const btnFetchEgrul = document.getElementById('btn-fetch-egrul');
  const innInput = document.getElementById('reg-inn');
  const companyInput = document.getElementById('reg-company');
  const egrulStatus = document.getElementById('egrul-status');

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

  // Переключение типа субъекта
  function setAccountType(type) {
    accountType = type;
    clearValidationErrors();
    if (type === 'individual') {
      btnTypeIndividual.classList.add('active');
      btnTypeOrg.classList.remove('active');
      individualFields.forEach(el => el.style.display = 'block');
      orgFields.forEach(el => el.style.display = 'none');
    } else {
      btnTypeIndividual.classList.remove('active');
      btnTypeOrg.classList.add('active');
      individualFields.forEach(el => el.style.display = 'none');
      orgFields.forEach(el => el.style.display = 'block');
    }
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

  // Поиск по ИНН в ЕГРЮЛ (ФНС России)
  async function fetchEgrulData() {
    const cleanInn = innInput.value.trim().replace(/\D/g, '');
    egrulStatus.style.display = 'none';

    if (cleanInn.length !== 10 && cleanInn.length !== 12) {
      innInput.classList.add('is-invalid');
      egrulStatus.className = 'egrul-status-box error';
      egrulStatus.innerHTML = '✕ Введите корректный ИНН (10 цифр для юридических лиц или 12 для ИП)';
      egrulStatus.style.display = 'block';
      return;
    }

    innInput.classList.remove('is-invalid');
    const originalBtnHTML = btnFetchEgrul.innerHTML;
    btnFetchEgrul.disabled = true;
    btnFetchEgrul.innerHTML = '<span class="spinner-small"></span> Поиск...';

    setTimeout(() => {
      btnFetchEgrul.disabled = false;
      btnFetchEgrul.innerHTML = originalBtnHTML;

      if (cleanInn === '0000000000' || cleanInn === '1111111111') {
        egrulStatus.className = 'egrul-status-box error';
        egrulStatus.innerHTML = '✕ Организация с указанным ИНН не найдена в реестре ЕГРЮЛ ФНС России';
        egrulStatus.style.display = 'block';
        return;
      }

      // Получаем компанию из реестра или генерируем корректную карточку
      let company = EGRUL_REGISTRY[cleanInn];
      if (!company) {
        const isIP = cleanInn.length === 12;
        company = {
          inn: cleanInn,
          ogrn: isIP ? '3' + cleanInn.padEnd(14, '0') : '1' + cleanInn.padEnd(12, '0'),
          fullName: isIP ? `Индивидуальный предприниматель (ИНН ${cleanInn})` : `Общество с ограниченной ответственностью «Смарт Системы» (ИНН ${cleanInn})`,
          shortName: isIP ? `ИП (ИНН ${cleanInn})` : `ООО «Смарт Системы»`,
          statusText: 'Действующая организация (данные ЕГРЮЛ ФНС России)',
          address: 'г. Москва',
          ceoLastName: 'Смирнов',
          ceoFirstName: 'Алексей'
        };
      }

      // Автозаполнение названия организации
      companyInput.value = company.fullName;
      companyInput.classList.remove('is-invalid');

      // Автозаполнение представителя (если поля еще не заполнены)
      const repLastName = document.getElementById('reg-org-lastname');
      const repFirstName = document.getElementById('reg-org-firstname');
      if (repLastName && !repLastName.value && company.ceoLastName) {
        repLastName.value = company.ceoLastName;
      }
      if (repFirstName && !repFirstName.value && company.ceoFirstName) {
        repFirstName.value = company.ceoFirstName;
      }

      // Отображение подтвержденного статуса ЕГРЮЛ
      egrulStatus.className = 'egrul-status-box success';
      egrulStatus.innerHTML = `
        <div><strong>✓ Найдено в ЕГРЮЛ:</strong> ${company.fullName}</div>
        <div class="egrul-company-meta">
          Статус: <strong>${company.statusText}</strong> • ОГРН: ${company.ogrn} • ${company.address}
        </div>
      `;
      egrulStatus.style.display = 'block';
    }, 600);
  }

  if (btnFetchEgrul) {
    btnFetchEgrul.addEventListener('click', fetchEgrulData);
  }

  if (innInput) {
    innInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchEgrulData();
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

  // Автоформатирование телефона (+7 (XXX) XXX-XX-XX)
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

  const phoneIndividual = document.getElementById('reg-phone');
  const phoneOrg = document.getElementById('reg-org-phone');
  if (phoneIndividual) formatPhone(phoneIndividual);
  if (phoneOrg) formatPhone(phoneOrg);

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

  // Переключение субъектности
  btnTypeIndividual.addEventListener('click', () => setAccountType('individual'));
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
        showAlert('Пожалуйста, укажите корректный номер телефона');
        return;
      }
    }

    // 2. Проверка полей для юр. лица
    if (accountType === 'organization') {
      const inn = innInput.value.trim();
      const company = companyInput.value.trim();
      const orgLastName = document.getElementById('reg-org-lastname').value.trim();
      const orgFirstName = document.getElementById('reg-org-firstname').value.trim();
      const orgPhone = document.getElementById('reg-org-phone').value.trim();

      if (!inn || !/^\d{10}$|^\d{12}$/.test(inn)) {
        markInvalid('reg-inn');
        showAlert('ИНН организации должен состоять из 10 цифр (для ИП — 12 цифр)');
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

    // 3. Проверка E-mail
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markInvalid('reg-email');
      showAlert('Пожалуйста, укажите корректный адрес электронной почты (E-mail)');
      return;
    }

    // 4. Проверка сложности и длины пароля
    if (password.length < 8) {
      markInvalid('reg-password');
      showAlert('Пароль учетной записи должен содержать не менее 8 символов');
      return;
    }

    // 5. Проверка совпадения двух паролей
    if (password !== passwordConfirm) {
      markInvalid('reg-password-confirm');
      showAlert('Введенные пароли не совпадают. Пожалуйста, проверьте правильность ввода');
      return;
    }

    // 6. Проверка согласия с 152-ФЗ
    if (!agreement) {
      showAlert('Для завершения регистрации необходимо подтвердить согласие с Условиями использования и 152-ФЗ');
      return;
    }

    const btn = document.getElementById('btn-submit-register');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Создание учетной записи...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showAlert(`Учетная запись для ${accountType === 'organization' ? 'организации' : 'физического лица (эксперта)'} успешно создана! На адрес ${email} направлено письмо для подтверждения регистрации.`, 'success');
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
