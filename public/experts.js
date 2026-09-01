/**
 * SmartContractum — Контроллер каталога экспертов и публичных профилей v2.2.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. HEADER AUTH SYNC
    // =========================================================================
    const userBtn = document.getElementById('headerLoginBtn');
    const userLabel = document.getElementById('headerUserLabel');
    const userDot = document.getElementById('headerUserDot');
    const token = localStorage.getItem('auth_token');

    if (token) {
        if (userLabel) userLabel.textContent = 'Выйти';
        if (userDot) {
            userDot.style.display = 'block';
            userDot.style.background = '#10b981';
            userDot.style.boxShadow = '0 0 6px #10b981';
        }
        if (userBtn) {
            userBtn.setAttribute('href', '#logout');
            userBtn.setAttribute('title', 'Выйти из аккаунта');
            userBtn.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_profile');
                localStorage.removeItem('user');
                window.location.reload();
            };
        }
    } else {
        if (userLabel) userLabel.textContent = 'Войти / Регистрация';
        if (userDot) {
            userDot.style.display = 'none';
        }
        if (userBtn) {
            userBtn.setAttribute('href', '/auth.html');
            userBtn.setAttribute('title', 'Войти в личный кабинет');
            userBtn.onclick = null;
        }
    }

    // =========================================================================
    // 2. THEME MANAGER & CONTROLLER (Dark / Light Mode)
    // =========================================================================
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const sunIcon = btnThemeToggle ? btnThemeToggle.querySelector('.theme-icon-sun') : null;
    const moonIcon = btnThemeToggle ? btnThemeToggle.querySelector('.theme-icon-moon') : null;
    const themeText = document.getElementById('themeToggleText');

    function applyTheme(theme, notify = false) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('sc_theme', theme);
        } catch (e) {}

        if (theme === 'light') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            if (themeText) themeText.textContent = 'Тёмная';
            if (btnThemeToggle) btnThemeToggle.setAttribute('title', 'Переключить на тёмную тему');
            if (notify) showToast('Включена светлая тема оформления', '☀️');
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            if (themeText) themeText.textContent = 'Светлая';
            if (btnThemeToggle) btnThemeToggle.setAttribute('title', 'Переключить на светлую тему');
            if (notify) showToast('Включена тёмная тема оформления', '🌙');
        }
    }

    const currentTheme = localStorage.getItem('sc_theme') || document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(currentTheme, false);

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            const active = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = active === 'dark' ? 'light' : 'dark';
            applyTheme(next, true);
        });
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
    // 4. EXPERTS DIRECTORY DATA LOADER
    // =========================================================================
    const expertsGrid = document.getElementById('expertsGrid');
    const expertSearchInput = document.getElementById('expertSearchInput');
    const btnClearExpertSearch = document.getElementById('btnClearExpertSearch');
    let activeCompetency = 'all';
    let currentSearch = '';

    function loadExperts() {
        if (!expertsGrid) return;
        
        let url = `/api/experts?competency=${encodeURIComponent(activeCompetency)}`;
        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.experts)) {
                    renderExperts(data.experts);
                } else {
                    expertsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">Специалисты по вашему запросу не найдены</div>`;
                }
            })
            .catch(() => {
                expertsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #f43f5e; padding: 40px;">Ошибка загрузки каталога специалистов</div>`;
            });
    }

    function renderExperts(experts) {
        if (!expertsGrid) return;
        if (experts.length === 0) {
            expertsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-size: 15px;">По выбранным фильтрам специалисты не найдены. Попробуйте сбросить фильтр или изменить поисковый запрос.</div>`;
            return;
        }

        expertsGrid.innerHTML = experts.map(exp => `
            <div class="expert-card" data-expert-id="${exp.id}">
                <div>
                    <div class="expert-head">
                        <div class="expert-avatar-wrap">
                            <div class="expert-avatar ${exp.avatarClass || 'avatar-blue'}">${escapeHtml(exp.initials || 'СП')}</div>
                            ${exp.score >= 1000 ? `
                                <span class="expert-rank-badge">
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                    <span>Топ</span>
                                </span>
                            ` : ''}
                        </div>
                        <div class="expert-info">
                            <h3 class="expert-name">
                                <span>${escapeHtml(exp.name)}</span>
                            </h3>
                            <div class="expert-role">${escapeHtml(exp.role)}</div>
                            <div class="expert-company">
                                <svg class="mini-svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                                    <path fill-rule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 7v1a1 1 0 001 1h12a1 1 0 001-1V7a1 1 0 00-.504-.868l-7-4zM4 11a1 1 0 100 2h1v3H4a1 1 0 100 2h12a1 1 0 100-2h-1v-3h1a1 1 0 100-2H4zm4 5v-3h4v3H8z" clip-rule="evenodd"></path>
                                </svg>
                                <span>${escapeHtml(exp.company || 'SmartContractum Lab')}</span>
                            </div>
                        </div>
                    </div>

                    <p class="expert-bio">${escapeHtml(exp.bio || '')}</p>

                    <div class="expert-stats-row">
                        <div class="expert-stat-item">
                            <span class="stat-num" style="color: #10b981;">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                                    <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path>
                                </svg>
                                <span>+${exp.score}</span>
                            </span>
                            <span class="stat-lbl">Репутация</span>
                        </div>
                        <div class="expert-stat-item">
                            <span class="stat-num">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style="color: #94a3b8;">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                                </svg>
                                <span>${exp.articlesCount || 0}</span>
                            </span>
                            <span class="stat-lbl">Статей</span>
                        </div>
                        <div class="expert-stat-item">
                            <span class="stat-num" style="color: #38bdf8;">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                                <span>${exp.solvedCount || 0}</span>
                            </span>
                            <span class="stat-lbl">Решений Q&amp;A</span>
                        </div>
                    </div>

                    <div class="expert-skills-cloud">
                        ${(exp.competencies || []).map(c => `<span class="skill-tag">#${escapeHtml(c)}</span>`).join('')}
                    </div>
                </div>

                <div class="expert-card-footer">
                    <button type="button" class="btn-expert-contact" data-expert-name="${escapeHtml(exp.name)}" data-expert-id="${exp.id}">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                        </svg>
                        <span>Связаться</span>
                    </button>
                    <button type="button" class="btn-expert-profile" data-expert-id="${exp.id}">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                        </svg>
                        <span>Портфолио</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 5. COMPETENCY TABS & SEARCH CONTROLLER
    // =========================================================================
    document.querySelectorAll('.expert-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.expert-filter-btn').forEach(b => b.classList.remove('is-active'));
            this.classList.add('is-active');
            activeCompetency = this.dataset.comp;
            loadExperts();
            showToast(`Фильтр каталога: ${this.querySelector('span') ? this.querySelector('span').textContent.trim() : this.textContent.trim()}`, '✓');
        });
    });

    if (expertSearchInput) {
        let searchTimeout = null;
        expertSearchInput.addEventListener('input', function () {
            if (btnClearExpertSearch) {
                btnClearExpertSearch.style.display = this.value.trim() ? 'flex' : 'none';
            }
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = expertSearchInput.value.trim();
                loadExperts();
            }, 250);
        });
    }

    if (btnClearExpertSearch && expertSearchInput) {
        btnClearExpertSearch.addEventListener('click', () => {
            expertSearchInput.value = '';
            btnClearExpertSearch.style.display = 'none';
            currentSearch = '';
            loadExperts();
            expertSearchInput.focus();
        });
    }

    // =========================================================================
    // 6. PROFILE MODAL & DIRECT CONTACT
    // =========================================================================
    const modalExpertProfile = document.getElementById('modalExpertProfile');
    const modalExpertName = document.getElementById('modalExpertName');
    const modalExpertBody = document.getElementById('modalExpertBody');
    const btnCloseExpertModal = document.getElementById('btnCloseExpertModal');

    function openExpertProfile(expertId) {
        if (!modalExpertProfile) return;
        fetch(`/api/experts/${expertId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.expert) {
                    const exp = data.expert;
                    if (modalExpertName) modalExpertName.textContent = `Портфолио: ${exp.name}`;
                    if (modalExpertBody) {
                        modalExpertBody.innerHTML = `
                            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
                                <div class="expert-avatar ${exp.avatarClass || 'avatar-blue'}" style="width: 64px; height: 64px; font-size: 24px;">${escapeHtml(exp.initials)}</div>
                                <div>
                                    <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 4px; font-family: var(--exp-font-heading);">${escapeHtml(exp.name)}</h2>
                                    <div style="color: var(--feed-text-muted); font-size: 13.5px;">${escapeHtml(exp.role)}</div>
                                    <div style="color: #38bdf8; font-size: 12.5px; font-weight: 600; margin-top: 2px;">${escapeHtml(exp.company)}</div>
                                </div>
                            </div>

                            <div style="background: #111c33; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                                <h4 style="color: #ffffff; margin: 0 0 8px; font-size: 14px; font-family: var(--exp-font-heading);">О специалисте</h4>
                                <p style="color: var(--feed-text-muted); font-size: 13.5px; line-height: 1.6; margin: 0;">${escapeHtml(exp.bio)}</p>
                            </div>

                            <div style="margin-bottom: 20px;">
                                <h4 style="color: #ffffff; margin: 0 0 10px; font-size: 14px; font-family: var(--exp-font-heading);">Подтвержденные компетенции</h4>
                                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                    ${(exp.competencies || []).map(c => `<span class="skill-tag" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">#${escapeHtml(c)}</span>`).join('')}
                                </div>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <h4 style="color: #ffffff; margin: 0 0 10px; font-size: 14px; font-family: var(--exp-font-heading);">Материалы и принятые решения (${(exp.publications || []).length})</h4>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    ${(exp.publications || []).length > 0 
                                        ? exp.publications.map(p => `
                                            <a href="/feed#post-${p.id}" style="display: block; background: #1e293b; padding: 12px 14px; border-radius: 10px; text-decoration: none; color: #ffffff; font-size: 13.5px; border: 1px solid rgba(255,255,255,0.06);">
                                                <strong>${escapeHtml(p.title)}</strong>
                                                <div style="font-size: 11.5px; color: var(--feed-text-dim); margin-top: 4px; display: flex; gap: 10px;">
                                                    <span style="color: #10b981;">Полезность: +${p.helpful_count}</span>
                                                    <span>Тип: ${escapeHtml(p.type)}</span>
                                                </div>
                                            </a>
                                        `).join('')
                                        : `<div style="color: var(--feed-text-dim); font-size: 13px;">Материалы проходят верификацию</div>`
                                    }
                                </div>
                            </div>

                            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button type="button" class="btn-expert-contact" style="width: 100%; padding: 12px; font-size: 14px;" onclick="alert('Запрос на связь со специалистом направлен через защищенный канал платформы!');">
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                    </svg>
                                    <span>Отправить предложение о сотрудничестве</span>
                                </button>
                            </div>
                        `;
                    }
                    modalExpertProfile.style.display = 'flex';
                }
            });
    }

    if (btnCloseExpertModal && modalExpertProfile) {
        btnCloseExpertModal.addEventListener('click', () => {
            modalExpertProfile.style.display = 'none';
        });
        modalExpertProfile.addEventListener('click', (e) => {
            if (e.target === modalExpertProfile) modalExpertProfile.style.display = 'none';
        });
    }

    // Delegation for dynamic buttons
    document.addEventListener('click', function (e) {
        const btnContact = e.target.closest('.btn-expert-contact');
        if (btnContact && !btnContact.closest('.modal-body-form')) {
            const expName = btnContact.dataset.expertName;
            alert(`Запрос на связь с экспертом «${expName}» направлен оператору платформы.`);
            showToast(`Запрос на сотрудничество с ${expName} сформирован`, '✓');
        }

        const btnProfile = e.target.closest('.btn-expert-profile');
        if (btnProfile) {
            openExpertProfile(btnProfile.dataset.expertId);
        }
    });

    // Initial Load
    loadExperts();
});

