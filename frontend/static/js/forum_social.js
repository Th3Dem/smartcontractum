/**
 * SmartContractum — Habr 2.0 Dev Community Feed & Social Controller
 * Interactive Karma Lever (▲ / ▼ with spring bounce), Off-Canvas Comments Drawer (540px),
 * Period Dropdown, Share Popover, Hubs & Companies 1-Click Subscriptions, Live Search.
 * File: frontend/static/js/forum_social.js (v2.2.0)
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        // DOM Elements
        const articlesList = document.getElementById("habrArticlesList");
        const emptyState = document.getElementById("habrEmptyState");
        const searchInput = document.getElementById("habrSearchInput");
        const btnClearSearch = document.getElementById("btnClearSearch");

        // Categories Dropdown
        const catDropdownWrap = document.getElementById("categoriesDropdownWrap");
        const btnCatDropdown = document.getElementById("btnCategoriesDropdown");
        const catDropdownMenu = document.getElementById("categoriesDropdownMenu");

        // Period Dropdown
        const bestTabWrapper = document.getElementById("bestTabWrapper");
        const btnPeriodDropdown = document.getElementById("btnPeriodDropdown");
        const periodDropdownMenu = document.getElementById("periodDropdownMenu");

        // Share Popover
        const sharePopover = document.getElementById("sharePopover");
        const btnCloseSharePopover = document.getElementById("btnCloseSharePopover");
        const shareTgLink = document.getElementById("shareTgLink");
        const shareVkLink = document.getElementById("shareVkLink");
        const shareUrlInput = document.getElementById("shareUrlInput");
        const btnCopyShareUrl = document.getElementById("btnCopyShareUrl");

        // Off-Canvas Comments Drawer
        const commentsDrawerOverlay = document.getElementById("commentsDrawerOverlay");
        const commentsDrawer = document.getElementById("commentsDrawer");
        const btnCloseCommentsDrawer = document.getElementById("btnCloseCommentsDrawer");
        const drawerArticleTitle = document.getElementById("drawerArticleTitle");
        const drawerTotalCount = document.getElementById("drawerTotalCount");
        const drawerCommentsList = document.getElementById("drawerCommentsList");
        const drawerCommentInput = document.getElementById("drawerCommentInput");
        const btnSubmitDrawerComment = document.getElementById("btnSubmitDrawerComment");

        // Legacy / Quick Write Modal
        const writeModal = document.getElementById("habrWriteModal");
        const btnOpenWrite = document.getElementById("btnOpenWriteModal");
        const btnCloseWrite = document.getElementById("btnCloseWriteModal");
        const btnCancelWrite = document.getElementById("btnCancelWriteModal");
        const writeForm = document.getElementById("habrWriteForm");
        const submitSpinner = document.getElementById("submitSpinner");
        const btnSubmitArticle = document.getElementById("btnSubmitArticle");
        const formAlertBox = document.getElementById("formAlertBox");

        // Toast Notification
        const toast = document.getElementById("habrToast");
        const toastMessage = document.getElementById("toastMessage");
        let toastTimer = null;

        // Current active post in Drawer
        let activeDrawerPostId = null;

        // ==================================================================
        // 0. TOAST NOTIFICATION UTILITY
        // ==================================================================
        function showToast(msg) {
            if (!toast || !toastMessage) return;
            clearTimeout(toastTimer);
            toastMessage.textContent = msg;
            toast.style.display = "flex";
            toastTimer = setTimeout(function () {
                toast.style.display = "none";
            }, 3000);
        }

        // ==================================================================
        // 1. CATEGORIES DROPDOWN (Hover bridge & persistent contour tracking)
        // ==================================================================
        let catCloseTimer = null;

        function showCatMenu() {
            clearTimeout(catCloseTimer);
            if (catDropdownMenu) catDropdownMenu.classList.add("is-open");
            if (btnCatDropdown) {
                btnCatDropdown.classList.add("is-open");
                btnCatDropdown.setAttribute("aria-expanded", "true");
            }
        }

        function hideCatMenu(delay) {
            clearTimeout(catCloseTimer);
            catCloseTimer = setTimeout(function () {
                if (catDropdownMenu) catDropdownMenu.classList.remove("is-open");
                if (btnCatDropdown) {
                    btnCatDropdown.classList.remove("is-open");
                    btnCatDropdown.setAttribute("aria-expanded", "false");
                }
            }, delay || 140);
        }

        if (catDropdownWrap) {
            catDropdownWrap.addEventListener("mouseenter", function () { showCatMenu(); });
            catDropdownWrap.addEventListener("mousemove", function () { showCatMenu(); });
            catDropdownWrap.addEventListener("mouseleave", function () { hideCatMenu(160); });
        }

        if (btnCatDropdown) {
            btnCatDropdown.addEventListener("click", function (e) {
                e.stopPropagation();
                if (catDropdownMenu && catDropdownMenu.classList.contains("is-open")) {
                    hideCatMenu(0);
                } else {
                    showCatMenu();
                }
            });
        }

        // ==================================================================
        // 2. PERIOD DROPDOWN FOR 'ЛУЧШИЕ'
        // ==================================================================
        if (btnPeriodDropdown && periodDropdownMenu) {
            btnPeriodDropdown.addEventListener("click", function (e) {
                e.stopPropagation();
                e.preventDefault();
                const isOpen = periodDropdownMenu.classList.contains("is-open");
                if (isOpen) {
                    periodDropdownMenu.classList.remove("is-open");
                    btnPeriodDropdown.setAttribute("aria-expanded", "false");
                } else {
                    periodDropdownMenu.classList.add("is-open");
                    btnPeriodDropdown.setAttribute("aria-expanded", "true");
                }
            });
        }

        // Close dropdowns on outside click
        document.addEventListener("click", function (e) {
            if (catDropdownWrap && !catDropdownWrap.contains(e.target)) {
                hideCatMenu(0);
            }
            if (periodDropdownMenu && !e.target.closest("#bestTabWrapper")) {
                periodDropdownMenu.classList.remove("is-open");
                if (btnPeriodDropdown) btnPeriodDropdown.setAttribute("aria-expanded", "false");
            }
            if (sharePopover && !sharePopover.contains(e.target) && !e.target.closest(".btn-share-trigger")) {
                sharePopover.style.display = "none";
            }
        });

        // ==================================================================
        // 3. LIVE REAL-TIME KEYWORD SEARCH ENGINE
        // ==================================================================
        let searchTimeout = null;

        function performLiveSearch(query) {
            const q = query.trim().toLowerCase();
            const allCards = document.querySelectorAll(".habr-article-card");
            let visibleCount = 0;

            allCards.forEach(function (card) {
                if (!q) {
                    card.style.display = "flex";
                    visibleCount++;
                    return;
                }

                const titleEl = card.querySelector(".habr-article-title");
                const snippetEl = card.querySelector(".habr-snippet-text");
                const hubsEl = card.querySelector(".habr-hubs-line");
                const authorEl = card.querySelector(".habr-author-name");
                const codeEl = card.querySelector(".code-content");

                const titleText = titleEl ? titleEl.textContent.toLowerCase() : "";
                const snippetText = snippetEl ? snippetEl.textContent.toLowerCase() : "";
                const hubsText = hubsEl ? hubsEl.textContent.toLowerCase() : "";
                const authorText = authorEl ? authorEl.textContent.toLowerCase() : "";
                const codeText = codeEl ? codeEl.textContent.toLowerCase() : "";

                const matches = titleText.includes(q) ||
                                snippetText.includes(q) ||
                                hubsText.includes(q) ||
                                authorText.includes(q) ||
                                codeText.includes(q);

                if (matches) {
                    card.style.display = "flex";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? "flex" : "none";
            }

            if (btnClearSearch) {
                btnClearSearch.style.display = q.length > 0 ? "block" : "none";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function () {
                    performLiveSearch(searchInput.value);
                }, 80);
            });

            searchInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    const url = new URL(window.location.href);
                    if (query) url.searchParams.set("q", query);
                    else url.searchParams.delete("q");
                    window.location.href = url.toString();
                }
            });
        }

        if (btnClearSearch) {
            btnClearSearch.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                    performLiveSearch("");
                    searchInput.focus();

                    const url = new URL(window.location.href);
                    if (url.searchParams.has("q")) {
                        url.searchParams.delete("q");
                        window.history.replaceState({}, "", url.toString());
                    }
                }
            });
        }

        // ==================================================================
        // 4. ARTICLE INTERACTIONS (Karma lever, read more, copy code, bookmarks)
        // ==================================================================
        if (articlesList) {
            articlesList.addEventListener("click", async function (e) {
                // 4.1 Read More Toggle
                const btnReadMore = e.target.closest(".btn-habr-readmore") || e.target.closest(".habr-title-link");
                if (btnReadMore && btnReadMore.hasAttribute("data-action") && btnReadMore.getAttribute("data-action") === "toggle-body") {
                    const postId = btnReadMore.getAttribute("data-post-id");
                    const fullBody = document.getElementById("body-" + postId);
                    const snippet = document.querySelector("#post-" + postId + " .habr-lead-snippet");
                    const readmoreBtn = document.querySelector("#post-" + postId + " .btn-habr-readmore");
                    const readText = readmoreBtn ? readmoreBtn.querySelector(".readmore-text") : null;
                    const arrow = readmoreBtn ? readmoreBtn.querySelector(".readmore-arrow") : null;

                    if (fullBody) {
                        if (fullBody.style.display === "none" || fullBody.style.display === "") {
                            fullBody.style.display = "block";
                            if (readText) readText.textContent = "Свернуть";
                            if (arrow) arrow.textContent = "↑";
                        } else {
                            fullBody.style.display = "none";
                            if (readText) readText.textContent = "Читать далее";
                            if (arrow) arrow.textContent = "↓";
                        }
                    }
                    return;
                }

                // 4.2 Smart Contract Like Button Toggle
                const btnContractLike = e.target.closest(".btn-contract-like") || e.target.closest("[data-action='like']");
                if (btnContractLike) {
                    const postId = btnContractLike.getAttribute("data-post-id");
                    const countEl = btnContractLike.querySelector(".likes-count-val") || btnContractLike.querySelector(".stat-val");
                    const isActive = btnContractLike.classList.contains("is-active");

                    let count = parseInt(countEl ? countEl.textContent : "0", 10) || 0;
                    if (isActive) {
                        btnContractLike.classList.remove("is-active");
                        if (countEl) countEl.textContent = Math.max(0, count - 1);
                        showToast("Лайк смарт-контракта отозван");
                    } else {
                        btnContractLike.classList.add("is-active");
                        if (countEl) countEl.textContent = count + 1;

                        const iconWrap = btnContractLike.querySelector(".stat-icon-wrap");
                        if (iconWrap) {
                            iconWrap.classList.remove("bounce-spring");
                            void iconWrap.offsetWidth;
                            iconWrap.classList.add("bounce-spring");
                        }
                        showToast("📜 Смарт-контракт одобрен!");
                    }

                    try {
                        await fetch("/api/v1/forum/posts/" + postId + "/upvote", { method: "POST" });
                    } catch (err) {
                        console.error("Failed to sync contract like:", err);
                    }
                    return;
                }

                // 4.4 Bookmark Toggle
                const btnBookmark = e.target.closest(".btn-bookmark");
                if (btnBookmark) {
                    const postId = btnBookmark.getAttribute("data-post-id");
                    const countEl = btnBookmark.querySelector(".stat-val") || btnBookmark.querySelector(".bookmarks-count-val");
                    const isActive = btnBookmark.classList.contains("is-active");

                    let count = parseInt(countEl ? countEl.textContent : "0", 10) || 0;
                    if (isActive) {
                        btnBookmark.classList.remove("is-active");
                        if (countEl) countEl.textContent = Math.max(0, count - 1);
                        showToast("Статья удалена из закладок");
                    } else {
                        btnBookmark.classList.add("is-active");
                        if (countEl) countEl.textContent = count + 1;
                        showToast("✨ Статья сохранена в закладки!");
                    }

                    try {
                        await fetch("/api/v1/forum/posts/" + postId + "/bookmark", { method: "POST" });
                    } catch (err) {
                        console.error("Failed to sync bookmark:", err);
                    }
                    return;
                }

                // 4.5 Copy Code Snippet
                const btnCopyCode = e.target.closest(".btn-copy-code");
                if (btnCopyCode) {
                    const codeBlock = btnCopyCode.closest(".habr-code-block");
                    const codeEl = codeBlock ? codeBlock.querySelector(".code-content") : null;
                    if (codeEl) {
                        navigator.clipboard.writeText(codeEl.textContent || "").then(function () {
                            showToast("📋 Исходный код скопирован!");
                        }).catch(function () {
                            showToast("Код скопирован");
                        });
                    }
                    return;
                }

                // 4.6 Open Comments Drawer
                const btnOpenComments = e.target.closest(".btn-open-drawer") || e.target.closest(".btn-comments-toggle");
                if (btnOpenComments) {
                    const postId = btnOpenComments.getAttribute("data-post-id");
                    openCommentsDrawer(postId);
                    return;
                }

                // 4.7 Open Share Popover
                const btnShare = e.target.closest(".btn-share-trigger") || e.target.closest(".btn-share");
                if (btnShare) {
                    const postId = btnShare.getAttribute("data-post-id");
                    const postTitle = btnShare.getAttribute("data-post-title") || "Статья SmartContractum";
                    openSharePopover(btnShare, postId, postTitle);
                    return;
                }
            });
        }

        // ==================================================================
        // 5. OFF-CANVAS COMMENTS DRAWER LOGIC
        // ==================================================================
        const MOCK_COMMENTS_TREE = {
            "1": [
                {
                    id: 101,
                    author_name: "Дмитрий Волков",
                    author_username: "dmitry_dev",
                    author_role: "Разработчик",
                    author_avatar: "ДВ",
                    time: "сегодня в 18:45",
                    body: "Отличный разбор уязвимости! Мы добавили статический анализатор Slither с этим правилом в наш CI-контур.",
                    score: 14,
                    replies: [
                        {
                            id: 1011,
                            author_name: "Алексей Смирнов",
                            author_username: "alex_security",
                            author_role: "ИБ-Аудитор",
                            author_avatar: "АС",
                            time: "сегодня в 19:00",
                            body: "Рекомендую также включить проверку `crytic-compile` и fuzzing через Foundry для полной гарантии.",
                            score: 8,
                        }
                    ]
                },
                {
                    id: 102,
                    author_name: "SmartContractum Bot",
                    author_username: "sc_audit_bot",
                    author_role: "ИБ-Аудитор",
                    author_avatar: "SC",
                    time: "сегодня в 19:10",
                    body: "Патч включен в официальный релиз SDK платформы SmartContractum v1.4.0.",
                    score: 9,
                    replies: []
                }
            ],
            "2": [
                {
                    id: 201,
                    author_name: "Михаил Романов",
                    author_username: "m_romanov",
                    author_role: "Разработчик",
                    author_avatar: "МР",
                    time: "сегодня в 17:15",
                    body: "48 часов на заморозку — отличный баланс между безопасностью сделки и ликвидностью поставщика.",
                    score: 16,
                    replies: []
                }
            ],
            "3": [
                {
                    id: 301,
                    author_name: "АгроХолдинг Юг",
                    author_username: "agro_south",
                    author_role: "Заказчик",
                    author_avatar: "АЮ",
                    time: "вчера в 20:20",
                    body: "Спасибо за готовый пример! Забираем в свой пилотный проект по элеваторам.",
                    score: 8,
                    replies: []
                }
            ],
            "4": [
                {
                    id: 401,
                    author_name: "Сергей Белов",
                    author_username: "s_belov",
                    author_role: "Разработчик",
                    author_avatar: "СБ",
                    time: "вчера в 15:00",
                    body: "96 бит под сумму — это до 79 млрд рублей с точностью до копеек, для любого корпоративного сплита с головой!",
                    score: 12,
                    replies: []
                }
            ]
        };

        function renderCommentsTree(comments) {
            if (!drawerCommentsList) return;
            if (!comments || comments.length === 0) {
                drawerCommentsList.innerHTML = `<div class="drawer-empty-comments"><p style="color: #64748b; font-size: 0.86rem; text-align: center; margin: 20px 0;">Комментариев пока нет. Будьте первым, кто оставит экспертное мнение!</p></div>`;
                return;
            }

            let html = "";
            comments.forEach(function (c) {
                html += `
                <div class="drawer-comment-thread" id="thread-${c.id}">
                    <div class="drawer-comment-item">
                        <div class="comment-author-line">
                            <div class="comment-author-left">
                                <div class="comment-mini-avatar">${c.author_avatar || 'SC'}</div>
                                <span class="comment-name">${c.author_name}</span>
                                <span class="comment-badge">[${c.author_role || 'Разработчик'}]</span>
                            </div>
                            <span class="comment-time">${c.time || c.created_at || 'только что'}</span>
                        </div>
                        <p class="comment-body-text">${c.body}</p>
                        <div class="comment-actions-bar">
                            <button type="button" class="btn-reply-comment" data-comment-id="${c.id}" data-author="${c.author_name}">Ответить</button>
                            <span class="comment-karma-lever">▲ +${c.score || 0} ▼</span>
                        </div>
                        <div class="nested-reply-box" id="reply-box-${c.id}" style="display: none;">
                            <textarea class="drawer-comment-textarea reply-textarea" placeholder="Ответ для ${c.author_name}..." rows="2"></textarea>
                            <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;">
                                <button type="button" class="btn-cancel-reply" data-comment-id="${c.id}" style="background: transparent; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 0.72rem; cursor: pointer;">Отмена</button>
                                <button type="button" class="btn-send-reply" data-comment-id="${c.id}" style="background: #0284c7; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">Отправить ответ</button>
                            </div>
                        </div>
                    </div>
                `;

                if (c.replies && c.replies.length > 0) {
                    html += `<div class="drawer-replies-list">`;
                    c.replies.forEach(function (r) {
                        html += `
                        <div class="drawer-comment-item reply-item" id="reply-${r.id}">
                            <div class="comment-author-line">
                                <div class="comment-author-left">
                                    <div class="comment-mini-avatar" style="background: #7c3aed;">${r.author_avatar || 'SC'}</div>
                                    <span class="comment-name">${r.author_name}</span>
                                    <span class="comment-badge">[${r.author_role || 'Эксперт'}]</span>
                                </div>
                                <span class="comment-time">${r.time || r.created_at || 'только что'}</span>
                            </div>
                            <p class="comment-body-text">${r.body}</p>
                            <div class="comment-actions-bar">
                                <span class="comment-karma-lever">▲ +${r.score || 0} ▼</span>
                            </div>
                        </div>
                        `;
                    });
                    html += `</div>`;
                }

                html += `</div>`;
            });

            drawerCommentsList.innerHTML = html;
        }

        function openCommentsDrawer(postId) {
            activeDrawerPostId = postId;
            const postCard = document.getElementById("post-" + postId);
            const titleEl = postCard ? postCard.querySelector(".habr-article-title") : null;
            const postTitle = titleEl ? titleEl.textContent.trim() : "Обсуждение публикации";

            if (drawerArticleTitle) drawerArticleTitle.textContent = postTitle;

            const comments = MOCK_COMMENTS_TREE[postId] || [];
            const totalCount = comments.reduce(function (acc, c) {
                return acc + 1 + (c.replies ? c.replies.length : 0);
            }, 0);

            if (drawerTotalCount) drawerTotalCount.textContent = totalCount;
            renderCommentsTree(comments);

            if (commentsDrawerOverlay) {
                commentsDrawerOverlay.classList.add("is-open");
                document.body.style.overflow = "hidden";
            }
        }

        function closeCommentsDrawer() {
            if (commentsDrawerOverlay) {
                commentsDrawerOverlay.classList.remove("is-open");
                document.body.style.overflow = "";
            }
            activeDrawerPostId = null;
        }

        if (btnCloseCommentsDrawer) {
            btnCloseCommentsDrawer.addEventListener("click", closeCommentsDrawer);
        }

        if (commentsDrawerOverlay) {
            commentsDrawerOverlay.addEventListener("click", function (e) {
                if (e.target === commentsDrawerOverlay) closeCommentsDrawer();
            });
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closeCommentsDrawer();
                if (sharePopover) sharePopover.style.display = "none";
            }
        });

        // Submit Root Comment in Drawer
        if (btnSubmitDrawerComment && drawerCommentInput) {
            btnSubmitDrawerComment.addEventListener("click", async function () {
                const body = drawerCommentInput.value.trim();
                if (body.length < 3) {
                    showToast("⚠️ Комментарий должен содержать минимум 3 символа");
                    drawerCommentInput.focus();
                    return;
                }

                btnSubmitDrawerComment.disabled = true;
                btnSubmitDrawerComment.textContent = "Отправка...";

                const newComment = {
                    id: Date.now(),
                    author_name: "developer (Umbrella-Dev)",
                    author_username: "developer",
                    author_role: "Разработчик",
                    author_avatar: "SC",
                    time: "только что",
                    body: body,
                    score: 0,
                    replies: []
                };

                if (!MOCK_COMMENTS_TREE[activeDrawerPostId]) {
                    MOCK_COMMENTS_TREE[activeDrawerPostId] = [];
                }
                MOCK_COMMENTS_TREE[activeDrawerPostId].push(newComment);

                // Update UI
                renderCommentsTree(MOCK_COMMENTS_TREE[activeDrawerPostId]);
                drawerCommentInput.value = "";

                // Update badge counts
                const postCard = document.getElementById("post-" + activeDrawerPostId);
                const countBadge = postCard ? postCard.querySelector(".comments-count-val") : null;
                if (countBadge) {
                    const cur = parseInt(countBadge.textContent || "0", 10) + 1;
                    countBadge.textContent = cur;
                }
                if (drawerTotalCount) {
                    drawerTotalCount.textContent = parseInt(drawerTotalCount.textContent || "0", 10) + 1;
                }

                showToast("💬 Комментарий успешно добавлен!");

                try {
                    await fetch("/api/v1/forum/posts/" + activeDrawerPostId + "/comments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            body: body,
                            author_name: "developer (Umbrella-Dev)",
                            author_role: "Разработчик"
                        })
                    });
                } catch (err) {
                    console.warn("Backend comment sync notice:", err);
                } finally {
                    btnSubmitDrawerComment.disabled = false;
                    btnSubmitDrawerComment.textContent = "Отправить комментарий";
                }
            });
        }

        // Drawer Comments List Delegated Actions (Reply button, Send reply, Cancel)
        if (drawerCommentsList) {
            drawerCommentsList.addEventListener("click", function (e) {
                // Reply toggle button
                const btnReply = e.target.closest(".btn-reply-comment");
                if (btnReply) {
                    const commentId = btnReply.getAttribute("data-comment-id");
                    const box = document.getElementById("reply-box-" + commentId);
                    if (box) {
                        box.style.display = box.style.display === "none" ? "block" : "none";
                        if (box.style.display === "block") {
                            const ta = box.querySelector(".reply-textarea");
                            if (ta) ta.focus();
                        }
                    }
                    return;
                }

                // Cancel reply button
                const btnCancelReply = e.target.closest(".btn-cancel-reply");
                if (btnCancelReply) {
                    const commentId = btnCancelReply.getAttribute("data-comment-id");
                    const box = document.getElementById("reply-box-" + commentId);
                    if (box) box.style.display = "none";
                    return;
                }

                // Send reply button
                const btnSendReply = e.target.closest(".btn-send-reply");
                if (btnSendReply) {
                    const commentId = btnSendReply.getAttribute("data-comment-id");
                    const box = document.getElementById("reply-box-" + commentId);
                    const textarea = box ? box.querySelector(".reply-textarea") : null;
                    const replyText = textarea ? textarea.value.trim() : "";

                    if (replyText.length < 3) {
                        showToast("⚠️ Ответ должен содержать минимум 3 символа");
                        if (textarea) textarea.focus();
                        return;
                    }

                    const newReply = {
                        id: Date.now(),
                        author_name: "developer",
                        author_username: "developer",
                        author_role: "Разработчик",
                        author_avatar: "SC",
                        time: "только что",
                        body: replyText,
                        score: 0
                    };

                    const comments = MOCK_COMMENTS_TREE[activeDrawerPostId] || [];
                    const parent = comments.find(function (c) { return String(c.id) === String(commentId); });
                    if (parent) {
                        if (!parent.replies) parent.replies = [];
                        parent.replies.push(newReply);
                    }

                    renderCommentsTree(comments);
                    showToast("💬 Ответ успешно опубликован!");
                    return;
                }
            });
        }

        // Markdown Toolbar Format Insertion
        document.querySelectorAll(".btn-md-fmt").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const fmt = btn.getAttribute("data-fmt");
                if (!drawerCommentInput) return;

                const start = drawerCommentInput.selectionStart;
                const end = drawerCommentInput.selectionEnd;
                const text = drawerCommentInput.value;
                const selected = text.substring(start, end);
                let replacement = "";

                switch (fmt) {
                    case "bold": replacement = `**${selected || 'жирный текст'}**`; break;
                    case "italic": replacement = `*${selected || 'курсив'}*`; break;
                    case "code": replacement = `\`${selected || 'код'}\``; break;
                    case "quote": replacement = `\n> ${selected || 'цитата'}\n`; break;
                    case "list": replacement = `\n- ${selected || 'пункт списка'}\n`; break;
                    default: replacement = selected;
                }

                drawerCommentInput.value = text.substring(0, start) + replacement + text.substring(end);
                drawerCommentInput.focus();
            });
        });

        // ==================================================================
        // 6. SHARE POPOVER LOGIC
        // ==================================================================
        function openSharePopover(btnEl, postId, title) {
            if (!sharePopover) return;
            const rect = btnEl.getBoundingClientRect();
            const url = window.location.origin + "/feed#post-" + postId;

            if (shareUrlInput) shareUrlInput.value = url;

            const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

            if (shareTgLink) shareTgLink.href = tgUrl;
            if (shareVkLink) shareVkLink.href = vkUrl;

            // Position popover near button
            let top = rect.bottom + window.scrollY + 8;
            let left = rect.left + window.scrollX - 120;
            if (left + 290 > window.innerWidth) left = window.innerWidth - 300;
            if (left < 10) left = 10;

            sharePopover.style.top = top + "px";
            sharePopover.style.left = left + "px";
            sharePopover.style.display = "block";

            // Track share metric
            fetch("/api/v1/forum/topics/" + postId + "/share", { method: "POST" })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    const sharesCountVal = btnEl.querySelector(".shares-count-val");
                    if (sharesCountVal && data.shares_count) {
                        sharesCountVal.textContent = data.shares_count;
                    }
                })
                .catch(function () {});
        }

        if (btnCloseSharePopover) {
            btnCloseSharePopover.addEventListener("click", function () {
                if (sharePopover) sharePopover.style.display = "none";
            });
        }

        if (btnCopyShareUrl && shareUrlInput) {
            btnCopyShareUrl.addEventListener("click", function () {
                navigator.clipboard.writeText(shareUrlInput.value).then(function () {
                    showToast("🔗 Ссылка на статью скопирована в буфер!");
                    if (sharePopover) sharePopover.style.display = "none";
                }).catch(function () {
                    showToast("Ссылка скопирована!");
                });
            });
        }

        // ==================================================================
        // 7. HUB & COMPANY 1-CLICK FOLLOW / UNFOLLOW TOGGLES
        // ==================================================================
        document.querySelectorAll(".btn-hub-follow, .btn-company-follow").forEach(function (btn) {
            btn.addEventListener("click", async function () {
                const hubSlug = btn.getAttribute("data-hub") || "general";
                const isFollowing = btn.classList.contains("is-following");

                if (isFollowing) {
                    btn.classList.remove("is-following");
                    btn.textContent = "+ Подписаться";
                    showToast("Вы отписались от хаба / компании");
                    try {
                        await fetch("/api/v1/forum/hubs/" + hubSlug + "/unsubscribe", { method: "POST" });
                    } catch (e) {}
                } else {
                    btn.classList.add("is-following");
                    btn.textContent = "✓ Вы подписаны";
                    showToast("✨ Вы успешно подписались на хаб / компанию!");
                    try {
                        await fetch("/api/v1/forum/hubs/" + hubSlug + "/subscribe", { method: "POST" });
                    } catch (e) {}
                }
            });
        });

        // ==================================================================
        // 8. QUICK WRITE ARTICLE MODAL (Legacy compatibility)
        // ==================================================================
        function openWriteModal() {
            if (writeModal) {
                writeModal.classList.add("is-open");
                writeModal.setAttribute("aria-hidden", "false");
            }
        }

        function closeWriteModal() {
            if (writeModal) {
                writeModal.classList.remove("is-open");
                writeModal.setAttribute("aria-hidden", "true");
            }
            if (formAlertBox) formAlertBox.style.display = "none";
        }

        if (btnOpenWrite) {
            // If user clicks write button, redirect or open modal
            btnOpenWrite.addEventListener("click", function (e) {
                // Link navigates to /feed/create naturally, but prevent error if modal used
            });
        }

        if (btnCloseWrite) btnCloseWrite.addEventListener("click", closeWriteModal);
        if (btnCancelWrite) btnCancelWrite.addEventListener("click", closeWriteModal);

        if (writeForm) {
            writeForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                const title = document.getElementById("articleTitleInput").value.trim();
                const category_slug = document.getElementById("articleCategorySelect").value;
                const author_role = document.getElementById("articleRoleSelect").value;
                const tagsRaw = document.getElementById("articleTagsInput").value;
                const body = document.getElementById("articleBodyInput").value.trim();
                const code_snippet = document.getElementById("articleCodeInput").value.trim();

                const tags = tagsRaw.split(",").map(function (t) { return t.trim(); }).filter(function (t) { return t.length > 0; });

                if (title.length < 10) {
                    if (formAlertBox) {
                        formAlertBox.textContent = "Заголовок должен содержать минимум 10 символов.";
                        formAlertBox.style.display = "block";
                    }
                    return;
                }

                if (submitSpinner) submitSpinner.style.display = "inline";
                if (btnSubmitArticle) btnSubmitArticle.disabled = true;

                try {
                    const resp = await fetch("/api/v1/forum/topics", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: title,
                            category_slug: category_slug,
                            author_role: author_role,
                            tags: tags,
                            body: body,
                            code_snippet: code_snippet || null,
                            author_name: "ООО Интегратор (Umbrella-Dev)"
                        })
                    });

                    if (!resp.ok) {
                        const errData = await resp.json();
                        throw new Error(errData.detail || "Ошибка публикации");
                    }

                    const data = await resp.json();
                    writeForm.reset();
                    closeWriteModal();
                    showToast("🎉 Статья успешно опубликована на Хабре!");
                    setTimeout(function () { window.location.reload(); }, 1200);

                } catch (err) {
                    if (formAlertBox) {
                        formAlertBox.textContent = err.message || "Ошибка публикации";
                        formAlertBox.style.display = "block";
                    }
                } finally {
                    if (submitSpinner) submitSpinner.style.display = "none";
                    if (btnSubmitArticle) btnSubmitArticle.disabled = false;
                }
            });
        }

    });
})();