/**
 * SmartContractum — Контроллер каталога экспертов и публичных профилей (TASK-42)
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
    const navLinkDashboard = document.getElementById('navLinkDashboard');

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
    // 4. EXPERTS DIRECTORY DATA LOADER
    // =========================================================================
    const expertsGrid = document.getElementById('expertsGrid');
    const expertSearchInput = document.getElementById('expertSearchInput');
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
                            ${exp.score >= 1000 ? `<span class="expert-rank-badge" style="color: #f59e0b;">★ Топ</span>` : ''}
                        </div>
                        <div class="expert-info">
                            <h3 class="expert-name">
                                <span>${escapeHtml(exp.name)}</span>
                            </h3>
                            <div class="expert-role">${escapeHtml(exp.role)}</div>
                            <div class="expert-company">🏛️ ${escapeHtml(exp.company || 'SmartContractum Lab')}</div>
                        </div>
                    </div>

                    <p class="expert-bio">${escapeHtml(exp.bio || '')}</p>

                    <div class="expert-stats-row">
                        <div class="expert-stat-item">
                            <span class="stat-num" style="color: #10b981;">+${exp.score}</span>
                            <span class="stat-lbl">Репутация</span>
                        </div>
                        <div class="expert-stat-item">
                            <span class="stat-num">${exp.articlesCount || 0}</span>
                            <span class="stat-lbl">Статей</span>
                        </div>
                        <div class="expert-stat-item">
                            <span class="stat-num" style="color: #38bdf8;">${exp.solvedCount || 0}</span>
                            <span class="stat-lbl">Решений Q&amp;A</span>
                        </div>
                    </div>

                    <div class="expert-skills-cloud">
                        ${(exp.competencies || []).map(c => `<span class="skill-tag">#${escapeHtml(c)}</span>`).join('')}
                    </div>
                </div>

                <div class="expert-card-footer">
                    <button type="button" class="btn-expert-contact" data-expert-name="${escapeHtml(exp.name)}" data-expert-id="${exp.id}">Связаться →</button>
                    <button type="button" class="btn-expert-profile" data-expert-id="${exp.id}">Портфолио</button>
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
            showToast(`Фильтр каталога: ${this.textContent.trim()}`, '🏷️');
        });
    });

    if (expertSearchInput) {
        let searchTimeout = null;
        expertSearchInput.addEventListener('input', function () {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = expertSearchInput.value.trim();
                loadExperts();
            }, 250);
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
                                    <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 4px;">${escapeHtml(exp.name)}</h2>
                                    <div style="color: var(--feed-text-muted); font-size: 13.5px;">${escapeHtml(exp.role)}</div>
                                    <div style="color: #38bdf8; font-size: 12.5px; font-weight: 600;">${escapeHtml(exp.company)}</div>
                                </div>
                            </div>

                            <div style="background: #111c33; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                                <h4 style="color: #ffffff; margin: 0 0 8px; font-size: 14px;">О специалисте</h4>
                                <p style="color: var(--feed-text-muted); font-size: 13.5px; line-height: 1.5; margin: 0;">${escapeHtml(exp.bio)}</p>
                            </div>

                            <div style="margin-bottom: 20px;">
                                <h4 style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">Подтвержденные компетенции</h4>
                                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                    ${(exp.competencies || []).map(c => `<span class="skill-tag" style="color: #38bdf8;">✓ #${escapeHtml(c)}</span>`).join('')}
                                </div>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <h4 style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">Материалы и принятые решения (${(exp.publications || []).length})</h4>
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    ${(exp.publications || []).length > 0 
                                        ? exp.publications.map(p => `
                                            <a href="/feed#post-${p.id}" style="display: block; background: #1e293b; padding: 10px 14px; border-radius: 8px; text-decoration: none; color: #ffffff; font-size: 13px;">
                                                <strong>${escapeHtml(p.title)}</strong>
                                                <div style="font-size: 11px; color: var(--feed-text-dim); margin-top: 4px;">Полезность: +${p.helpful_count} · ${p.type}</div>
                                            </a>
                                        `).join('')
                                        : `<div style="color: var(--feed-text-dim); font-size: 13px;">Материалы проходят верификацию</div>`
                                    }
                                </div>
                            </div>

                            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button type="button" class="btn-sidebar-primary" style="width: 100%; padding: 12px;" onclick="alert('Запрос на связь со специалистом направлен через защищенный канал платформы!');">Отправить предложение о сотрудничестве →</button>
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
        if (btnContact) {
            const expName = btnContact.dataset.expertName;
            alert(`Запрос на связь с экспертом «${expName}» направлен оператору платформы.`);
            showToast(`Запрос на сотрудничество с ${expName} сформирован`, '📨');
        }

        const btnProfile = e.target.closest('.btn-expert-profile');
        if (btnProfile) {
            openExpertProfile(btnProfile.dataset.expertId);
        }
    });

    // Initial Load
    loadExperts();
});
