/**
 * SmartContractum — Modern Web3 Community Feed & Interactive Controller v2.3.0
 * Multi-Format Posts (Polls, Q&A, Articles, RFCs), Threads, Creator Modal & Reactive State
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. HEADER AUTH SYNC
    // =========================================================================
    const userBtn = document.getElementById('headerLoginBtn');
    const userLabel = document.getElementById('headerUserLabel');
    const userDot = document.getElementById('headerUserDot');
    const creatorAvatar = document.getElementById('creatorUserAvatar');
    const token = localStorage.getItem('auth_token');
    const userProfileRaw = localStorage.getItem('user_profile');

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
        if (userProfileRaw && creatorAvatar) {
            try {
                const u = JSON.parse(userProfileRaw);
                const name = u.displayName || u.firstName || u.email || 'SC';
                creatorAvatar.textContent = (name.substring(0, 2)).toUpperCase();
            } catch (e) {}
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
    // 1.1 THEME TOGGLE CONTROLLER (Dark / Light Mode)
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
    // 2. TOAST NOTIFICATION UTILITY
    // =========================================================================
    const toast = document.getElementById('feedToast');
    const toastMsg = document.getElementById('feedToastMsg');
    let toastTimeout;

    function showToast(message, icon = '✨') {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        const iconEl = toast.querySelector('.toast-icon');
        if (iconEl) iconEl.textContent = icon;
        toast.style.display = 'flex';
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // =========================================================================
    // 3. INTERACTIVE POLL VOTING
    // =========================================================================
    document.querySelectorAll('.interactive-poll-box').forEach(pollBox => {
        const optionRows = pollBox.querySelectorAll('.poll-option-row');
        let totalVotes = parseInt(pollBox.dataset.totalVotes, 10) || 348;

        optionRows.forEach(row => {
            const btn = row.querySelector('.poll-option-btn');
            btn.addEventListener('click', () => {
                // If already voted in this row
                if (row.classList.contains('is-voted')) return;

                // Mark current row as voted
                optionRows.forEach(r => {
                    r.classList.remove('is-voted');
                    const check = r.querySelector('.opt-check');
                    if (check) check.textContent = '◯';
                });

                row.classList.add('is-voted');
                const check = row.querySelector('.opt-check');
                if (check) check.textContent = '●';

                totalVotes += 1;
                pollBox.dataset.totalVotes = totalVotes;

                // Update vote count text
                const metaVotes = pollBox.querySelector('.poll-footer-meta strong');
                if (metaVotes) metaVotes.textContent = totalVotes.toLocaleString('ru-RU');

                showToast('Ваш голос по стандарту ПКСК успешно учтен!', '📊');
            });
        });
    });

    // =========================================================================
    // 4. COMMENTS THREAD EXPAND & ADD COMMENT
    // =========================================================================
    document.querySelectorAll('.btn-thread-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.targetThread;
            const thread = document.getElementById(targetId);
            if (!thread) return;

            const isHidden = thread.style.display === 'none';
            thread.style.display = isHidden ? 'block' : 'none';
            this.classList.toggle('is-active', isHidden);
        });
    });

    document.querySelectorAll('.comments-thread-panel').forEach(thread => {
        const sendBtn = thread.querySelector('.btn-send-comment');
        const input = thread.querySelector('.input-comment-text');
        const commentsList = thread.querySelector('.comments-list');

        function addComment() {
            const text = input.value.trim();
            if (!text) return;

            let authorName = 'Вы (Специалист)';
            let authorInitials = 'ВЫ';
            if (userProfileRaw) {
                try {
                    const u = JSON.parse(userProfileRaw);
                    authorName = u.displayName || u.firstName || 'Вы';
                    authorInitials = authorName.substring(0, 2).toUpperCase();
                } catch (e) {}
            }

            const commentBubble = document.createElement('div');
            commentBubble.className = 'comment-bubble';
            commentBubble.innerHTML = `
                <div class="comment-head">
                    <div class="comment-author-avatar avatar-blue">${authorInitials}</div>
                    <strong>${escapeHtml(authorName)}</strong>
                    <span class="comment-role">Эксперт</span>
                    <span class="comment-time">только что</span>
                </div>
                <div class="comment-body">${escapeHtml(text)}</div>
            `;

            commentsList.appendChild(commentBubble);
            input.value = '';

            // Update thread toggle button count
            const card = thread.closest('.feed-card');
            if (card) {
                const toggleBtn = card.querySelector('.btn-thread-toggle span');
                if (toggleBtn) {
                    const currentCount = parseInt(toggleBtn.textContent, 10) || 0;
                    toggleBtn.textContent = `${currentCount + 1} комментариев`;
                }
            }

            showToast('Комментарий добавлен к обсуждению!', '💬');
        }

        if (sendBtn && input) {
            sendBtn.addEventListener('click', addComment);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addComment();
                }
            });
        }
    });

    // =========================================================================
    // 5. EXPANDABLE ARTICLE BODY
    // =========================================================================
    document.querySelectorAll('[data-action="toggle-full-article"]').forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const card = this.closest('.feed-card');
            const fullBody = card.querySelector('.full-article-body');
            const readMoreBtn = card.querySelector('.btn-read-more');

            if (fullBody) {
                const isHidden = fullBody.style.display === 'none';
                fullBody.style.display = isHidden ? 'block' : 'none';
                if (readMoreBtn) {
                    readMoreBtn.querySelector('.read-more-label').textContent = isHidden ? 'Свернуть статью' : 'Читать статью полностью';
                    readMoreBtn.querySelector('.read-more-arrow').textContent = isHidden ? '↑' : '↓';
                }
            }
        });
    });

    // =========================================================================
    // 6. COPY CODE SNIPPET IN 1 CLICK
    // =========================================================================
    document.querySelectorAll('.btn-copy-code-snippet').forEach(btn => {
        btn.addEventListener('click', function () {
            const widget = this.closest('.smart-contract-code-widget');
            const code = widget ? widget.querySelector('code').textContent : '';
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    const origText = this.innerHTML;
                    this.innerHTML = '<span>✓ Скопировано!</span>';
                    showToast('Код смарт-контракта скопирован в буфер обмена', '📋');
                    setTimeout(() => { this.innerHTML = origText; }, 2000);
                });
            }
        });
    });

    // =========================================================================
    // 7. KARMA LEVER (▲ / ▼)
    // =========================================================================
    document.querySelectorAll('.karma-lever').forEach(lever => {
        const up = lever.querySelector('.upvote');
        const down = lever.querySelector('.downvote');
        const val = lever.querySelector('.karma-val');

        if (up && down && val) {
            up.addEventListener('click', () => {
                let current = parseInt(val.textContent.replace('+', ''), 10) || 0;
                if (up.classList.contains('is-active')) {
                    up.classList.remove('is-active');
                    current -= 1;
                } else {
                    up.classList.add('is-active');
                    if (down.classList.contains('is-active')) {
                        down.classList.remove('is-active');
                        current += 1;
                    }
                    current += 1;
                    showToast('Вы поддержали публикацию!', '▲');
                }
                val.textContent = (current > 0 ? '+' : '') + current;
            });

            down.addEventListener('click', () => {
                let current = parseInt(val.textContent.replace('+', ''), 10) || 0;
                if (down.classList.contains('is-active')) {
                    down.classList.remove('is-active');
                    current += 1;
                } else {
                    down.classList.add('is-active');
                    if (up.classList.contains('is-active')) {
                        up.classList.remove('is-active');
                        current -= 1;
                    }
                    current -= 1;
                }
                val.textContent = (current > 0 ? '+' : '') + current;
            });
        }
    });

    // =========================================================================
    // 8. REACTIONS (🔥, 🚀, 💡, 👏)
    // =========================================================================
    document.querySelectorAll('.btn-react').forEach(btn => {
        btn.addEventListener('click', function () {
            const cnt = this.querySelector('.react-cnt');
            if (cnt) {
                let count = parseInt(cnt.textContent, 10) || 0;
                if (this.classList.contains('is-active')) {
                    this.classList.remove('is-active');
                    cnt.textContent = count - 1;
                } else {
                    this.classList.add('is-active');
                    cnt.textContent = count + 1;
                    showToast(`Реакция ${this.dataset.emoji} сохранена!`, this.dataset.emoji);
                }
            }
        });
    });

    // =========================================================================
    // 9. BOOKMARKS & SHARE
    // =========================================================================
    document.querySelectorAll('.btn-bookmark-post').forEach(btn => {
        btn.addEventListener('click', function () {
            this.classList.toggle('is-active');
            const isActive = this.classList.contains('is-active');
            this.style.color = isActive ? '#38bdf8' : '';
            showToast(isActive ? 'Статья сохранена в ваши закладки' : 'Статья удалена из закладок', '🔖');
        });
    });

    document.querySelectorAll('.btn-share-post').forEach(btn => {
        btn.addEventListener('click', function () {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showToast('Ссылка на публикацию скопирована в буфер!', '↗');
            });
        });
    });

    // =========================================================================
    // 10. FILTERING & SEARCH CONTROLLER
    // =========================================================================
    const feedCards = document.querySelectorAll('.feed-card');
    let activeType = 'all';
    let activeCat = 'all';
    let activeSearch = '';

    function applyFilters() {
        feedCards.forEach(card => {
            const cardType = card.dataset.type;
            const cardCat = card.dataset.cat;
            const cardText = card.textContent.toLowerCase();

            const matchType = (activeType === 'all' || cardType === activeType);
            const matchCat = (activeCat === 'all' || cardCat === activeCat);
            const matchSearch = (!activeSearch || cardText.includes(activeSearch));

            card.style.display = (matchType && matchCat && matchSearch) ? 'block' : 'none';
        });
    }

    // Hero Nav Tabs (Статьи, Посты, Новости, Авторы, Компании)
    document.querySelectorAll('.feed-hero-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.feed-hero-tab').forEach(t => t.classList.remove('is-active'));
            this.classList.add('is-active');

            const heroTab = this.dataset.heroTab;

            if (heroTab === 'all') {
                activeType = 'all';
                document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.toggle('is-active', b.dataset.type === 'all'));
                showToast('Показаны все материалы сообщества', '⚡');
            } else if (heroTab === 'article') {
                activeType = 'article';
                document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.toggle('is-active', b.dataset.type === 'article'));
                showToast('Фильтр: Статьи и технические разборы', '📄');
            } else if (heroTab === 'post') {
                activeType = 'post';
                document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.toggle('is-active', b.dataset.type === 'post'));
                showToast('Фильтр: Посты и короткие публикации', '💬');
            } else if (heroTab === 'news') {
                activeType = 'poll';
                document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.toggle('is-active', b.dataset.type === 'poll'));
                showToast('Фильтр: Новости платформы и голосования RFC', '📰');
            } else if (heroTab === 'authors') {
                activeType = 'all';
                showToast('Эксперты и авторы экосистемы SmartContractum', '👥');
            } else if (heroTab === 'companies') {
                activeType = 'case';
                document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.toggle('is-active', b.dataset.type === 'case'));
                showToast('Фильтр: Паспорта и решения компаний', '💼');
            }

            applyFilters();
        });
    });

    // Hero Write Button
    const btnHeroWrite = document.getElementById('btnHeroWrite');
    if (btnHeroWrite) {
        btnHeroWrite.addEventListener('click', () => {
            openQuickModal('post');
        });
    }

    // Secondary Type Tabs
    document.querySelectorAll('.type-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('is-active'));
            this.classList.add('is-active');
            activeType = this.dataset.type;

            // Sync hero tab if matching
            document.querySelectorAll('.feed-hero-tab').forEach(t => {
                t.classList.toggle('is-active', t.dataset.heroTab === activeType);
            });

            applyFilters();
        });
    });

    // Hero Topics Dropdown (Темы)
    const btnFeedTopics = document.getElementById('btnFeedTopicsDropdown');
    const feedTopicsMenu = document.getElementById('feedTopicsMenu');
    const currentTopicLabel = document.getElementById('currentTopicLabel');

    if (btnFeedTopics && feedTopicsMenu) {
        btnFeedTopics.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = feedTopicsMenu.style.display === 'none';
            feedTopicsMenu.style.display = isHidden ? 'block' : 'none';
            btnFeedTopics.classList.toggle('is-open', isHidden);
        });

        document.addEventListener('click', () => {
            feedTopicsMenu.style.display = 'none';
            btnFeedTopics.classList.remove('is-open');
        });

        document.querySelectorAll('.topic-menu-item').forEach(item => {
            item.addEventListener('click', function () {
                document.querySelectorAll('.topic-menu-item').forEach(i => i.classList.remove('is-active'));
                this.classList.add('is-active');
                activeCat = this.dataset.cat;
                const titleEl = this.querySelector('.topic-item-title');
                const cleanLabel = titleEl ? titleEl.textContent.trim() : this.textContent.trim().replace(/^⚡|💻|🛡️|🌐|🏛️|💼|💰/, '').trim();
                if (currentTopicLabel) currentTopicLabel.textContent = cleanLabel;
                if (currentCatLabel) currentCatLabel.textContent = cleanLabel;
                feedTopicsMenu.style.display = 'none';
                btnFeedTopics.classList.remove('is-open');
                applyFilters();
                showToast(`Выбрана тема: ${cleanLabel}`, '🏷️');
            });
        });
    }

    // Category Selector
    const btnFeedCat = document.getElementById('btnFeedCatDropdown');
    const feedCatMenu = document.getElementById('feedCatMenu');
    const currentCatLabel = document.getElementById('currentCatLabel');

    if (btnFeedCat && feedCatMenu) {
        btnFeedCat.addEventListener('click', (e) => {
            e.stopPropagation();
            feedCatMenu.style.display = feedCatMenu.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            feedCatMenu.style.display = 'none';
        });

        document.querySelectorAll('.cat-menu-item').forEach(item => {
            item.addEventListener('click', function () {
                document.querySelectorAll('.cat-menu-item').forEach(i => i.classList.remove('is-active'));
                this.classList.add('is-active');
                activeCat = this.dataset.cat;
                if (currentCatLabel) currentCatLabel.textContent = this.textContent;
                const cleanLabel = this.textContent.trim().replace(/^⚡|💻|🛡️|🌐|🏛️|💼|💰/, '').trim();
                if (currentTopicLabel) currentTopicLabel.textContent = cleanLabel;
                feedCatMenu.style.display = 'none';
                applyFilters();
            });
        });
    }

    // Live Search (Hero Search Bar)
    const heroSearchInput = document.getElementById('feedHeroSearchInput');
    const btnClearHeroSearch = document.getElementById('btnClearHeroSearch');

    if (heroSearchInput) {
        heroSearchInput.addEventListener('input', function () {
            activeSearch = this.value.toLowerCase().trim();
            if (btnClearHeroSearch) btnClearHeroSearch.style.display = activeSearch ? 'block' : 'none';
            applyFilters();
        });
    }

    if (btnClearHeroSearch) {
        btnClearHeroSearch.addEventListener('click', () => {
            if (heroSearchInput) {
                heroSearchInput.value = '';
                heroSearchInput.dispatchEvent(new Event('input'));
                heroSearchInput.focus();
            }
        });
    }

    // =========================================================================
    // 11. QUICK CREATOR MODAL
    // =========================================================================
    const modalQuickCreate = document.getElementById('modalQuickCreate');
    const btnOpenQuickCreate = document.getElementById('btnOpenQuickCreate');
    const btnCloseQuickCreate = document.getElementById('btnCloseQuickCreate');
    const btnCancelQuickCreate = document.getElementById('btnCancelQuickCreate');
    const btnSubmitQuickPost = document.getElementById('btnSubmitQuickPost');
    const modalPollBuilder = document.getElementById('modalPollBuilder');
    const btnAddPollOption = document.getElementById('btnAddPollOption');
    const pollInputsList = document.getElementById('pollInputsList');

    let currentModalType = 'post';

    function openQuickModal(type = 'post') {
        currentModalType = type;
        document.querySelectorAll('.modal-tab-btn:not(.btn-full-editor-tab)').forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.modalType === type);
        });

        if (modalPollBuilder) {
            modalPollBuilder.style.display = (type === 'poll') ? 'block' : 'none';
        }

        if (modalQuickCreate) modalQuickCreate.style.display = 'flex';
    }

    function closeQuickModal() {
        if (modalQuickCreate) modalQuickCreate.style.display = 'none';
    }

    if (btnOpenQuickCreate) {
        btnOpenQuickCreate.addEventListener('click', () => openQuickModal('post'));
    }

    document.querySelectorAll('[data-create-type]').forEach(btn => {
        btn.addEventListener('click', function () {
            openQuickModal(this.dataset.createType);
        });
    });

    if (btnCloseQuickCreate) btnCloseQuickCreate.addEventListener('click', closeQuickModal);
    if (btnCancelQuickCreate) btnCancelQuickCreate.addEventListener('click', closeQuickModal);

    // Modal Tabs Switching
    document.querySelectorAll('.modal-tab-btn:not(.btn-full-editor-tab)').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('is-active'));
            this.classList.add('is-active');
            currentModalType = this.dataset.modalType;
            if (modalPollBuilder) {
                modalPollBuilder.style.display = (currentModalType === 'poll') ? 'block' : 'none';
            }
        });
    });

    // Add Poll Option in Modal
    if (btnAddPollOption && pollInputsList) {
        btnAddPollOption.addEventListener('click', () => {
            const count = pollInputsList.querySelectorAll('.poll-opt-input').length + 1;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'poll-opt-input';
            input.placeholder = `Вариант ${count}`;
            pollInputsList.appendChild(input);
        });
    }

    // Submit Quick Post
    if (btnSubmitQuickPost) {
        btnSubmitQuickPost.addEventListener('click', () => {
            const title = document.getElementById('quickPostTitle').value.trim();
            const cat = document.getElementById('quickPostCat').value;
            const tags = document.getElementById('quickPostTags').value.trim();
            const content = document.getElementById('quickPostContent').value.trim();

            if (!title) {
                alert('Пожалуйста, введите заголовок публикации.');
                return;
            }

            let authorName = 'Вы (Специалист)';
            let authorInitials = 'ВЫ';
            if (userProfileRaw) {
                try {
                    const u = JSON.parse(userProfileRaw);
                    authorName = u.displayName || u.firstName || 'Вы';
                    authorInitials = authorName.substring(0, 2).toUpperCase();
                } catch (e) {}
            }

            const stream = document.getElementById('feedPostsStream');
            const newCard = document.createElement('article');
            const newId = Date.now();
            newCard.className = `feed-card post-${currentModalType}-card`;
            newCard.id = `post-${newId}`;
            newCard.dataset.postId = newId;
            newCard.dataset.type = currentModalType;
            newCard.dataset.cat = cat;

            let formatLabel = '💬 Пост';
            let badgeClass = 'badge-post';
            if (currentModalType === 'poll') {
                formatLabel = '📊 Голосование RFC';
                badgeClass = 'badge-poll';
            } else if (currentModalType === 'question') {
                formatLabel = '❓ Вопрос';
                badgeClass = 'badge-question';
            } else if (currentModalType === 'case') {
                formatLabel = '💼 Кейс / Паспорт';
                badgeClass = 'badge-case';
            }

            let customPollHtml = '';
            if (currentModalType === 'poll') {
                const pollOpts = Array.from(pollInputsList.querySelectorAll('.poll-opt-input')).map(i => i.value.trim()).filter(Boolean);
                customPollHtml = `
                    <div class="interactive-poll-box" data-poll-id="poll-${newId}" data-total-votes="1">
                        ${pollOpts.map((opt, idx) => `
                            <div class="poll-option-row" data-opt-id="${idx + 1}">
                                <button type="button" class="poll-option-btn">
                                    <div class="poll-opt-progress" style="width: 0%;"></div>
                                    <div class="poll-opt-content">
                                        <span class="opt-check">◯</span>
                                        <span class="opt-text">${escapeHtml(opt)}</span>
                                        <span class="opt-percent">0%</span>
                                    </div>
                                </button>
                                <span class="opt-votes-count">0 голосов</span>
                            </div>
                        `).join('')}
                        <div class="poll-footer-meta">
                            <span>👥 <strong>1</strong> участник</span>
                            <span>⏳ Голосование активно</span>
                        </div>
                    </div>
                `;
            }

            newCard.innerHTML = `
                <div class="feed-card-header">
                    <div class="author-block">
                        <div class="author-avatar avatar-blue">${authorInitials}</div>
                        <div class="author-info">
                            <div class="author-line">
                                <span class="author-name">${escapeHtml(authorName)}</span>
                                <span class="shield-badge badge-verified">✓ Автор</span>
                            </div>
                            <div class="author-role-sub">Сообщество SmartContractum · только что</div>
                        </div>
                    </div>
                    <div class="post-badges">
                        <span class="step-pill-badge pill-active">${formatLabel}</span>
                    </div>
                </div>
                <h2 class="post-title">${escapeHtml(title)}</h2>
                ${content ? `<p class="post-snippet">${escapeHtml(content)}</p>` : ''}
                ${customPollHtml}
                <div class="post-tags-row">
                    ${tags.split(',').map(t => `<span class="tag-pill">${t.trim().startsWith('#') ? escapeHtml(t.trim()) : '#' + escapeHtml(t.trim())}</span>`).join('')}
                </div>
                <div class="feed-card-footer">
                    <div class="footer-actions-left">
                        <div class="karma-lever" data-post-id="${newId}">
                            <button type="button" class="karma-btn upvote">▲</button>
                            <span class="karma-val text-emerald">+1</span>
                            <button type="button" class="karma-btn downvote">▼</button>
                        </div>
                        <button type="button" class="btn-thread-toggle" data-target-thread="thread-${newId}">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd"></path>
                            </svg>
                            <span>0 комментариев</span>
                        </button>
                    </div>
                    <div class="footer-actions-right">
                        <div class="reaction-bar">
                            <button type="button" class="btn-react" data-emoji="🔥">🔥 <span class="react-cnt">1</span></button>
                        </div>
                        <button type="button" class="btn-action-icon btn-bookmark-post" title="В закладки">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            if (stream) {
                stream.insertBefore(newCard, stream.firstChild);
            }

            closeQuickModal();
            showToast('Публикация успешно размещена в ленте!', '🚀');

            // Reset inputs
            document.getElementById('quickPostTitle').value = '';
            document.getElementById('quickPostTags').value = '';
            document.getElementById('quickPostContent').value = '';
        });
    }

    // =========================================================================
    // 8. COSMIC PARTICLE CANVAS FOR FEED HERO STRIP
    // =========================================================================
    function initFeedCanvas() {
        const canvas = document.getElementById('feedCosmicCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = (canvas.width = canvas.parentElement.offsetWidth || 1400);
        let h = (canvas.height = canvas.parentElement.offsetHeight || 360);

        const particles = [];
        const PARTICLE_COUNT = 36;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.4 ? '#38bdf8' : '#10b981',
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        function render() {
            ctx.clearRect(0, 0, w, h);

            // Draw connecting lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = isLight 
                            ? `rgba(2, 132, 199, ${0.12 * (1 - dist / 120)})`
                            : `rgba(56, 189, 248, ${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = isLight ? (p.color === '#38bdf8' ? '#0284c7' : '#059669') : p.color;
                ctx.globalAlpha = isLight ? p.alpha * 0.75 : p.alpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            requestAnimationFrame(render);
        }

        window.addEventListener('resize', () => {
            if (!canvas.parentElement) return;
            w = canvas.width = canvas.parentElement.offsetWidth || 1400;
            h = canvas.height = canvas.parentElement.offsetHeight || 360;
        });

        render();
    }
    initFeedCanvas();

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});