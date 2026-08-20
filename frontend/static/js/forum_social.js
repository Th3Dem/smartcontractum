/**
 * SmartContractum — Dev Social Network Hub Controller
 * Instant client & AJAX filtering, upvotes, comment accordions, and quick publishing.
 * File: frontend/static/js/forum_social.js
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        // Elements
        const postsStream = document.getElementById("postsStream");
        const emptyState = document.getElementById("feedEmptyState");
        const filterTabBtns = document.querySelectorAll(".filter-tab-btn");
        const tagChips = document.querySelectorAll(".tag-chip-btn[data-tag]");
        const btnResetTag = document.getElementById("btnResetTagFilter");

        // Modal Elements
        const publisherModal = document.getElementById("socialPublisherModal");
        const btnOpenPublisher = document.getElementById("btnOpenPublisherModal");
        const btnClosePublisher = document.getElementById("btnClosePublisherModal");
        const btnCancelPublisher = document.getElementById("btnCancelPublisherModal");
        const publisherForm = document.getElementById("socialPublisherForm");
        const quickActionBtns = document.querySelectorAll(".btn-quick-action");
        const btnEmptyCreate = document.getElementById("btnEmptyCreate");
        const submitSpinner = document.getElementById("submitSpinner");
        const btnSubmitPost = document.getElementById("btnSubmitPost");
        const formAlertBox = document.getElementById("formAlertBox");

        // Toast
        const toast = document.getElementById("socialToast");
        const toastMessage = document.getElementById("toastMessage");

        let activeTypeFilter = "all";
        let activeTagFilter = null;

        function showToast(msg) {
            if (!toast || !toastMessage) return;
            toastMessage.textContent = msg;
            toast.style.display = "flex";
            setTimeout(function () {
                toast.style.display = "none";
            }, 3000);
        }

        // ==================================================================
        // 1. FILTERING ENGINE (Instant Client-Side Tabs & Tags)
        // ==================================================================
        function applyFilters() {
            let visibleCount = 0;
            const allPosts = document.querySelectorAll(".social-post-card");
            allPosts.forEach(function (card) {
                const postType = card.getAttribute("data-post-type");
                const tagElements = card.querySelectorAll(".post-tag-item");
                const cardTags = Array.from(tagElements).map(function (el) {
                    return el.getAttribute("data-tag").toLowerCase();
                });

                let matchesType = (activeTypeFilter === "all") || (postType === activeTypeFilter);
                let matchesTag = true;

                if (activeTagFilter) {
                    const targetTag = activeTagFilter.toLowerCase().replace("#", "");
                    matchesTag = cardTags.some(function (t) {
                        return t.includes(targetTag);
                    });
                }

                if (matchesType && matchesTag) {
                    card.style.display = "flex";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? "flex" : "none";
            }
        }

        // Filter Tabs Click
        filterTabBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                filterTabBtns.forEach(function (b) { b.classList.remove("is-active"); });
                btn.classList.add("is-active");
                activeTypeFilter = btn.getAttribute("data-filter-type") || "all";
                applyFilters();
            });
        });

        // Live Tag Chips Click
        tagChips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                const tagVal = chip.getAttribute("data-tag");
                if (activeTagFilter === tagVal) {
                    activeTagFilter = null;
                    chip.classList.remove("is-active");
                    if (btnResetTag) btnResetTag.style.display = "none";
                } else {
                    tagChips.forEach(function (c) { c.classList.remove("is-active"); });
                    chip.classList.add("is-active");
                    activeTagFilter = tagVal;
                    if (btnResetTag) btnResetTag.style.display = "inline-block";
                }
                applyFilters();
            });
        });

        // Reset Tag Filter
        if (btnResetTag) {
            btnResetTag.addEventListener("click", function () {
                activeTagFilter = null;
                tagChips.forEach(function (c) { c.classList.remove("is-active"); });
                btnResetTag.style.display = "none";
                applyFilters();
            });
        }

        // Post Tags Click inside Cards
        document.addEventListener("click", function (e) {
            const tagBtn = e.target.closest(".post-tag-item, .trend-tag-row");
            if (tagBtn) {
                e.preventDefault();
                const targetTag = tagBtn.getAttribute("data-tag");
                if (targetTag) {
                    activeTagFilter = targetTag;
                    tagChips.forEach(function (c) {
                        if (c.getAttribute("data-tag").toLowerCase() === targetTag.toLowerCase()) {
                            c.classList.add("is-active");
                        } else {
                            c.classList.remove("is-active");
                        }
                    });
                    if (btnResetTag) btnResetTag.style.display = "inline-block";
                    applyFilters();
                    window.scrollTo({ top: 150, behavior: "smooth" });
                }
            }
        });

        // ==================================================================
        // 2. INTERACTIVE POST ACTIONS (Upvotes, Accordions, Bookmarks, Share)
        // ==================================================================
        if (postsStream) {
            postsStream.addEventListener("click", async function (e) {
                // 2.1 Upvote / Like Button
                const btnUpvote = e.target.closest(".btn-upvote");
                if (btnUpvote) {
                    const postId = btnUpvote.getAttribute("data-post-id");
                    const countEl = btnUpvote.querySelector(".action-count");
                    const isActive = btnUpvote.classList.contains("is-active");

                    let curCount = parseInt(countEl.textContent || "0", 10);
                    if (isActive) {
                        btnUpvote.classList.remove("is-active");
                        countEl.textContent = Math.max(0, curCount - 1);
                    } else {
                        btnUpvote.classList.add("is-active");
                        countEl.textContent = curCount + 1;
                    }

                    // Sync with Backend
                    try {
                        await fetch("/api/v1/forum/posts/" + postId + "/upvote", { method: "POST" });
                    } catch (err) {
                        console.error("Failed to sync upvote:", err);
                    }
                    return;
                }

                // 2.2 Comments Toggle
                const btnComments = e.target.closest(".btn-comments");
                if (btnComments) {
                    const postId = btnComments.getAttribute("data-post-id");
                    const accordion = document.getElementById("comments-" + postId);
                    if (accordion) {
                        if (accordion.style.display === "none" || accordion.style.display === "") {
                            accordion.style.display = "block";
                            const input = accordion.querySelector(".comment-input-field");
                            if (input) input.focus();
                        } else {
                            accordion.style.display = "none";
                        }
                    }
                    return;
                }

                // 2.3 Bookmark Toggle
                const btnBookmark = e.target.closest(".btn-bookmark");
                if (btnBookmark) {
                    const postId = btnBookmark.getAttribute("data-post-id");
                    const isBookmarked = btnBookmark.classList.contains("is-active");

                    if (isBookmarked) {
                        btnBookmark.classList.remove("is-active");
                        showToast("Удалено из закладок");
                    } else {
                        btnBookmark.classList.add("is-active");
                        showToast("Сохранено в закладки!");
                    }

                    try {
                        await fetch("/api/v1/forum/posts/" + postId + "/bookmark", { method: "POST" });
                    } catch (err) {
                        console.error("Failed to sync bookmark:", err);
                    }
                    return;
                }

                // 2.4 Share Button
                const btnShare = e.target.closest(".btn-share");
                if (btnShare) {
                    const postId = btnShare.getAttribute("data-post-id");
                    const postUrl = window.location.origin + "/feed#post-" + postId;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(postUrl).then(function () {
                            showToast("Прямая ссылка на публикацию скопирована!");
                        });
                    } else {
                        showToast("Ссылка: " + postUrl);
                    }
                    return;
                }

                // 2.5 Copy Code Snippet
                const btnCopy = e.target.closest(".btn-copy-code");
                if (btnCopy) {
                    const codeWrap = btnCopy.closest(".post-code-wrapper");
                    const codeEl = codeWrap ? codeWrap.querySelector(".code-content") : null;
                    if (codeEl && navigator.clipboard) {
                        navigator.clipboard.writeText(codeEl.textContent).then(function () {
                            btnCopy.innerHTML = "<span class=\"copy-icon\">✓</span> <span>Скопировано!</span>";
                            setTimeout(function () {
                                btnCopy.innerHTML = "<span class=\"copy-icon\">📋</span> <span>Копировать</span>";
                            }, 2000);
                        });
                    }
                    return;
                }
            });
        }

        // ==================================================================
        // 3. COMMENT SUBMISSION (Instant Append)
        // ==================================================================
        document.addEventListener("submit", async function (e) {
            const commentForm = e.target.closest(".comment-create-form");
            if (commentForm) {
                e.preventDefault();
                const postId = commentForm.getAttribute("data-post-id");
                const inputField = commentForm.querySelector(".comment-input-field");
                const text = inputField.value.trim();
                if (!text) return;

                const commentsList = document.getElementById("comments-list-" + postId);
                const btnComments = document.querySelector('.btn-comments[data-post-id="' + postId + '"]');
                const commentsCountEl = btnComments ? btnComments.querySelector(".action-count") : null;

                // Optimistic instant append
                const newCommentHtml = `
                    <div class="comment-item">
                        <div class="comment-avatar">ИД</div>
                        <div class="comment-body-box">
                            <div class="comment-header">
                                <span class="comment-author">ООО Интегратор (Umbrella-Dev)</span>
                                <span class="comment-role-badge role-dev">[👨‍💻 Разработчик]</span>
                                <span class="comment-time">Только что</span>
                            </div>
                            <p class="comment-text">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                        </div>
                    </div>
                `;

                if (commentsList) {
                    commentsList.insertAdjacentHTML("beforeend", newCommentHtml);
                }
                inputField.value = "";

                if (commentsCountEl) {
                    const cur = parseInt(commentsCountEl.textContent || "0", 10);
                    commentsCountEl.textContent = cur + 1;
                }

                showToast("Комментарий опубликован!");

                // Send to Server
                try {
                    await fetch("/api/v1/forum/posts/" + postId + "/comments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            body: text,
                            author_name: "ООО Интегратор (Umbrella-Dev)",
                            author_role: "Разработчик"
                        })
                    });
                } catch (err) {
                    console.error("Failed to submit comment:", err);
                }
            }
        });

        // ==================================================================
        // 4. QUICK PUBLISHER MODAL CONTROLLER
        // ==================================================================
        function openPublisherModal(preselectedType) {
            if (!publisherModal) return;
            publisherModal.classList.add("is-active");
            publisherModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            if (preselectedType) {
                const radio = publisherModal.querySelector('input[name="post_type"][value="' + preselectedType + '"]');
                if (radio) radio.checked = true;
            }

            const titleInput = document.getElementById("postTitleInput");
            if (titleInput) titleInput.focus();
        }

        function closePublisherModal() {
            if (!publisherModal) return;
            publisherModal.classList.remove("is-active");
            publisherModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            if (formAlertBox) formAlertBox.style.display = "none";
        }

        if (btnOpenPublisher) btnOpenPublisher.addEventListener("click", () => openPublisherModal("article"));
        if (btnEmptyCreate) btnEmptyCreate.addEventListener("click", () => openPublisherModal("article"));
        if (btnClosePublisher) btnClosePublisher.addEventListener("click", closePublisherModal);
        if (btnCancelPublisher) btnCancelPublisher.addEventListener("click", closePublisherModal);

        quickActionBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                const typeVal = btn.getAttribute("data-type-select") || "article";
                openPublisherModal(typeVal);
            });
        });

        if (publisherModal) {
            publisherModal.addEventListener("click", function (e) {
                if (e.target === publisherModal) closePublisherModal();
            });
        }

        // Handle Create Post Form Submission
        if (publisherForm) {
            publisherForm.addEventListener("submit", async function (e) {
                e.preventDefault();

                const formData = new FormData(publisherForm);
                const title = formData.get("title");
                const category_slug = formData.get("category_slug");
                const post_type = formData.get("post_type") || "article";
                const author_role = formData.get("author_role") || "Разработчик";
                const tagsRaw = formData.get("tags") || "";
                const body = formData.get("body");
                const code_snippet = formData.get("code_snippet");

                const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);

                if (submitSpinner) submitSpinner.style.display = "inline-block";
                if (btnSubmitPost) btnSubmitPost.disabled = true;

                try {
                    const resp = await fetch("/api/v1/forum/posts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: title,
                            category_slug: category_slug,
                            post_type: post_type,
                            author_role: author_role,
                            author_name: "ООО Интегратор (Umbrella-Dev)",
                            tags: tags,
                            body: body,
                            code_snippet: code_snippet || null,
                            code_language: "solidity"
                        })
                    });

                    if (!resp.ok) {
                        const errData = await resp.json();
                        throw new Error(errData.detail || "Ошибка валидации данных");
                    }

                    const resData = await resp.json();
                    const newPost = resData.topic;

                    // Dynamically prepend new post card
                    const newCardHtml = `
                        <article class="social-post-card" id="post-${newPost.id}" data-post-id="${newPost.id}" data-post-type="${newPost.post_type}" data-category="${newPost.category_slug}">
                            <div class="post-header">
                                <div class="author-avatar-wrap">
                                    <div class="author-avatar-box">${newPost.author_avatar}</div>
                                </div>
                                <div class="author-info-box">
                                    <div class="author-name-row">
                                        <span class="author-name">${newPost.author_name}</span>
                                        <span class="author-role-badge ${newPost.author_role_class}">${newPost.author_role_badge}</span>
                                    </div>
                                    <div class="post-meta-row">
                                        <span class="post-timestamp">Только что</span>
                                        <span class="meta-dot">•</span>
                                        <span class="post-reading-time">⏱️ 2 мин</span>
                                        <span class="meta-dot">•</span>
                                        <span class="post-type-badge ${newPost.post_type_class}">${newPost.post_type_label}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="post-content-body">
                                <h3 class="post-title">${newPost.title}</h3>
                                <div class="post-text">${newPost.body.replace(/\n/g, "<br>")}</div>
                                ${newPost.code_snippet ? `
                                <div class="post-code-wrapper">
                                    <div class="code-header">
                                        <span class="code-lang-label">🔷 SOLIDITY</span>
                                        <button type="button" class="btn-copy-code" title="Скопировать код">
                                            <span class="copy-icon">📋</span>
                                            <span class="copy-text">Копировать</span>
                                        </button>
                                    </div>
                                    <pre class="code-pre"><code class="code-content">${newPost.code_snippet}</code></pre>
                                </div>` : ""}
                                ${newPost.tags && newPost.tags.length ? `
                                <div class="post-tags-row">
                                    ${newPost.tags.map(t => `<button type="button" class="post-tag-item" data-tag="${t}">#${t}</button>`).join("")}
                                </div>` : ""}
                            </div>
                            <div class="post-footer">
                                <div class="footer-actions-left">
                                    <button type="button" class="btn-post-action btn-upvote is-active" data-action="upvote" data-post-id="${newPost.id}">
                                        <span class="action-icon">🔺</span>
                                        <span class="action-count">1</span>
                                        <span class="action-label">Лайк</span>
                                    </button>
                                    <button type="button" class="btn-post-action btn-comments" data-action="toggle-comments" data-post-id="${newPost.id}">
                                        <span class="action-icon">💬</span>
                                        <span class="action-count">0</span>
                                        <span class="action-label">Комментарии</span>
                                    </button>
                                </div>
                                <div class="footer-actions-right">
                                    <button type="button" class="btn-post-action btn-bookmark" data-action="bookmark" data-post-id="${newPost.id}" title="Сохранить в закладки">
                                        <span class="action-icon">🔖</span>
                                    </button>
                                    <button type="button" class="btn-post-action btn-share" data-action="share" data-post-id="${newPost.id}" title="Поделиться ссылкой">
                                        <span class="action-icon">🔗</span>
                                    </button>
                                </div>
                            </div>
                            <div class="post-comments-accordion" id="comments-${newPost.id}" style="display: none;">
                                <div class="comments-inner-wrap">
                                    <form class="comment-create-form" data-post-id="${newPost.id}">
                                        <div class="comment-input-row">
                                            <div class="comment-user-avatar">ИД</div>
                                            <input type="text" class="comment-input-field" placeholder="Написать профессиональный комментарий..." required minlength="3">
                                            <button type="submit" class="btn-send-comment">Отправить</button>
                                        </div>
                                    </form>
                                    <div class="comments-list" id="comments-list-${newPost.id}"></div>
                                </div>
                            </div>
                        </article>
                    `;

                    if (postsStream) {
                        postsStream.insertAdjacentHTML("afterbegin", newCardHtml);
                    }

                    publisherForm.reset();
                    closePublisherModal();
                    showToast("🎉 Публикация успешно размещена в Соцсети!");
                    applyFilters();

                } catch (err) {
                    if (formAlertBox) {
                        formAlertBox.textContent = err.message || "Ошибка создания публикации";
                        formAlertBox.style.display = "block";
                    }
                } finally {
                    if (submitSpinner) submitSpinner.style.display = "none";
                    if (btnSubmitPost) btnSubmitPost.disabled = false;
                }
            });
        }

        // Follow Author Button Interaction
        document.querySelectorAll(".btn-follow-author").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const author = btn.getAttribute("data-author");
                if (btn.classList.contains("is-following")) {
                    btn.classList.remove("is-following");
                    btn.textContent = "Читать";
                    showToast("Вы отписались от " + author);
                } else {
                    btn.classList.add("is-following");
                    btn.textContent = "Читаете ✓";
                    showToast("Вы подписались на обновления " + author + "!");
                }
            });
        });

    });
})();