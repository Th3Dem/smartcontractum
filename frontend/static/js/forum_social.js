/**
 * SmartContractum — Habr Feed Controller (https://habr.com/ru/feed/)
 * Categories hover dropdown (persistent contour tracking), real-time keyword search, upvotes, comments & modal.
 * File: frontend/static/js/forum_social.js
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const articlesList = document.getElementById("habrArticlesList");
        const emptyState = document.getElementById("habrEmptyState");
        const searchInput = document.getElementById("habrSearchInput");
        const btnClearSearch = document.getElementById("btnClearSearch");

        const catDropdownWrap = document.getElementById("categoriesDropdownWrap");
        const btnCatDropdown = document.getElementById("btnCategoriesDropdown");
        const catDropdownMenu = document.getElementById("categoriesDropdownMenu");

        const writeModal = document.getElementById("habrWriteModal");
        const btnOpenWrite = document.getElementById("btnOpenWriteModal");
        const btnCloseWrite = document.getElementById("btnCloseWriteModal");
        const btnCancelWrite = document.getElementById("btnCancelWriteModal");
        const writeForm = document.getElementById("habrWriteForm");
        const submitSpinner = document.getElementById("submitSpinner");
        const btnSubmitArticle = document.getElementById("btnSubmitArticle");
        const formAlertBox = document.getElementById("formAlertBox");

        const toast = document.getElementById("habrToast");
        const toastMessage = document.getElementById("toastMessage");

        function showToast(msg) {
            if (!toast || !toastMessage) return;
            toastMessage.textContent = msg;
            toast.style.display = "block";
            setTimeout(function () {
                toast.style.display = "none";
            }, 3000);
        }

        // ==================================================================
        // 0. CATEGORIES DROPDOWN HOVER & PERSISTENT CONTOUR TRACKING
        // ==================================================================
        let catCloseTimer = null;

        function showCatMenu() {
            clearTimeout(catCloseTimer);
            if (catDropdownMenu) {
                catDropdownMenu.classList.add("is-open");
            }
            if (btnCatDropdown) {
                btnCatDropdown.classList.add("is-open");
                btnCatDropdown.setAttribute("aria-expanded", "true");
            }
        }

        function hideCatMenu(delay = 140) {
            clearTimeout(catCloseTimer);
            catCloseTimer = setTimeout(function () {
                if (catDropdownMenu) {
                    catDropdownMenu.classList.remove("is-open");
                }
                if (btnCatDropdown) {
                    btnCatDropdown.classList.remove("is-open");
                    btnCatDropdown.setAttribute("aria-expanded", "false");
                }
            }, delay);
        }

        if (catDropdownWrap) {
            // When mouse enters button or any area of the wrapper, keep open
            catDropdownWrap.addEventListener("mouseenter", function () {
                showCatMenu();
            });

            // When moving inside the wrapper/menu, cancel any scheduled close
            catDropdownWrap.addEventListener("mousemove", function () {
                showCatMenu();
            });

            // When mouse leaves the entire contour of button + dropdown, schedule hide
            catDropdownWrap.addEventListener("mouseleave", function () {
                hideCatMenu(160);
            });
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

        // Click outside closes menu immediately
        document.addEventListener("click", function (e) {
            if (catDropdownWrap && !catDropdownWrap.contains(e.target)) {
                hideCatMenu(0);
            }
        });

        // ==================================================================
        // 1. LIVE REAL-TIME KEYWORD SEARCH ENGINE
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
                const snippetEl = card.querySelector(".habr-lead-snippet");
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
            // Live typing with debounce
            searchInput.addEventListener("input", function () {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(function () {
                    performLiveSearch(searchInput.value);
                }, 100);
            });

            // Enter key triggers full backend query or search confirmation
            searchInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    const url = new URL(window.location.href);
                    if (query) {
                        url.searchParams.set("q", query);
                    } else {
                        url.searchParams.delete("q");
                    }
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

                    // If URL had query param, clean it up
                    const url = new URL(window.location.href);
                    if (url.searchParams.has("q")) {
                        url.searchParams.delete("q");
                        window.history.replaceState({}, "", url.toString());
                    }
                }
            });
        }

        // ==================================================================
        // 2. ARTICLE INTERACTIONS (Read More, Upvote, Bookmark, Share, Code)
        // ==================================================================
        if (articlesList) {
            articlesList.addEventListener("click", async function (e) {
                // 2.1 Read More Toggle
                const btnReadMore = e.target.closest(".btn-habr-readmore");
                if (btnReadMore) {
                    const postId = btnReadMore.getAttribute("data-post-id");
                    const fullBody = document.getElementById("body-" + postId);
                    const snippet = document.querySelector("#post-" + postId + " .habr-lead-snippet");
                    const readText = btnReadMore.querySelector(".readmore-text");
                    const arrow = btnReadMore.querySelector(".readmore-arrow");

                    if (fullBody) {
                        if (fullBody.style.display === "none" || fullBody.style.display === "") {
                            fullBody.style.display = "block";
                            if (snippet) snippet.style.display = "none";
                            readText.textContent = "Свернуть";
                            arrow.textContent = "↑";
                        } else {
                            fullBody.style.display = "none";
                            if (snippet) snippet.style.display = "block";
                            readText.textContent = "Читать далее";
                            arrow.textContent = "↓";
                        }
                    }
                    return;
                }

                // 2.2 Upvote Rating Arrow
                const btnUpvote = e.target.closest(".btn-score-up");
                if (btnUpvote) {
                    const postId = btnUpvote.getAttribute("data-post-id");
                    const scoreBox = btnUpvote.closest(".habr-score-box");
                    const scoreVal = scoreBox ? scoreBox.querySelector(".habr-score-val") : null;
                    const isActive = btnUpvote.classList.contains("is-active");

                    let curScore = parseInt((scoreVal ? scoreVal.textContent : "0").replace("+", ""), 10) || 0;
                    if (isActive) {
                        btnUpvote.classList.remove("is-active");
                        curScore = curScore - 1;
                    } else {
                        btnUpvote.classList.add("is-active");
                        curScore = curScore + 1;
                    }

                    if (scoreVal) {
                        scoreVal.textContent = curScore > 0 ? "+" + curScore : "" + curScore;
                        if (curScore > 0) scoreVal.classList.add("is-positive");
                        else scoreVal.classList.remove("is-positive");
                    }

                    try {
                        await fetch("/api/v1/forum/posts/" + postId + "/upvote", { method: "POST" });
                    } catch (err) {
                        console.error("Failed to sync upvote:", err);
                    }
                    return;
                }

                // 2.3 Comments Accordion Toggle
                const btnComments = e.target.closest(".btn-comments-toggle");
                if (btnComments) {
                    const postId = btnComments.getAttribute("data-post-id");
                    const commentsSec = document.getElementById("comments-" + postId);
                    if (commentsSec) {
                        if (commentsSec.style.display === "none" || commentsSec.style.display === "") {
                            commentsSec.style.display = "flex";
                            const ta = commentsSec.querySelector(".habr-comment-textarea");
                            if (ta) ta.focus();
                        } else {
                            commentsSec.style.display = "none";
                        }
                    }
                    return;
                }

                // 2.4 Bookmark Toggle
                const btnBookmark = e.target.closest(".btn-bookmark");
                if (btnBookmark) {
                    const postId = btnBookmark.getAttribute("data-post-id");
                    const countEl = btnBookmark.querySelector(".stat-val");
                    const isActive = btnBookmark.classList.contains("is-active");

                    let count = parseInt(countEl ? countEl.textContent : "0", 10) || 0;
                    if (isActive) {
                        btnBookmark.classList.remove("is-active");
                        if (countEl) countEl.textContent = Math.max(0, count - 1);
                        showToast("Удалено из закладок");
                    } else {
                        btnBookmark.classList.add("is-active");
                        if (countEl) countEl.textContent = count + 1;
                        showToast("Добавлено в закладки!");
                    }

                    try {
                        await fetch("/api/v1/forum/posts/" + postId + "/bookmark", { method: "POST" });
                    } catch (err) {
                        console.error("Failed to sync bookmark:", err);
                    }
                    return;
                }

                // 2.5 Share Button
                const btnShare = e.target.closest(".btn-share");
                if (btnShare) {
                    const postId = btnShare.getAttribute("data-post-id");
                    const url = window.location.origin + "/feed#post-" + postId;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(url).then(function () {
                            showToast("Ссылка на статью скопирована!");
                        });
                    } else {
                        showToast("Ссылка: " + url);
                    }
                    return;
                }

                // 2.6 Copy Code
                const btnCopy = e.target.closest(".btn-copy-code");
                if (btnCopy) {
                    const codeBlock = btnCopy.closest(".habr-code-block");
                    const codeEl = codeBlock ? codeBlock.querySelector(".code-content") : null;
                    if (codeEl && navigator.clipboard) {
                        navigator.clipboard.writeText(codeEl.textContent).then(function () {
                            btnCopy.innerHTML = "<span>✓ Скопировано!</span>";
                            setTimeout(function () {
                                btnCopy.innerHTML = "<span class=\"copy-icon\">📋</span> <span>Скопировать</span>";
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
            const commentForm = e.target.closest(".habr-comment-form");
            if (commentForm) {
                e.preventDefault();
                const postId = commentForm.getAttribute("data-post-id");
                const textarea = commentForm.querySelector(".habr-comment-textarea");
                const text = textarea.value.trim();
                if (!text) return;

                const commentsList = document.getElementById("comments-list-" + postId);
                const btnComments = document.querySelector('.btn-comments-toggle[data-post-id="' + postId + '"]');
                const commentsCountEl = btnComments ? btnComments.querySelector(".stat-val") : null;

                const newCommentHtml = `
                    <div class="habr-comment-item">
                        <div class="comment-header-line">
                            <div class="comment-avatar">SC</div>
                            <span class="comment-author-name">developer</span>
                            <span class="comment-author-handle">@developer</span>
                            <span class="comment-time">только что</span>
                        </div>
                        <div class="comment-text-body">
                            <p>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                        </div>
                    </div>
                `;

                if (commentsList) {
                    commentsList.insertAdjacentHTML("beforeend", newCommentHtml);
                }
                textarea.value = "";

                if (commentsCountEl) {
                    const cur = parseInt(commentsCountEl.textContent || "0", 10);
                    commentsCountEl.textContent = cur + 1;
                }

                showToast("Комментарий успешно отправлен!");

                try {
                    await fetch("/api/v1/forum/posts/" + postId + "/comments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            body: text,
                            author_name: "developer",
                            author_role: "Разработчик"
                        })
                    });
                } catch (err) {
                    console.error("Failed to submit comment:", err);
                }
            }
        });

        // ==================================================================
        // 4. WRITE ARTICLE MODAL
        // ==================================================================
        function openWriteModal() {
            if (!writeModal) return;
            writeModal.classList.add("is-active");
            writeModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            const titleInp = document.getElementById("articleTitleInput");
            if (titleInp) titleInp.focus();
        }

        function closeWriteModal() {
            if (!writeModal) return;
            writeModal.classList.remove("is-active");
            writeModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            if (formAlertBox) formAlertBox.style.display = "none";
        }

        if (btnOpenWrite) btnOpenWrite.addEventListener("click", openWriteModal);
        if (btnCloseWrite) btnCloseWrite.addEventListener("click", closeWriteModal);
        if (btnCancelWrite) btnCancelWrite.addEventListener("click", closeWriteModal);
        if (writeModal) {
            writeModal.addEventListener("click", function (e) {
                if (e.target === writeModal) closeWriteModal();
            });
        }

        if (writeForm) {
            writeForm.addEventListener("submit", async function (e) {
                e.preventDefault();

                const formData = new FormData(writeForm);
                const title = formData.get("title");
                const category_slug = formData.get("category_slug");
                const author_role = formData.get("author_role") || "Разработчик";
                const tagsRaw = formData.get("tags") || "";
                const body = formData.get("body");
                const code_snippet = formData.get("code_snippet");

                const tags = tagsRaw.split(",").map(t => t.trim()).filter(Boolean);

                if (submitSpinner) submitSpinner.style.display = "inline-block";
                if (btnSubmitArticle) btnSubmitArticle.disabled = true;

                try {
                    const resp = await fetch("/api/v1/forum/posts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: title,
                            category_slug: category_slug,
                            author_role: author_role,
                            author_name: "developer",
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

                    const newCardHtml = `
                        <article class="habr-article-card" id="post-${newPost.id}" data-post-id="${newPost.id}">
                            <div class="habr-card-header">
                                <div class="habr-author-box">
                                    <div class="habr-author-avatar">SC</div>
                                    <div class="habr-author-meta">
                                        <span class="habr-author-name">developer</span>
                                        <span class="habr-author-handle">@developer</span>
                                    </div>
                                </div>
                                <div class="habr-post-time">только что</div>
                            </div>
                            <h2 class="habr-article-title">
                                <a href="#post-${newPost.id}" class="habr-title-link">${newPost.title}</a>
                            </h2>
                            <div class="habr-hubs-line">
                                ${newPost.hubs ? newPost.hubs.map(h => `<a href="/feed?tag=${h.replace('*','')}" class="habr-hub-link">${h}</a>`).join(", ") : ""}
                            </div>
                            <div class="habr-lead-snippet">
                                <p class="habr-snippet-text">${newPost.snippet}</p>
                            </div>
                            <div class="habr-full-body" id="body-${newPost.id}" style="display: none;">
                                <div class="habr-body-content">${newPost.body.replace(/\n/g, "<br>")}</div>
                                ${newPost.code_snippet ? `
                                <div class="habr-code-block">
                                    <div class="habr-code-header">
                                        <span class="code-lang">
                                            <svg class="code-badge-svg" viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                                                <path fill-rule="evenodd" d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L13.94 8l-3.72-3.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
                                            </svg>
                                            SOLIDITY
                                        </span>
                                        <button type="button" class="btn-copy-code" title="Скопировать код">
                                            <svg class="copy-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                                                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12a1.5 1.5 0 01.439 1.061V14.5A1.5 1.5 0 0115.5 16h-7A1.5 1.5 0 017 14.5v-11z" />
                                                <path d="M5 6a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 005 17h7a1.5 1.5 0 001.5-1.5v-.5H8.5A2.5 2.5 0 016 12.5V6H5z" />
                                            </svg>
                                            <span>Скопировать</span>
                                        </button>
                                    </div>
                                    <pre class="code-pre"><code class="code-content">${newPost.code_snippet}</code></pre>
                                </div>` : ""}
                            </div>
                            <div class="habr-readmore-row">
                                <button type="button" class="btn-habr-readmore" data-action="toggle-body" data-post-id="${newPost.id}">
                                    <span class="readmore-text">Читать далее</span>
                                    <span class="readmore-arrow">↓</span>
                                </button>
                                <span class="habr-meta-reading">⏱️ 3 мин • Сложность: Средний</span>
                            </div>
                            <div class="habr-card-footer">
                                <div class="habr-footer-left">
                                    <div class="habr-score-box">
                                        <button type="button" class="btn-score-arrow btn-score-up is-active" data-action="upvote" data-post-id="${newPost.id}">▲</button>
                                        <span class="habr-score-val is-positive">+1</span>
                                        <button type="button" class="btn-score-arrow btn-score-down" data-action="downvote" data-post-id="${newPost.id}">▼</button>
                                    </div>
                                    <div class="habr-stat-item" title="Количество просмотров">
                                        <span class="stat-icon-wrap" aria-hidden="true">
                                            <svg class="stat-svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                                <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                            </svg>
                                        </span>
                                        <span class="stat-val">1</span>
                                    </div>
                                    <button type="button" class="habr-stat-btn btn-bookmark" data-action="bookmark" data-post-id="${newPost.id}" title="Добавить в закладки">
                                        <span class="stat-icon-wrap" aria-hidden="true">
                                            <svg class="stat-svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.125L5 18V4z" />
                                            </svg>
                                        </span>
                                        <span class="stat-val">0</span>
                                    </button>
                                    <button type="button" class="habr-stat-btn btn-comments-toggle" data-action="toggle-comments" data-post-id="${newPost.id}" title="Комментарии">
                                        <span class="stat-icon-wrap" aria-hidden="true">
                                            <svg class="stat-svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clip-rule="evenodd" />
                                            </svg>
                                        </span>
                                        <span class="stat-val">0</span>
                                    </button>
                                </div>
                                <div class="habr-footer-right">
                                    <button type="button" class="habr-stat-btn btn-share" data-action="share" data-post-id="${newPost.id}" title="Поделиться">
                                        <span class="stat-icon-wrap" aria-hidden="true">
                                            <svg class="stat-svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="habr-comments-section" id="comments-${newPost.id}" style="display: none;">
                                <div class="habr-comments-header"><h4 class="comments-title">Комментарии (0)</h4></div>
                                <form class="habr-comment-form" data-post-id="${newPost.id}">
                                    <div class="comment-input-wrap">
                                        <textarea class="habr-comment-textarea" placeholder="Написать комментарий..." rows="3" required minlength="3"></textarea>
                                        <div class="comment-form-footer">
                                            <span class="comment-hint">Поддерживается Markdown</span>
                                            <button type="submit" class="btn-habr-submit-comment">Отправить</button>
                                        </div>
                                    </div>
                                </form>
                                <div class="habr-comments-list" id="comments-list-${newPost.id}"></div>
                            </div>
                        </article>
                    `;

                    if (articlesList) {
                        articlesList.insertAdjacentHTML("afterbegin", newCardHtml);
                    }

                    writeForm.reset();
                    closeWriteModal();
                    showToast("🎉 Статья успешно опубликована на Хабре!");

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

        // Hub Follow Toggle
        document.querySelectorAll(".btn-hub-follow").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const hub = btn.getAttribute("data-hub");
                if (btn.classList.contains("is-following")) {
                    btn.classList.remove("is-following");
                    btn.textContent = "+ Подписаться";
                    showToast("Вы отписались от хаба");
                } else {
                    btn.classList.add("is-following");
                    btn.textContent = "✓ Вы подписаны";
                    showToast("Вы подписались на хаб!");
                }
            });
        });

    });
})();