/**
 * SmartContractum — Forum & Lenta Client Controller (Block 2)
 * Dynamic AJAX Category/Tag Filtering, Modal Handling & Topic Posting
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const topicsContainer = document.getElementById('topicsFeedContainer');
    const filterBadge = document.getElementById('activeFilterBadge');
    const btnResetFilter = document.getElementById('btnResetFilter');
    const categoryLinks = document.querySelectorAll('.category-link');
    const modalOverlay = document.getElementById('createTopicModal');
    const btnOpenModal = document.getElementById('btnOpenCreateModal');
    const btnCloseModal = document.getElementById('btnCloseCreateModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const createForm = document.getElementById('createTopicForm');
    const alertBox = document.getElementById('formAlertBox');
    const btnSubmit = document.getElementById('btnSubmitTopic');
    const spinner = document.getElementById('submitSpinner');

    // ==================================================================
    // 1. MODAL WINDOW CONTROLLER
    // ==================================================================

    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('is-active');
            modalOverlay.setAttribute('aria-hidden', 'false');
            if (alertBox) alertBox.style.display = 'none';
            document.body.style.overflow = 'hidden';
            const firstInput = document.getElementById('topicTitleInput');
            if (firstInput) firstInput.focus();
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('is-active');
            modalOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (createForm) createForm.reset();
        }
    }

    if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Close on backdrop click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-active')) {
            closeModal();
        }
    });

    // ==================================================================
    // 2. DYNAMIC CARD RENDERER
    // ==================================================================

    function renderTopicCard(topic) {
        const officialBadgeHtml = topic.is_official && topic.official_badge
            ? `<span class="official-badge" title="Официальный статус топика"><span class="badge-dot"></span>${topic.official_badge}</span>`
            : '';

        const tagsHtml = (topic.tags || [])
            .map((tag) => `<a href="/feed?tag=${encodeURIComponent(tag)}" class="topic-tag-pill" data-tag="${tag}">#${tag}</a>`)
            .join(' ');

        return `
            <article class="topic-card" id="topic-card-${topic.id}">
                <div class="topic-header">
                    <div class="author-meta">
                        <div class="author-avatar">${topic.author_avatar || 'SC'}</div>
                        <div class="author-details">
                            <span class="author-name">${topic.author_name}</span>
                            <span class="author-role">${topic.author_role || 'Разработчик'}</span>
                        </div>
                    </div>
                    <div class="topic-meta-right">
                        <span class="topic-timestamp">${topic.created_at}</span>
                        ${officialBadgeHtml}
                    </div>
                </div>

                <h2 class="topic-title">
                    <a href="#topic-${topic.id}" class="topic-title-link" data-id="${topic.id}">${topic.title}</a>
                </h2>

                <p class="topic-snippet">${topic.snippet}</p>

                <div class="topic-tags-list">
                    ${tagsHtml}
                </div>

                <div class="topic-card-footer">
                    <div class="stats-group">
                        <span class="stat-item" title="Ответов в теме">
                            <span class="stat-icon">💬</span>
                            <span class="stat-value">${topic.replies_count || 0} ответов</span>
                        </span>
                        <span class="stat-item" title="Просмотров темы">
                            <span class="stat-icon">👁️</span>
                            <span class="stat-value">${topic.views_count || 1}</span>
                        </span>
                    </div>
                    <button class="btn-bookmark" title="Сохранить в закладки" data-id="${topic.id}">
                        <span class="bookmark-icon">🔖</span>
                        <span>В закладки</span>
                    </button>
                </div>
            </article>
        `;
    }

    // ==================================================================
    // 3. AJAX FEED FILTERING (CATEGORY & TAGS)
    // ==================================================================

    async function fetchTopics(categorySlug = null, tag = null) {
        if (!topicsContainer) return;

        topicsContainer.style.opacity = '0.5';
        try {
            const params = new URLSearchParams();
            if (categorySlug && categorySlug !== 'all') params.append('category_slug', categorySlug);
            if (tag) params.append('tag', tag);

            const res = await fetch(`/api/v1/forum/topics?${params.toString()}`);
            if (!res.ok) throw new Error('Ошибка загрузки ленты');

            const data = await res.json();
            const topics = data.items || [];

            if (topics.length === 0) {
                topicsContainer.innerHTML = `
                    <div class="empty-feed-card">
                        <span class="empty-icon">📭</span>
                        <h3>Тем в этой категории пока нет</h3>
                        <p>Будьте первым, кто создаст обсуждение по данному направлению!</p>
                    </div>
                `;
            } else {
                topicsContainer.innerHTML = topics.map(renderTopicCard).join('');
            }

            // Update Filter Badge
            if (filterBadge) {
                if (tag) {
                    filterBadge.textContent = `Тег #${tag}`;
                } else if (categorySlug && categorySlug !== 'all') {
                    const activeCatLink = document.querySelector(`.category-link[data-slug="${categorySlug}"] .category-name`);
                    filterBadge.textContent = activeCatLink ? `Категория: ${activeCatLink.textContent}` : `Категория: ${categorySlug}`;
                } else {
                    filterBadge.textContent = 'Все обсуждения';
                }
            }

            if (btnResetFilter) {
                btnResetFilter.style.display = (categorySlug !== 'all' || tag) ? 'inline-block' : 'none';
            }

            // Update URL in browser without full reload
            const newUrl = (categorySlug && categorySlug !== 'all')
                ? `/feed?category=${categorySlug}`
                : (tag ? `/feed?tag=${encodeURIComponent(tag)}` : '/feed');
            window.history.pushState({}, '', newUrl);

        } catch (err) {
            console.error(err);
            topicsContainer.innerHTML = `<div class="empty-feed-card"><p>Не удалось обновить ленту. Повторите попытку.</p></div>`;
        } finally {
            topicsContainer.style.opacity = '1';
        }
    }

    // Category click listener
    categoryLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const slug = link.getAttribute('data-slug') || 'all';

            categoryLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');

            fetchTopics(slug, null);
        });
    });

    // Delegate Tag Click listeners
    document.addEventListener('click', (e) => {
        const tagPill = e.target.closest('.topic-tag-pill, .cloud-tag-pill');
        if (tagPill) {
            e.preventDefault();
            const tag = tagPill.getAttribute('data-tag');
            if (tag) {
                categoryLinks.forEach((l) => l.classList.remove('active'));
                fetchTopics(null, tag);
            }
        }
    });

    // Reset filter click
    if (btnResetFilter) {
        btnResetFilter.addEventListener('click', () => {
            const allCatLink = document.querySelector('.category-link[data-slug="all"]');
            categoryLinks.forEach((l) => l.classList.remove('active'));
            if (allCatLink) allCatLink.classList.add('active');
            fetchTopics('all', null);
        });
    }

    // ==================================================================
    // 4. FORM SUBMISSION (CREATE TOPIC)
    // ==================================================================

    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('topicTitleInput').value.trim();
            const category_slug = document.getElementById('topicCategorySelect').value;
            const tagsRaw = document.getElementById('topicTagsInput').value.trim();
            const body = document.getElementById('topicBodyInput').value.trim();

            if (title.length < 10) {
                showAlert('Заголовок должен содержать минимум 10 символов.', 'error');
                return;
            }
            if (body.length < 30) {
                showAlert('Текст сообщения должен содержать минимум 30 символов.', 'error');
                return;
            }

            const tags = tagsRaw
                ? tagsRaw.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
                : [];

            const payload = {
                title,
                category_slug,
                body,
                tags,
                author_name: 'ООО Интегратор (Umbrella-Dev)',
                author_role: 'Umbrella-Dev',
            };

            // Loading state
            if (btnSubmit) btnSubmit.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';

            try {
                const response = await fetch('/api/v1/forum/topics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (!response.ok) {
                    const detailMsg = Array.isArray(result.detail)
                        ? result.detail.map((d) => d.msg).join(', ')
                        : (result.detail || 'Не удалось создать тему.');
                    showAlert(`Ошибка: ${detailMsg}`, 'error');
                    return;
                }

                showAlert('✅ Тема успешно создана и опубликована в ленте!', 'success');

                // Prepend new card to feed
                if (result.topic && topicsContainer) {
                    const emptyCard = topicsContainer.querySelector('.empty-feed-card');
                    if (emptyCard) emptyCard.remove();

                    const cardHtml = renderTopicCard(result.topic);
                    topicsContainer.insertAdjacentHTML('afterbegin', cardHtml);
                }

                // Update category counter badge
                const countBadge = document.getElementById(`count-${category_slug}`);
                if (countBadge) {
                    countBadge.textContent = String(parseInt(countBadge.textContent || '0', 10) + 1);
                }
                const countAll = document.getElementById('count-all');
                if (countAll) {
                    countAll.textContent = String(parseInt(countAll.textContent || '0', 10) + 1);
                }

                setTimeout(() => {
                    closeModal();
                }, 700);

            } catch (err) {
                console.error(err);
                showAlert('Сетевая ошибка при отправке темы. Проверьте соединение.', 'error');
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
                if (spinner) spinner.style.display = 'none';
            }
        });
    }

    function showAlert(msg, type = 'error') {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.className = `form-alert-box alert-${type}`;
        alertBox.style.display = 'block';
    }
});
