/**
 * SmartContractum — Habr-Style Article Creation & Editor Engine
 * File: frontend/static/js/forum_editor.js (v1.0.0)
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        // Elements
        const titleInput = document.getElementById("articleTitleInput");
        const editorCanvas = document.getElementById("editorCanvas");
        const rawMarkdown = document.getElementById("rawMarkdownEditor");
        const formatToolbar = document.getElementById("formatToolbar");
        
        const btnModeWysiwyg = document.getElementById("btnModeWysiwyg");
        const btnModeMarkdown = document.getElementById("btnModeMarkdown");
        
        const draftStatusText = document.getElementById("draftStatusText");
        const draftStatusIndicator = document.getElementById("draftStatusIndicator");
        
        const charCountLabel = document.getElementById("charCountLabel");
        const wordCountLabel = document.getElementById("wordCountLabel");
        const readingTimeEstimate = document.getElementById("readingTimeEstimate");
        
        const attachedCodeBox = document.getElementById("attachedCodeBox");
        const codeLangSelect = document.getElementById("codeLangSelect");
        const articleCodeInput = document.getElementById("articleCodeInput");
        const btnRemoveCodeBox = document.getElementById("btnRemoveCodeBox");
        
        const editorStepText = document.getElementById("editorStepText");
        const editorStepSettings = document.getElementById("editorStepSettings");
        const btnGoToSettings = document.getElementById("btnGoToSettings");
        const btnBackToText = document.getElementById("btnBackToText");
        const btnCancelSettings = document.getElementById("btnCancelSettings");
        
        const publicationForm = document.getElementById("publicationForm");
        const publishAlert = document.getElementById("publishAlert");
        const btnPublishFinal = document.getElementById("btnPublishFinal");
        const publishSpinner = document.getElementById("publishSpinner");
        const tagsInput = document.getElementById("tagsInput");
        
        const btnApplyTypografSidebar = document.getElementById("btnApplyTypografSidebar");
        const btnApplyTypografInline = document.getElementById("btnApplyTypografInline");
        const editorToast = document.getElementById("editorToast");
        const editorToastMessage = document.getElementById("editorToastMessage");

        let currentMode = "wysiwyg";
        let saveTimeout = null;
        const DRAFT_KEY = "smartcontractum_habr_article_draft_v1";

        // ==================================================================
        // 1. TYPOGRAPHER ENGINE (Авто-исправление кавычек, тире и пробелов)
        // ==================================================================
        function runTypograf(text) {
            if (!text) return "";
            let res = text;

            // 1. Convert quotes: "..." -> «...»
            res = res.replace(/(^|[\s(\[{<])"([^"]+)"/g, '$1«$2»');
            res = res.replace(/(^|[\s(\[{<])'([^']+)'/g, '$1«$2»');

            // 2. Convert dashes: " - " or "--" -> " — "
            res = res.replace(/(\s+)--(\s+)/g, '$1—$2');
            res = res.replace(/(\s+)-(\s+)/g, '$1—$2');

            // 3. Short prepositions non-breaking spaces
            const prepositions = ['в', 'и', 'с', 'к', 'о', 'у', 'на', 'за', 'из', 'от', 'до', 'по', 'об', 'не', 'но', 'ни'];
            prepositions.forEach(function (prep) {
                const regex = new RegExp('(?:^|([\s(]))(' + prep + ')\s+', 'gi');
                res = res.replace(regex, '$1$2 ');
            });

            return res;
        }

        function applyTypografToAll() {
            if (titleInput && titleInput.value) {
                titleInput.value = runTypograf(titleInput.value);
            }

            if (currentMode === "wysiwyg" && editorCanvas) {
                editorCanvas.innerHTML = runTypograf(editorCanvas.innerHTML);
            } else if (rawMarkdown && rawMarkdown.value) {
                rawMarkdown.value = runTypograf(rawMarkdown.value);
            }

            showToast("✨ Типограф успешно применен!");
            triggerAutosave();
        }

        if (btnApplyTypografSidebar) btnApplyTypografSidebar.addEventListener("click", applyTypografToAll);
        if (btnApplyTypografInline) btnApplyTypografInline.addEventListener("click", applyTypografToAll);

        // ==================================================================
        // 2. WYSIWYG / MARKDOWN MODE SWITCHER
        // ==================================================================
        function setEditorMode(mode) {
            if (mode === currentMode) return;
            currentMode = mode;

            if (mode === "markdown") {
                btnModeMarkdown.classList.add("is-active");
                btnModeWysiwyg.classList.remove("is-active");
                
                // Convert HTML to basic Markdown
                let htmlContent = editorCanvas.innerHTML;
                let md = htmlContent
                    .replace(/<h2>(.*?)<\/h2>/gi, '## $1

')
                    .replace(/<h3>(.*?)<\/h3>/gi, '### $1

')
                    .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1

')
                    .replace(/<p>(.*?)<\/p>/gi, '$1

')
                    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
                    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
                    .replace(/<br\s*[\/]?>/gi, '
')
                    .replace(/&nbsp;/g, ' ');
                
                rawMarkdown.value = md.trim();
                editorCanvas.style.display = "none";
                rawMarkdown.style.display = "block";
                rawMarkdown.focus();
            } else {
                btnModeWysiwyg.classList.add("is-active");
                btnModeMarkdown.classList.remove("is-active");
                
                // Convert Markdown to basic HTML
                let mdContent = rawMarkdown.value;
                let html = mdContent
                    .replace(/### (.*?)
/g, '<h3>$1</h3>')
                    .replace(/## (.*?)
/g, '<h2>$1</h2>')
                    .replace(/> (.*?)
/g, '<blockquote>$1</blockquote>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/

/g, '</p><p>')
                    .replace(/
/g, '<br>');
                
                editorCanvas.innerHTML = '<p>' + html + '</p>';
                rawMarkdown.style.display = "none";
                editorCanvas.style.display = "block";
                editorCanvas.focus();
            }
            updateCounters();
        }

        if (btnModeWysiwyg) btnModeWysiwyg.addEventListener("click", () => setEditorMode("wysiwyg"));
        if (btnModeMarkdown) btnModeMarkdown.addEventListener("click", () => setEditorMode("markdown"));

        // ==================================================================
        // 3. FORMATTING TOOLBAR EXECUTION
        // ==================================================================
        if (formatToolbar) {
            formatToolbar.addEventListener("click", function (e) {
                const btn = e.target.closest(".toolbar-btn");
                if (!btn) return;

                const cmd = btn.getAttribute("data-cmd");
                const val = btn.getAttribute("data-val") || null;
                const action = btn.getAttribute("data-action");

                if (action === "insert-code") {
                    if (attachedCodeBox) {
                        attachedCodeBox.style.display = "block";
                        articleCodeInput.focus();
                    }
                    return;
                }

                if (action === "insert-spoiler") {
                    document.execCommand("insertHTML", false, "<details><summary>Спойлер: нажмите чтобы развернуть</summary><p>Скрытый блок описания или конфигурации...</p></details><p><br></p>");
                    return;
                }

                if (cmd) {
                    document.execCommand(cmd, false, val);
                    editorCanvas.focus();
                }
            });
        }

        if (btnRemoveCodeBox) {
            btnRemoveCodeBox.addEventListener("click", function () {
                attachedCodeBox.style.display = "none";
                articleCodeInput.value = "";
                triggerAutosave();
            });
        }

        // ==================================================================
        // 4. WORD, CHARACTERS & READING TIME COUNTERS
        // ==================================================================
        function updateCounters() {
            let text = "";
            if (currentMode === "wysiwyg") {
                text = (editorCanvas ? editorCanvas.innerText : "") || "";
            } else {
                text = (rawMarkdown ? rawMarkdown.value : "") || "";
            }

            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const readMinutes = Math.max(1, Math.ceil(words / 180));

            if (charCountLabel) charCountLabel.textContent = chars + " символов";
            if (wordCountLabel) wordCountLabel.textContent = words + " слов";
            if (readingTimeEstimate) readingTimeEstimate.textContent = readMinutes + " мин чтения";
        }

        // Auto-expand title textarea
        if (titleInput) {
            titleInput.addEventListener("input", function () {
                this.style.height = "auto";
                this.style.height = (this.scrollHeight) + "px";
                triggerAutosave();
            });
        }

        if (editorCanvas) {
            editorCanvas.addEventListener("input", function () {
                updateCounters();
                triggerAutosave();
            });
        }

        if (rawMarkdown) {
            rawMarkdown.addEventListener("input", function () {
                updateCounters();
                triggerAutosave();
            });
        }

        // ==================================================================
        // 5. AUTOSAVE DRAFT MECHANISM
        // ==================================================================
        function triggerAutosave() {
            if (draftStatusText) draftStatusText.textContent = "Сохранение...";
            if (saveTimeout) clearTimeout(saveTimeout);

            saveTimeout = setTimeout(function () {
                const draft = {
                    title: titleInput ? titleInput.value : "",
                    bodyHtml: editorCanvas ? editorCanvas.innerHTML : "",
                    bodyMd: rawMarkdown ? rawMarkdown.value : "",
                    code: articleCodeInput ? articleCodeInput.value : "",
                    codeLang: codeLangSelect ? codeLangSelect.value : "solidity",
                    tags: tagsInput ? tagsInput.value : "",
                    mode: currentMode,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                try {
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                    if (draftStatusText) {
                        draftStatusText.textContent = "Сохранено в черновиках (" + draft.timestamp + ")";
                    }
                } catch (e) {
                    console.error("Draft save error:", e);
                }
            }, 800);
        }

        function restoreDraft() {
            try {
                const saved = localStorage.getItem(DRAFT_KEY);
                if (!saved) return;
                const draft = JSON.parse(saved);

                if (draft.title && titleInput) {
                    titleInput.value = draft.title;
                    titleInput.style.height = "auto";
                    titleInput.style.height = (titleInput.scrollHeight) + "px";
                }

                if (draft.bodyHtml && editorCanvas) {
                    editorCanvas.innerHTML = draft.bodyHtml;
                }

                if (draft.bodyMd && rawMarkdown) {
                    rawMarkdown.value = draft.bodyMd;
                }

                if (draft.code && articleCodeInput) {
                    articleCodeInput.value = draft.code;
                    if (attachedCodeBox) attachedCodeBox.style.display = "block";
                }

                if (draft.codeLang && codeLangSelect) {
                    codeLangSelect.value = draft.codeLang;
                }

                if (draft.tags && tagsInput) {
                    tagsInput.value = draft.tags;
                }

                updateCounters();
                if (draftStatusText && draft.timestamp) {
                    draftStatusText.textContent = "Сохранено в черновиках (" + draft.timestamp + ")";
                }
            } catch (e) {
                console.error("Draft restore error:", e);
            }
        }

        // Restore draft on load
        restoreDraft();

        // ==================================================================
        // 6. STEP 1 <-> STEP 2 TRANSITIONS
        // ==================================================================
        if (btnGoToSettings) {
            btnGoToSettings.addEventListener("click", function () {
                const title = (titleInput ? titleInput.value : "").trim();
                let body = "";
                if (currentMode === "wysiwyg") {
                    body = (editorCanvas ? editorCanvas.innerText : "").trim();
                } else {
                    body = (rawMarkdown ? rawMarkdown.value : "").trim();
                }

                if (title.length < 10) {
                    showToast("⚠️ Укажите заголовок статьи (минимум 10 символов)");
                    if (titleInput) titleInput.focus();
                    return;
                }

                if (body.length < 30) {
                    showToast("⚠️ Текст статьи должен содержать минимум 30 символов");
                    if (editorCanvas) editorCanvas.focus();
                    return;
                }

                editorStepText.style.display = "none";
                editorStepSettings.style.display = "block";
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        function returnToTextEditor() {
            editorStepSettings.style.display = "none";
            editorStepText.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (btnBackToText) btnBackToText.addEventListener("click", returnToTextEditor);
        if (btnCancelSettings) btnCancelSettings.addEventListener("click", returnToTextEditor);

        // Quick Tag Chips Click
        document.querySelectorAll(".btn-quick-tag").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const tag = btn.getAttribute("data-tag");
                if (!tagsInput) return;
                const current = tagsInput.value.split(",").map(s => s.trim()).filter(Boolean);
                if (!current.includes(tag)) {
                    current.push(tag);
                    tagsInput.value = current.join(", ");
                    triggerAutosave();
                }
            });
        });

        // Hub chip radio styling
        document.querySelectorAll(".hub-chip input[type='radio']").forEach(function (radio) {
            radio.addEventListener("change", function () {
                document.querySelectorAll(".hub-chip").forEach(c => c.classList.remove("is-selected"));
                const parent = radio.closest(".hub-chip");
                if (parent) parent.classList.add("is-selected");
            });
        });

        // ==================================================================
        // 7. ARTICLE PUBLICATION SUBMISSION
        // ==================================================================
        if (publicationForm) {
            publicationForm.addEventListener("submit", async function (e) {
                e.preventDefault();

                const title = (titleInput ? titleInput.value : "").trim();
                let body = "";
                if (currentMode === "wysiwyg") {
                    body = (editorCanvas ? editorCanvas.innerHTML : "").trim();
                } else {
                    body = (rawMarkdown ? rawMarkdown.value : "").trim();
                }

                const selectedCategory = publicationForm.querySelector("input[name='category_slug']:checked");
                const category_slug = selectedCategory ? selectedCategory.value : "smart-contracts";
                const authorRoleSelect = document.getElementById("authorRoleSelect");
                const author_role = authorRoleSelect ? authorRoleSelect.value : "Разработчик";

                const tags = tagsInput ? tagsInput.value.split(",").map(s => s.trim()).filter(Boolean) : [];
                const codeSnippet = articleCodeInput ? articleCodeInput.value.trim() : null;
                const codeLang = codeLangSelect ? codeLangSelect.value : "solidity";

                if (publishSpinner) publishSpinner.style.display = "inline-block";
                if (btnPublishFinal) btnPublishFinal.disabled = true;
                if (publishAlert) publishAlert.style.display = "none";

                try {
                    const response = await fetch("/api/v1/forum/topics", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: title,
                            body: body,
                            category_slug: category_slug,
                            hubs: [category_slug],
                            tags: tags,
                            code_snippet: codeSnippet || null,
                            code_language: codeLang,
                            author_role: author_role,
                            author_name: "ООО Интегратор (Umbrella-Dev)",
                            post_type: "article"
                        })
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.detail || "Ошибка при публикации");
                    }

                    const resData = await response.json();
                    
                    // Clear draft upon successful publication
                    localStorage.removeItem(DRAFT_KEY);

                    showToast("🎉 Статья успешно опубликована на Хабре!");

                    setTimeout(function () {
                        window.location.href = "/feed#post-" + (resData.topic ? resData.topic.id : "");
                    }, 1000);

                } catch (err) {
                    if (publishAlert) {
                        publishAlert.textContent = err.message || "Ошибка публикации";
                        publishAlert.style.display = "block";
                    }
                } finally {
                    if (publishSpinner) publishSpinner.style.display = "none";
                    if (btnPublishFinal) btnPublishFinal.disabled = false;
                }
            });
        }

        // ==================================================================
        // 8. TOAST NOTIFICATION HELPER
        // ==================================================================
        function showToast(msg) {
            if (!editorToast || !editorToastMessage) return;
            editorToastMessage.textContent = msg;
            editorToast.style.display = "flex";
            setTimeout(function () {
                editorToast.style.display = "none";
            }, 3000);
        }
    });
})();
