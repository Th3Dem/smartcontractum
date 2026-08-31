/**
 * SmartContractum — Контроллер хабов базы знаний (TASK-44)
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. THEME MANAGER
    // =========================================================================
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const themeIcon = document.getElementById('themeIcon');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('sc_theme', theme);
        if (themeIcon) {
            themeIcon.textContent = (theme === 'light') ? '☀️' : '🌙';
        }
    }

    const savedTheme = localStorage.getItem('sc_theme') || 'dark';
    applyTheme(savedTheme);

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const nextTheme = (currentTheme === 'dark') ? 'light' : 'dark';
            applyTheme(nextTheme);
        });
    }

    // =========================================================================
    // 2. AUTH STATUS CHECK
    // =========================================================================
    const authToken = localStorage.getItem('auth_token');
    const btnHeaderAuth = document.getElementById('btnHeaderAuth');

    if (authToken && btnHeaderAuth) {
        btnHeaderAuth.textContent = 'Личный кабинет';
        btnHeaderAuth.href = '/dashboard';
    }

    // =========================================================================
    // 3. TOAST NOTIFICATIONS
    // =========================================================================
    const feedToast = document.getElementById('feedToast');
    const feedToastMsg = document.getElementById('feedToastMsg');
    let toastTimeout = null;

    function showToast(msg, icon = '✨') {
        if (!feedToast) return;
        if (toastTimeout) clearTimeout(toastTimeout);
        if (feedToastMsg) feedToastMsg.textContent = msg;
        const iconEl = feedToast.querySelector('.toast-icon');
        if (iconEl) iconEl.textContent = icon;
        feedToast.style.display = 'flex';
        toastTimeout = setTimeout(() => {
            feedToast.style.display = 'none';
        }, 3200);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // =========================================================================
    // 4. HUBS DATA LOADER & RENDERER
    // =========================================================================
    const hubsGrid = document.getElementById('hubsGrid');
    const hubSearchInput = document.getElementById('hubSearchInput');
    let allHubs = [];

    function loadHubs() {
        if (!hubsGrid) return;
        fetch('/api/hubs')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.hubs)) {
                    allHubs = data.hubs;
                    renderHubs(allHubs);
                } else {
                    hubsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">Хабы временно недоступны</div>`;
                }
            })
            .catch(() => {
                hubsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #f43f5e; padding: 40px;">Ошибка загрузки хабов базы знаний</div>`;
            });
    }

    function renderHubs(hubs) {
        if (!hubsGrid) return;
        if (hubs.length === 0) {
            hubsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-size: 15px;">Хабы по вашему запросу не найдены</div>`;
            return;
        }

        const subscribedHubs = JSON.parse(localStorage.getItem('subscribed_hubs') || '[]');

        hubsGrid.innerHTML = hubs.map(h => {
            const isSub = subscribedHubs.includes(h.slug);
            return `
                <div class="hub-card" data-hub-slug="${h.slug}">
                    <div>
                        <div class="hub-card-header">
                            <div class="hub-icon-box">${h.icon || '🏷️'}</div>
                            <div class="hub-title-group">
                                <h3 class="hub-title">${escapeHtml(h.name)}</h3>
                                <div class="hub-subscribers">👥 ${h.subscribersCount || 0} участников</div>
                            </div>
                        </div>

                        <p class="hub-desc">${escapeHtml(h.description)}</p>

                        <div class="hub-stats-bar">
                            <div class="hub-stat-col">
                                <span class="hub-stat-val" style="color: #38bdf8;">${h.articlesCount || 0}</span>
                                <span class="hub-stat-lbl">Статей</span>
                            </div>
                            <div class="hub-stat-col">
                                <span class="hub-stat-val" style="color: #f59e0b;">${h.questionsCount || 0}</span>
                                <span class="hub-stat-lbl">Вопросов</span>
                            </div>
                            <div class="hub-stat-col">
                                <span class="hub-stat-val" style="color: #10b981;">${h.expertsCount || 0}</span>
                                <span class="hub-stat-lbl">Экспертов</span>
                            </div>
                        </div>

                        <div class="hub-tags-row">
                            ${(h.tags || []).map(t => `<span class="hub-tag-pill">${escapeHtml(t)}</span>`).join('')}
                        </div>
                    </div>

                    <div class="hub-actions-footer">
                        <a href="/feed?cat=${encodeURIComponent(h.slug)}" class="btn-hub-open">Перейти в ленту хаба →</a>
                        <button type="button" class="btn-hub-sub ${isSub ? 'is-subscribed' : ''}" data-hub-slug="${h.slug}" data-hub-name="${escapeHtml(h.name)}">
                            ${isSub ? '✓ Вы подписаны' : '+ Подписаться'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // 5. LIVE SEARCH FILTER
    // =========================================================================
    if (hubSearchInput) {
        hubSearchInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();
            if (!query) {
                renderHubs(allHubs);
                return;
            }

            const filtered = allHubs.filter(h => {
                const text = `${h.name} ${h.description} ${(h.tags || []).join(' ')}`.toLowerCase();
                return text.includes(query);
            });
            renderHubs(filtered);
        });
    }

    // =========================================================================
    // 6. SUBSCRIPTION TOGGLER
    // =========================================================================
    document.addEventListener('click', function (e) {
        const btnSub = e.target.closest('.btn-hub-sub');
        if (btnSub) {
            const slug = btnSub.dataset.hubSlug;
            const name = btnSub.dataset.hubName;
            let subscribed = JSON.parse(localStorage.getItem('subscribed_hubs') || '[]');

            if (subscribed.includes(slug)) {
                subscribed = subscribed.filter(s => s !== slug);
                btnSub.classList.remove('is-subscribed');
                btnSub.textContent = '+ Подписаться';
                showToast(`Вы отписались от хаба «${name}»`, '🏷️');
            } else {
                subscribed.push(slug);
                btnSub.classList.add('is-subscribed');
                btnSub.textContent = '✓ Вы подписаны';
                showToast(`Вы успешно подписались на хаб «${name}»!`, '⭐');
            }

            localStorage.setItem('subscribed_hubs', JSON.stringify(subscribed));
        }
    });

    // Initial Load
    loadHubs();
});
