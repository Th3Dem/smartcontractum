/**
 * SmartContractum — Логика личного кабинета (Dashboard)
 * Аутентификация сессии, загрузка реквизитов из БД и реестра смарт-контрактов
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

  let currentUser = null;
  let userContracts = [];

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
    userContracts = data.contracts || [];

    // Инициализация интерфейса
    renderUserProfile(currentUser);
    renderContracts(userContracts);

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
  // 2. Отображение профиля и реквизитов (152-ФЗ)
  // ===============================================================
  function renderUserProfile(user) {
    const displayName = user.displayName || user.company_short_name || `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.email;
    const typeLabel = user.typeLabel || (user.account_type === 'organization' ? 'Юридическое лицо' : user.account_type === 'ip' ? 'Индивидуальный предприниматель' : 'Физическое лицо');
    const firstLetter = displayName.charAt(0).toUpperCase() || 'У';

    // Шапка
    document.getElementById('header-user-name').innerText = displayName;
    document.getElementById('header-account-type').innerText = typeLabel;
    document.getElementById('header-avatar').innerText = firstLetter;

    // Вкладка Профиль
    document.getElementById('prof-display-name').innerText = displayName;
    document.getElementById('prof-type-badge').innerText = typeLabel;
    document.getElementById('prof-avatar').innerText = firstLetter;
    document.getElementById('prof-email').innerText = user.email;
    document.getElementById('prof-phone').innerText = user.phone || 'Не указан';
    document.getElementById('prof-created-at').innerText = user.created_at || 'Сегодня';

    // Формирование реквизитов в зависимости от субъекта
    const detailsContainer = document.getElementById('prof-details-list');
    detailsContainer.innerHTML = '';

    if (user.account_type === 'individual') {
      detailsContainer.innerHTML = `
        <div class="detail-row"><span class="detail-label">Фамилия:</span><span class="detail-val">${escapeHtml(user.last_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Имя:</span><span class="detail-val">${escapeHtml(user.first_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Отчество:</span><span class="detail-val">${escapeHtml(user.middle_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Статус подтверждения:</span><span class="detail-val" style="color: #10b981;">✓ E-mail верифицирован</span></div>
      `;
    } else if (user.account_type === 'ip') {
      detailsContainer.innerHTML = `
        <div class="detail-row"><span class="detail-label">ИНН предпринимателя:</span><span class="detail-val" style="font-family: monospace; font-weight: 700;">${escapeHtml(user.ip_inn || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ОГРНИП:</span><span class="detail-val" style="font-family: monospace;">${escapeHtml(user.ip_ogrnip || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ФИО предпринимателя:</span><span class="detail-val">${escapeHtml(`${user.ip_last_name || ''} ${user.ip_first_name || ''} ${user.ip_middle_name || ''}`.trim())}</span></div>
        <div class="detail-row"><span class="detail-label">Реестр:</span><span class="detail-val" style="color: #10b981;">✓ Запись в ЕГРИП активна</span></div>
      `;
      document.getElementById('prof-reg-status-title').innerText = `ИП зарегистрирован в ЕГРИП (ИНН: ${user.ip_inn})`;
    } else if (user.account_type === 'organization') {
      detailsContainer.innerHTML = `
        <div class="detail-row"><span class="detail-label">Полное наименование:</span><span class="detail-val">${escapeHtml(user.company_full_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ИНН организации:</span><span class="detail-val" style="font-family: monospace; font-weight: 700;">${escapeHtml(user.org_inn || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">КПП:</span><span class="detail-val" style="font-family: monospace;">${escapeHtml(user.org_kpp || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ОГРН:</span><span class="detail-val" style="font-family: monospace;">${escapeHtml(user.org_ogrn || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Представитель:</span><span class="detail-val">${escapeHtml(`${user.rep_last_name || ''} ${user.rep_first_name || ''}`.trim())}</span></div>
      `;
      document.getElementById('prof-reg-status-title').innerText = `Организация в ЕГРЮЛ (ИНН: ${user.org_inn})`;
    }
  }

  // ===============================================================
  // 3. Отображение смарт-контрактов
  // ===============================================================
  function renderContracts(contracts) {
    const overviewTbody = document.getElementById('overview-contracts-tbody');
    const fullTbody = document.getElementById('full-contracts-tbody');
    const countBadge = document.getElementById('contracts-count-badge');
    const totalMetric = document.getElementById('metric-total-contracts');

    if (countBadge) countBadge.innerText = contracts.length;
    if (totalMetric) totalMetric.innerText = contracts.length;

    if (!contracts || contracts.length === 0) {
      const emptyRow = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">У вас пока нет активных смарт-контрактов. Нажмите «+ Создать договор».</td></tr>`;
      if (overviewTbody) overviewTbody.innerHTML = emptyRow;
      if (fullTbody) fullTbody.innerHTML = emptyRow;
      return;
    }

    const statusMap = {
      'active': { label: '✓ В исполнении', cls: 'active' },
      'negotiation': { label: '⏳ На согласовании', cls: 'negotiation' },
      'completed': { label: '🔒 Завершен', cls: 'success' },
      'draft': { label: '📝 Черновик', cls: 'draft' }
    };

    let overviewHtml = '';
    let fullHtml = '';

    contracts.forEach(c => {
      const st = statusMap[c.status] || { label: c.status, cls: 'active' };
      overviewHtml += `
        <tr>
          <td><span class="contract-code">${escapeHtml(c.contract_number)}</span></td>
          <td><strong>${escapeHtml(c.title)}</strong></td>
          <td>${escapeHtml(c.counterparty)}</td>
          <td><strong style="color: var(--accent-blue);">${escapeHtml(c.amount)}</strong></td>
          <td><span class="status-pill ${st.cls}">${st.label}</span></td>
          <td><button class="link-btn" onclick="alert('Открытие смарт-контракта ${escapeHtml(c.contract_number)}')">Открыть →</button></td>
        </tr>
      `;

      fullHtml += `
        <tr>
          <td><span class="contract-code">${escapeHtml(c.contract_number)}</span></td>
          <td><strong>${escapeHtml(c.title)}</strong></td>
          <td>${escapeHtml(c.counterparty)}</td>
          <td><strong style="color: var(--accent-blue);">${escapeHtml(c.amount)}</strong></td>
          <td><span class="status-pill ${st.cls}">${st.label}</span></td>
          <td>${escapeHtml(c.created_at || '—')}</td>
          <td><button class="btn-secondary btn-sm" onclick="alert('Скачивание выписки по контракту ${escapeHtml(c.contract_number)}')">Выписка</button></td>
        </tr>
      `;
    });

    if (overviewTbody) overviewTbody.innerHTML = overviewHtml;
    if (fullTbody) fullTbody.innerHTML = fullHtml;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = String(text);
    return div.innerHTML;
  }

  // ===============================================================
  // 4. Переключение табов сайдбара
  // ===============================================================
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    tabContents.forEach(section => {
      const isTarget = section.id === `tab-${tabId}`;
      section.style.display = isTarget ? 'block' : 'none';
      section.classList.toggle('active', isTarget);
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const btnViewAll = document.getElementById('btn-view-all-contracts');
  if (btnViewAll) {
    btnViewAll.addEventListener('click', () => switchTab('contracts'));
  }

  const btnCreateContract = document.getElementById('btn-create-contract');
  if (btnCreateContract) {
    btnCreateContract.addEventListener('click', () => {
      alert('Формирование нового смарт-контракта с двухсторонней цифровой подписью.');
    });
  }

  // ===============================================================
  // 5. Выход из личного кабинета (Logout)
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

  // ===============================================================
  // 6. Переключатель тем оформления
  // ===============================================================
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      themeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
    });
  }
});
