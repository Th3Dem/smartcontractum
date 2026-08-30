/**
 * SmartContractum — Логика личного кабинета (Dashboard)
 * Профиль субъекта (Физлицо, ИП, Юрлицо), безопасность (152-ФЗ), переключение тем и выход
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

  // Синхронизация сохраненной темы
  const savedTheme = localStorage.getItem('app_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.innerHTML = savedTheme === 'dark' ? '🌙' : '☀️';
  }

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

    // Рендеринг данных профиля
    renderUserProfile(data.user);

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
  // 2. Отображение профиля и реквизитов (Физлицо / ИП / Юрлицо)
  // ===============================================================
  function renderUserProfile(user) {
    const displayName = user.displayName || user.company_short_name || `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.email;
    const typeLabel = user.typeLabel || (user.account_type === 'organization' ? 'Юридическое лицо' : user.account_type === 'ip' ? 'Индивидуальный предприниматель' : 'Физическое лицо');
    const firstLetter = displayName.charAt(0).toUpperCase() || 'У';

    document.getElementById('prof-display-name').innerText = displayName;
    document.getElementById('prof-type-badge').innerText = typeLabel;
    document.getElementById('prof-avatar').innerText = firstLetter;

    const detailsContainer = document.getElementById('prof-details-list');
    detailsContainer.innerHTML = '';

    let rows = '';

    // Форматирование даты
    let formattedDate = user.created_at || 'Сегодня';
    if (user.created_at && user.created_at.includes('T')) {
      const d = new Date(user.created_at);
      formattedDate = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    if (user.account_type === 'individual') {
      rows = `
        <div class="detail-row"><span class="detail-label">Фамилия:</span><span class="detail-val">${escapeHtml(user.last_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Имя:</span><span class="detail-val">${escapeHtml(user.first_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Отчество:</span><span class="detail-val">${escapeHtml(user.middle_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Контактный телефон:</span><span class="detail-val mono-num">${escapeHtml(user.phone || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Электронная почта (E-mail):</span><span class="detail-val">${escapeHtml(user.email)}</span></div>
        <div class="detail-row"><span class="detail-label">Статус учетной записи:</span><span class="detail-val" style="color: #10b981; font-weight: 700;">✓ E-mail подтвержден (Активен)</span></div>
        <div class="detail-row"><span class="detail-label">Дата регистрации:</span><span class="detail-val">${escapeHtml(formattedDate)}</span></div>
      `;
    } else if (user.account_type === 'ip') {
      rows = `
        <div class="detail-row"><span class="detail-label">Наименование ИП:</span><span class="detail-val" style="font-weight: 700;">ИП ${escapeHtml(`${user.ip_last_name || ''} ${user.ip_first_name || ''} ${user.ip_middle_name || ''}`.trim())}</span></div>
        <div class="detail-row"><span class="detail-label">ИНН предпринимателя (12 цифр):</span><span class="detail-val mono-num">${escapeHtml(user.ip_inn || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ОГРНИП (15 цифр):</span><span class="detail-val mono-num">${escapeHtml(user.ip_ogrnip || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Статус в ЕГРИП ФНС РФ:</span><span class="detail-val" style="color: #10b981; font-weight: 700;">✓ Действующий предприниматель</span></div>
        <div class="detail-row"><span class="detail-label">Контактный телефон:</span><span class="detail-val mono-num">${escapeHtml(user.phone || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Электронная почта (E-mail):</span><span class="detail-val">${escapeHtml(user.email)}</span></div>
        <div class="detail-row"><span class="detail-label">Дата регистрации:</span><span class="detail-val">${escapeHtml(formattedDate)}</span></div>
      `;
    } else if (user.account_type === 'organization') {
      rows = `
        <div class="detail-row"><span class="detail-label">Полное наименование:</span><span class="detail-val" style="font-weight: 700;">${escapeHtml(user.company_full_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Сокращенное наименование:</span><span class="detail-val">${escapeHtml(user.company_short_name || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ИНН организации (10 цифр):</span><span class="detail-val mono-num">${escapeHtml(user.org_inn || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">КПП (9 цифр):</span><span class="detail-val mono-num">${escapeHtml(user.org_kpp || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">ОГРН (13 цифр):</span><span class="detail-val mono-num">${escapeHtml(user.org_ogrn || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Представитель организации:</span><span class="detail-val">${escapeHtml(`${user.rep_last_name || ''} ${user.rep_first_name || ''}`.trim())}</span></div>
        <div class="detail-row"><span class="detail-label">Статус в ЕГРЮЛ ФНС РФ:</span><span class="detail-val" style="color: #10b981; font-weight: 700;">✓ Действующее юридическое лицо</span></div>
        <div class="detail-row"><span class="detail-label">Корпоративный телефон:</span><span class="detail-val mono-num">${escapeHtml(user.phone || '—')}</span></div>
        <div class="detail-row"><span class="detail-label">Электронная почта (E-mail):</span><span class="detail-val">${escapeHtml(user.email)}</span></div>
        <div class="detail-row"><span class="detail-label">Дата регистрации:</span><span class="detail-val">${escapeHtml(formattedDate)}</span></div>
      `;
    }

    detailsContainer.innerHTML = rows;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = String(text);
    return div.innerHTML;
  }

  // ===============================================================
  // 3. Выход из личного кабинета (Logout)
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
  // 4. Переключатель тем оформления (Dark / Light)
  // ===============================================================
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('app_theme', newTheme);
      themeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
    });
  }
});
