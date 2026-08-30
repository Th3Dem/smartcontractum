/**
 * SmartContractum — Интерактивная логика авторизации и регистрации
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // Переключение режимов (Вход / Регистрация / Восстановление)
  function setMode(mode) {
    currentMode = mode;
    hideAlert();

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

  // Показ / скрытие пароля
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

  // Расчет сложности при вводе
  const regPwdInput = document.getElementById('reg-password');
  if (regPwdInput) {
    regPwdInput.addEventListener('input', (e) => checkPasswordStrength(e.target.value));
  }

  // Отправка формы входа
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    const btn = formLogin.querySelector('.btn-primary');
    const originalText = btn.innerHTML;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showAlert('Пожалуйста, заполните все обязательные поля формы');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Проверка учетных данных...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;

      if (email === 'demo@platform.ru' && password === 'Secret123!') {
        showAlert('Успешная авторизация! Выполняется перенаправление в личный кабинет...', 'success');
      } else {
        showAlert('Неверный адрес электронной почты (E-mail) или пароль');
      }
    }, 600);
  });

  // Отправка формы регистрации
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    const btn = formRegister.querySelector('.btn-primary');
    const originalText = btn.innerHTML;

    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const agreement = document.getElementById('reg-agreement').checked;

    if (!agreement) {
      showAlert('Для завершения регистрации необходимо подтвердить согласие с Условиями использования и 152-ФЗ');
      return;
    }

    if (password.length < 8) {
      showAlert('Пароль учетной записи должен содержать не менее 8 символов');
      return;
    }

    if (accountType === 'organization') {
      const inn = document.getElementById('reg-inn').value.trim();
      const company = document.getElementById('reg-company').value.trim();
      if (!company || !inn) {
        showAlert('Укажите полное наименование организации и ИНН');
        return;
      }
      if (!/^\d{10}$|^\d{12}$/.test(inn)) {
        showAlert('ИНН организации должен содержать 10 цифр (для ИП — 12 цифр)');
        return;
      }
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Создание профиля...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      showAlert(`Учетная запись для ${accountType === 'organization' ? 'организации' : 'физического лица'} успешно создана! На адрес ${email} направлено письмо для подтверждения регистрации.`, 'success');
    }, 800);
  });

  // Отправка формы восстановления
  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    const btn = formForgot.querySelector('.btn-primary');
    const originalText = btn.innerHTML;
    const email = document.getElementById('forgot-email').value.trim();

    if (!email) {
      showAlert('Пожалуйста, укажите адрес электронной почты (E-mail)');
      return;
    }

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
