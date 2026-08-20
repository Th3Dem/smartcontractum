/**
 * SmartContractum — Habr Feed Light Theme 2.0
 * Interactive JS Controller: Search, Period Filtering, Categories Dropdown,
 * Voting, Comments, Code Copying & Modals.
 * File: frontend/static/js/forum_social.js
 */

document.addEventListener('DOMContentLoaded', () => {
    initSearchBox();
    initDropdowns();
    initArticleCards();
    initWriteModal();
    initToast();
});

/**
 * 1. Live & Enter Search
 */
function initSearchBox() {
    const searchInput = document.getElementById('habrSearchInput');
    const clearBtn = document.getElementById('btnClearSearch');

    if (!searchInput) return;

    // Show/hide clear button
    searchInput.addEventListener('input', () => {
        if (clearBtn) {
            clearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
        }
    });

    // Enter key submits search query
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch(searchInput.value.trim());
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            searchInput.focus();
            executeSearch('');
        });
    }
}

function executeSearch(query) {
    const url = new URL(window.location.href);
    if (query) {
        url.searchParams.set('q', query);
    } else {
        url.searchParams.delete('q');
    }
    window.location.href = url.toString();
}

/**
 * 2. Categories and Period Dropdowns
 */
function initDropdowns() {
    // Period Dropdown
    const btnPeriod = document.getElementById('btnPeriodDropdown');
    const menuPeriod = document.getElementById('periodDropdownMenu');

    if (btnPeriod && menuPeriod) {
        btnPeriod.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuPeriod.classList.toggle('is-open');
            btnPeriod.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // Categories Dropdown
    const btnCategories = document.getElementById('btnCategoriesDropdown');
    const menuCategories = document.getElementById('categoriesDropdownMenu');

    if (btnCategories && menuCategories) {
        btnCategories.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menuCategories.classList.toggle('is-open');
            btnCategories.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (menuPeriod && !menuPeriod.contains(e.target) && e.target !== btnPeriod) {
            menuPeriod.classList.remove('is-open');
            if (btnPeriod) btnPeriod.setAttribute('aria-expanded', 'false');
        }
        if (menuCategories && !menuCategories.contains(e.target) && e.target !== btnCategories) {
            menuCategories.classList.remove('is-open');
            if (btnCategories) btnCategories.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * 3. Article Cards Interactions (Read More, Karma, Bookmark, Comments, Copy Code, Share)
 */
function initArticleCards() {
    // Read More Body Toggle
    document.querySelectorAll('[data-action="toggle-body"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = btn.getAttribute('data-post-id');
            const bodyEl = document.getElementById(`body-${postId}`);
            const textEl = btn.querySelector('.readmore-text');
            const arrowEl = btn.querySelector('.readmore-arrow');

            if (!bodyEl) return;

            const isHidden = bodyEl.style.display === 'none' || !bodyEl.style.display;
            if (isHidden) {
                bodyEl.style.display = 'block';
                if (textEl) textEl.textContent = 'Свернуть';
                if (arrowEl) arrowEl.textContent = '↑';
            } else {
                bodyEl.style.display = 'none';
                if (textEl) textEl.textContent = 'Читать далее';
                if (arrowEl) arrowEl.textContent = '↓';
            }
        });
    });

    // Upvote / Karma Score
    document.querySelectorAll('[data-action="upvote"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.getAttribute('data-post-id');
            const card = document.getElementById(`post-${postId}`) || btn.closest('.habr-article-card');
            const scoreValEl = card ? card.querySelector('.habr-score-val') : null;

            btn.classList.toggle('is-active');
            const isUp = btn.classList.contains('is-active');

            if (scoreValEl) {
                let current = parseInt(scoreValEl.textContent.replace('+', ''), 10) || 0;
                current += isUp ? 1 : -1;
                scoreValEl.textContent = current > 0 ? `+${current}` : `${current}`;
                if (current > 0) scoreValEl.classList.add('is-positive');
                else scoreValEl.classList.remove('is-positive');
            }

            try {
                await fetch(`/api/v1/forum/topics/${postId}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vote_type: isUp ? 'up' : 'unvote' })
                });
            } catch (err) {
                // Silently handle offline/mock
            }
        });
    });

    // Downvote
    document.querySelectorAll('[data-action="downvote"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.getAttribute('data-post-id');
            const card = document.getElementById(`post-${postId}`) || btn.closest('.habr-article-card');
            const scoreValEl = card ? card.querySelector('.habr-score-val') : null;

            btn.classList.toggle('is-active');
            const isDown = btn.classList.contains('is-active');

            if (scoreValEl) {
                let current = parseInt(scoreValEl.textContent.replace('+', ''), 10) || 0;
                current -= isDown ? 1 : -1;
                scoreValEl.textContent = current > 0 ? `+${current}` : `${current}`;
                if (current > 0) scoreValEl.classList.add('is-positive');
                else scoreValEl.classList.remove('is-positive');
            }
        });
    });

    // Bookmark Toggle
    document.querySelectorAll('[data-action="bookmark"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.getAttribute('data-post-id');
            const valEl = btn.querySelector('.stat-val');
            const isActive = btn.classList.toggle('is-active');

            if (valEl) {
                let count = parseInt(valEl.textContent, 10) || 0;
                count += isActive ? 1 : -1;
                valEl.textContent = Math.max(0, count);
            }

            showToast(isActive ? 'Статья сохранена в закладки' : 'Статья удалена из закладок');

            try {
                await fetch(`/api/v1/forum/topics/${postId}/bookmark`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (err) {
                // Silently handle
            }
        });
    });

    // Comments Toggle
    document.querySelectorAll('[data-action="toggle-comments"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = btn.getAttribute('data-post-id');
            const commentsSec = document.getElementById(`comments-${postId}`);
            if (!commentsSec) return;

            const isHidden = commentsSec.style.display === 'none' || !commentsSec.style.display;
            commentsSec.style.display = isHidden ? 'flex' : 'none';
        });
    });

    // Comment Form Submit
    document.querySelectorAll('.habr-comment-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = form.getAttribute('data-post-id');
            const textarea = form.querySelector('.habr-comment-textarea');
            const commentText = textarea ? textarea.value.trim() : '';

            if (!commentText || commentText.length < 3) return;

            const listEl = document.getElementById(`comments-list-${postId}`);
            if (listEl) {
                const item = document.createElement('div');
                item.className = 'habr-comment-item';
                item.innerHTML = `
                    <div class="comment-header-line">
                        <div class="comment-avatar">Я</div>
                        <span class="comment-author-name">Вы (Разработчик)</span>
                        <span class="comment-author-handle">@you</span>
                        <span class="comment-time">только что</span>
                    </div>
                    <div class="comment-text-body">
                        <p>${escapeHtml(commentText)}</p>
                    </div>
                `;
                listEl.appendChild(item);
                textarea.value = '';
                showToast('Комментарий успешно добавлен!');
            }
        });
    });

    // Copy Code Snippet
    document.querySelectorAll('.btn-copy-code').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.habr-code-block');
            const codeEl = codeBlock ? codeBlock.querySelector('code') : null;
            if (!codeEl) return;

            navigator.clipboard.writeText(codeEl.innerText).then(() => {
                const label = btn.querySelector('span');
                const origText = label ? label.textContent : '';
                if (label) label.textContent = 'Скопировано!';
                showToast('Код скопирован в буфер обмена');
                setTimeout(() => {
                    if (label) label.textContent = origText || 'Скопировать';
                }, 2000);
            }).catch(() => {
                showToast('Не удалось скопировать код');
            });
        });
    });

    // Share Button
    document.querySelectorAll('[data-action="share"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.getAttribute('data-post-id');
            const url = `${window.location.origin}/feed#post-${postId}`;

            navigator.clipboard.writeText(url).then(() => {
                showToast('Ссылка скопирована в буфер обмена!');
            }).catch(() => {
                showToast('Ссылка: ' + url);
            });

            try {
                await fetch(`/api/v1/forum/topics/${postId}/share`, { method: 'POST' });
            } catch (err) {
                // Silently ignore
            }
        });
    });

    // Hub Follow / Subscribe buttons
    document.querySelectorAll('.btn-hub-follow').forEach(btn => {
        btn.addEventListener('click', async () => {
            const hubSlug = btn.getAttribute('data-hub');
            const isFollowing = btn.classList.toggle('is-following');
            btn.textContent = isFollowing ? '✓ Вы подписаны' : '+ Подписаться';

            showToast(isFollowing ? `Вы подписались на хаб "${hubSlug}"` : `Вы отписались от хаба "${hubSlug}"`);

            try {
                const endpoint = isFollowing ? `/api/v1/forum/hubs/${hubSlug}/subscribe` : `/api/v1/forum/hubs/${hubSlug}/unsubscribe`;
                await fetch(endpoint, { method: 'POST' });
            } catch (err) {
                // Silently ignore
            }
        });
    });
}

/**
 * 4. Write Modal Controller
 */
function initWriteModal() {
    const modal = document.getElementById('habrWriteModal');
    const btnOpen = document.getElementById('btnOpenWriteModal');
    const btnClose = document.getElementById('btnCloseWriteModal');
    const btnCancel = document.getElementById('btnCancelWriteModal');
    const form = document.getElementById('habrWriteForm');

    if (!modal) return;

    const openModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
    };

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-active')) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const spinner = document.getElementById('submitSpinner');
            const submitBtn = document.getElementById('btnSubmitArticle');
            if (spinner) spinner.style.display = 'inline-block';
            if (submitBtn) submitBtn.disabled = true;

            const formData = {
                title: form.title.value.trim(),
                category_slug: form.category_slug.value,
                author_role: form.author_role.value,
                tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
                body: form.body.value.trim(),
                code_snippet: form.code_snippet.value.trim()
            };

            try {
                const res = await fetch('/api/v1/forum/topics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    showToast('Статья успешно опубликована!');
                    closeModal();
                    form.reset();
                    setTimeout(() => window.location.reload(), 800);
                } else {
                    const err = await res.json();
                    showToast(err.detail || 'Ошибка при публикации');
                }
            } catch (err) {
                showToast('Ошибка сети при отправке публикации');
            } finally {
                if (spinner) spinner.style.display = 'none';
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

/**
 * 5. Toast Notification System
 */
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById('habrToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast) return;

    if (msgEl) msgEl.textContent = message;
    toast.style.display = 'block';

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3200);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
