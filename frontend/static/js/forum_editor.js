/**
 * SmartContractum — Complete Habr-Style Article Creation & Editor Engine
 * Supports all 12 Rich Content Blocks (Video, Image, Table, Code, Formula, Spoiler, Anchor, etc.)
 * File: frontend/static/js/forum_editor.js (v2.0.0)
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        // Core Elements
        const titleInput = document.getElementById("articleTitleInput");
        const editorCanvas = document.getElementById("editorCanvas");
        const rawMarkdown = document.getElementById("rawMarkdownEditor");
        const formatToolbar = document.getElementById("formatToolbar");
        const slashMenu = document.getElementById("slashPopupMenu");

        // Topbar Controls
        const btnModeWysiwyg = document.getElementById("btnModeWysiwyg");
        const btnModeMarkdown = document.getElementById("btnModeMarkdown");
        const draftStatusText = document.getElementById("draftStatusText");

        // Counters
        const charCountLabel = document.getElementById("charCountLabel");
        const wordCountLabel = document.getElementById("wordCountLabel");
        const readingTimeEstimate = document.getElementById("readingTimeEstimate");

        // Steps & Forms
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

        // Typographer & Toast
        const btnApplyTypografSidebar = document.getElementById("btnApplyTypografSidebar");
        const btnApplyTypografInline = document.getElementById("btnApplyTypografInline");
        const editorToast = document.getElementById("editorToast");
        const editorToastMessage = document.getElementById("editorToastMessage");

        // Modals
        const modalVideo = document.getElementById("modalVideoEmbed");
        const modalImage = document.getElementById("modalImageInsert");
        const modalTable = document.getElementById("modalTableGenerator");
        const modalCode = document.getElementById("modalCodeBlock");
        const modalFormula = document.getElementById("modalFormulaInsert");
        const modalSpoiler = document.getElementById("modalSpoilerInsert");
        const modalAnchor = document.getElementById("modalAnchorInsert");

        let currentMode = "wysiwyg";
        let saveTimeout = null;
        let savedSelectionRange = null;
        const DRAFT_KEY = "smartcontractum_habr_article_draft_v2";

        // ==================================================================
        // 1. SELECTION & RANGE HELPERS
        // ==================================================================
        function saveSelection() {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                savedSelectionRange = sel.getRangeAt(0).cloneRange();
            }
        }

        function restoreSelection() {
            if (savedSelectionRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(savedSelectionRange);
            }
        }

        function insertHtmlAtCursor(htmlSnippet) {
            editorCanvas.focus();
            restoreSelection();

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                editorCanvas.innerHTML += htmlSnippet;
                updateCounters();
                triggerAutosave();
                return;
            }

            const range = sel.getRangeAt(0);
            range.deleteContents();

            const el = document.createElement("div");
            el.innerHTML = htmlSnippet;
            const frag = document.createDocumentFragment();
            let node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            if (lastNode) {
                const newRange = range.cloneRange();
                newRange.setStartAfter(lastNode);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }

            updateCounters();
            triggerAutosave();
        }

        // ==================================================================
        // 2. ALL 12 RICH BLOCK INSERTION HANDLERS
        // ==================================================================

        // 2.1 Video Embed Parser (YouTube, Vimeo, VK Video, Rutube)
        function parseVideoEmbedUrl(url) {
            if (!url) return null;
            url = url.trim();

            // YouTube (watch, embed, short link)
            const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
            if (ytMatch && ytMatch[1]) {
                return "https://www.youtube.com/embed/" + ytMatch[1] + "?rel=0";
            }

            // Vimeo
            const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
            if (vimeoMatch && vimeoMatch[3]) {
                return "https://player.vimeo.com/video/" + vimeoMatch[3];
            }

            // VK Video
            const vkMatch = url.match(/vk\.com\/video_ext\.php\?oid=([^&]+)&id=([^&]+)&hash=([^&]+)/i);
            if (vkMatch) {
                return url;
            }

            // Rutube
            const rutubeMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/i);
            if (rutubeMatch && rutubeMatch[1]) {
                return "https://rutube.ru/play/embed/" + rutubeMatch[1];
            }

            if (url.startsWith("http")) return url;
            return null;
        }

        // Submit Video Embed
        const btnSubmitVideo = document.getElementById("btnSubmitVideoEmbed");
        if (btnSubmitVideo) {
            btnSubmitVideo.addEventListener("click", function () {
                const videoUrl = document.getElementById("videoUrlInput").value.trim();
                const videoCaption = document.getElementById("videoCaptionInput").value.trim();

                const embedSrc = parseVideoEmbedUrl(videoUrl);
                if (!embedSrc) {
                    alert("Пожалуйста, введите корректную ссылку на видео (YouTube, Vimeo, VK Video или Rutube)");
                    return;
                }

                const captionHtml = videoCaption ? `<div class="video-caption">Видео: <span class="video-title">${escapeHtml(videoCaption)}</span></div>` : '';
                const videoHtml = `
                    <div class="habr-embed-video-wrapper" data-video-url="${escapeHtml(videoUrl)}">
                        <div class="video-responsive-container">
                            <iframe src="${embedSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
                        </div>
                        ${captionHtml}
                    </div>
                    <p><br></p>
                `;

                insertHtmlAtCursor(videoHtml);
                closeAllModals();
                document.getElementById("videoUrlInput").value = "";
                document.getElementById("videoCaptionInput").value = "";
                showToast("▶ Видеоплеер успешно вставлен!");
            });
        }

        // 2.2 Image Insertion (URL + File Picker)
        const btnSubmitImage = document.getElementById("btnSubmitImageInsert");
        const imageFileInput = document.getElementById("imageFileInput");
        const imageDropzone = document.getElementById("imageDropzone");

        if (imageDropzone && imageFileInput) {
            imageDropzone.addEventListener("click", () => imageFileInput.click());
            imageFileInput.addEventListener("change", function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById("imageUrlInput").value = e.target.result;
                        imageDropzone.innerHTML = "<span>✓ Файл загружен: " + escapeHtml(file.name) + "</span>";
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (btnSubmitImage) {
            btnSubmitImage.addEventListener("click", function () {
                const imgUrl = document.getElementById("imageUrlInput").value.trim();
                const imgCaption = document.getElementById("imageCaptionInput").value.trim();

                if (!imgUrl) {
                    alert("Укажите URL изображения или выберите файл");
                    return;
                }

                const captionHtml = imgCaption ? `<figcaption class="habr-img-caption">${escapeHtml(imgCaption)}</figcaption>` : '';
                const imgHtml = `
                    <figure class="habr-image-wrapper">
                        <img src="${imgUrl}" alt="${escapeHtml(imgCaption || 'Иллюстрация к статье')}" class="habr-article-img" loading="lazy" />
                        ${captionHtml}
                    </figure>
                    <p><br></p>
                `;

                insertHtmlAtCursor(imgHtml);
                closeAllModals();
                document.getElementById("imageUrlInput").value = "";
                document.getElementById("imageCaptionInput").value = "";
                showToast("🖼 Изображение добавлено!");
            });
        }

        // 2.3 Interactive Table Generator
        const btnSubmitTable = document.getElementById("btnSubmitTableInsert");
        if (btnSubmitTable) {
            btnSubmitTable.addEventListener("click", function () {
                const rows = parseInt(document.getElementById("tableRowsInput").value, 10) || 3;
                const cols = parseInt(document.getElementById("tableColsInput").value, 10) || 3;
                const hasHeader = document.getElementById("tableHasHeader").checked;

                let tableHtml = '<div class="habr-table-wrapper"><table class="habr-table">';
                
                if (hasHeader) {
                    tableHtml += '<thead><tr>';
                    for (let c = 1; c <= cols; c++) {
                        tableHtml += `<th>Колонка ${c}</th>`;
                    }
                    tableHtml += '</tr></thead>';
                }

                tableHtml += '<tbody>';
                for (let r = 1; r <= rows; r++) {
                    tableHtml += '<tr>';
                    for (let c = 1; c <= cols; c++) {
                        tableHtml += `<td>Ячейка ${r}.${c}</td>`;
                    }
                    tableHtml += '</tr>';
                }
                tableHtml += '</tbody></table></div><p><br></p>';

                insertHtmlAtCursor(tableHtml);
                closeAllModals();
                showToast("▦ Таблица успешно создана!");
            });
        }

        // 2.4 Code Snippet with Language Switcher
        const btnSubmitCode = document.getElementById("btnSubmitCodeInsert");
        if (btnSubmitCode) {
            btnSubmitCode.addEventListener("click", function () {
                const lang = document.getElementById("modalCodeLangSelect").value;
                const title = document.getElementById("modalCodeTitleInput").value.trim();
                const code = document.getElementById("modalCodeTextarea").value;

                if (!code.trim()) {
                    alert("Пожалуйста, введите фрагмент кода");
                    return;
                }

                const titleBadge = title ? ` • ${escapeHtml(title)}` : '';
                const codeHtml = `
                    <div class="habr-code-snippet" data-lang="${lang}">
                        <div class="code-snippet-header">
                            <span class="code-snippet-lang">${lang.toUpperCase()}${titleBadge}</span>
                            <button type="button" class="btn-copy-snippet" onclick="navigator.clipboard.writeText(this.closest('.habr-code-snippet').querySelector('code').textContent).then(() => { this.textContent = 'Скопировано!'; setTimeout(() => this.textContent = 'Скопировать', 2000); })">Скопировать</button>
                        </div>
                        <pre class="code-pre"><code class="language-${lang}">${escapeHtml(code)}</code></pre>
                    </div>
                    <p><br></p>
                `;

                insertHtmlAtCursor(codeHtml);
                closeAllModals();
                document.getElementById("modalCodeTextarea").value = "";
                document.getElementById("modalCodeTitleInput").value = "";
                showToast("</> Блок кода вставлен!");
            });
        }

        // 2.5 LaTeX Formula Insertion
        const formulaInput = document.getElementById("formulaTexInput");
        const formulaPreview = document.getElementById("formulaRenderPreview");
        const btnSubmitFormula = document.getElementById("btnSubmitFormulaInsert");

        if (formulaInput && formulaPreview) {
            formulaInput.addEventListener("input", function () {
                formulaPreview.textContent = "$$" + (this.value.trim() || "E = mc^2") + "$$";
            });
        }

        if (btnSubmitFormula) {
            btnSubmitFormula.addEventListener("click", function () {
                const tex = document.getElementById("formulaTexInput").value.trim() || "E = mc^2";
                const formulaHtml = `
                    <div class="habr-math-formula" data-formula="${escapeHtml(tex)}">
                        <span class="math-tex-rendered">$$ ${escapeHtml(tex)} $$</span>
                    </div>
                    <p><br></p>
                `;

                insertHtmlAtCursor(formulaHtml);
                closeAllModals();
                showToast("∑ Формула добавлена!");
            });
        }

        // 2.6 Spoiler Insertion
        const btnSubmitSpoiler = document.getElementById("btnSubmitSpoilerInsert");
        if (btnSubmitSpoiler) {
            btnSubmitSpoiler.addEventListener("click", function () {
                const title = document.getElementById("spoilerTitleInput").value.trim() || "Спойлер";
                const content = document.getElementById("spoilerContentInput").value.trim() || "Скрытое описание...";

                const spoilerHtml = `
                    <details class="habr-spoiler">
                        <summary class="habr-spoiler-title">▶ ${escapeHtml(title)}</summary>
                        <div class="habr-spoiler-content">
                            <p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>
                        </div>
                    </details>
                    <p><br></p>
                `;

                insertHtmlAtCursor(spoilerHtml);
                closeAllModals();
                showToast("▼ Спойлер вставлен!");
            });
        }

        // 2.7 Anchor Insertion
        const btnSubmitAnchor = document.getElementById("btnSubmitAnchorInsert");
        if (btnSubmitAnchor) {
            btnSubmitAnchor.addEventListener("click", function () {
                let id = document.getElementById("anchorIdInput").value.trim() || "anchor-point";
                id = id.replace(/[^a-zA-Z0-9\-_]/g, "-").toLowerCase();

                const anchorHtml = `
                    <span id="${escapeHtml(id)}" class="habr-anchor-point" title="Якорь: #${id}">⚓ #${escapeHtml(id)}</span>
                    <p><br></p>
                `;

                insertHtmlAtCursor(anchorHtml);
                closeAllModals();
                showToast("⚓ Якорь вставлен!");
            });
        }

        // 2.8 Quote Block Insertion
        function insertQuoteBlock() {
            const quoteHtml = `
                <blockquote class="habr-quote">
                    <p>Текст важной цитаты или тезиса публикации...</p>
                    <cite class="habr-quote-author">— Эксперт ПКСК Банка России</cite>
                </blockquote>
                <p><br></p>
            `;
            insertHtmlAtCursor(quoteHtml);
            showToast("❝ Цитата вставлена!");
        }

        // 2.9 Divider Insertion
        function insertDividerRule() {
            insertHtmlAtCursor('<hr class="habr-divider"><p><br></p>');
            showToast("— Разделитель добавлен!");
        }

        // ==================================================================
        // 3. MODAL CONTROLLERS & CLOSERS
        // ==================================================================
        function openModal(modalEl) {
            saveSelection();
            closeAllModals();
            if (modalEl) {
                modalEl.classList.add("is-active");
                modalEl.setAttribute("aria-hidden", "false");
                const firstInput = modalEl.querySelector("input, textarea, select");
                if (firstInput) setTimeout(() => firstInput.focus(), 50);
            }
        }

        function closeAllModals() {
            document.querySelectorAll(".editor-modal-overlay").forEach(m => {
                m.classList.remove("is-active");
                m.setAttribute("aria-hidden", "true");
            });
        }

        document.querySelectorAll("[data-close-modal]").forEach(btn => {
            btn.addEventListener("click", closeAllModals);
        });

        document.querySelectorAll(".editor-modal-overlay").forEach(overlay => {
            overlay.addEventListener("click", function (e) {
                if (e.target === overlay) closeAllModals();
            });
        });

        // ==================================================================
        // 4. FORMAT TOOLBAR DISPATCHER
        // ==================================================================
        if (formatToolbar) {
            formatToolbar.addEventListener("click", function (e) {
                const btn = e.target.closest(".toolbar-btn");
                if (!btn) return;

                const cmd = btn.getAttribute("data-cmd");
                const val = btn.getAttribute("data-val");
                const action = btn.getAttribute("data-action");

                saveSelection();

                if (action === "open-video-modal") { openModal(modalVideo); return; }
                if (action === "open-image-modal") { openModal(modalImage); return; }
                if (action === "open-table-modal") { openModal(modalTable); return; }
                if (action === "open-code-modal") { openModal(modalCode); return; }
                if (action === "open-formula-modal") { openModal(modalFormula); return; }
                if (action === "open-spoiler-modal") { openModal(modalSpoiler); return; }
                if (action === "open-anchor-modal") { openModal(modalAnchor); return; }
                if (action === "insert-quote") { insertQuoteBlock(); return; }
                if (action === "insert-divider") { insertDividerRule(); return; }

                if (cmd) {
                    document.execCommand(cmd, false, val || null);
                    editorCanvas.focus();
                    updateCounters();
                    triggerAutosave();
                }
            });
        }

        // ==================================================================
        // 5. SLASH ("/") POPUP MENU TRIGGER
        // ==================================================================
        if (editorCanvas && slashMenu) {
            editorCanvas.addEventListener("keydown", function (e) {
                if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
                    saveSelection();
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const rect = sel.getRangeAt(0).getBoundingClientRect();
                        const canvasRect = editorCanvas.getBoundingClientRect();

                        slashMenu.style.top = (rect.bottom - canvasRect.top + 30) + "px";
                        slashMenu.style.left = (Math.max(10, rect.left - canvasRect.left)) + "px";
                        slashMenu.style.display = "block";
                    }
                } else if (e.key === "Escape") {
                    slashMenu.style.display = "none";
                }
            });

            document.addEventListener("click", function (e) {
                if (!slashMenu.contains(e.target) && e.target !== editorCanvas) {
                    slashMenu.style.display = "none";
                }
            });

            slashMenu.addEventListener("click", function (e) {
                const item = e.target.closest(".slash-item");
                if (!item) return;

                const action = item.getAttribute("data-action");
                slashMenu.style.display = "none";

                if (action === "insert-h2") { document.execCommand("formatBlock", false, "h2"); return; }
                if (action === "insert-h3") { document.execCommand("formatBlock", false, "h3"); return; }
                if (action === "insert-quote") { insertQuoteBlock(); return; }
                if (action === "insert-ul") { document.execCommand("insertUnorderedList"); return; }
                if (action === "insert-ol") { document.execCommand("insertOrderedList"); return; }
                if (action === "open-video-modal") { openModal(modalVideo); return; }
                if (action === "open-image-modal") { openModal(modalImage); return; }
                if (action === "open-table-modal") { openModal(modalTable); return; }
                if (action === "open-code-modal") { openModal(modalCode); return; }
                if (action === "open-formula-modal") { openModal(modalFormula); return; }
                if (action === "open-spoiler-modal") { openModal(modalSpoiler); return; }
                if (action === "open-anchor-modal") { openModal(modalAnchor); return; }
                if (action === "insert-divider") { insertDividerRule(); return; }
            });
        }

        // ==================================================================
        // 6. TYPOGRAPHER ENGINE (Кавычки «», тире —, неразрывные пробелы)
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
                const regex = new RegExp('(?:^|([\\s(]))(' + prep + ')\\s+', 'gi');
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

            showToast("✨ Типограф успешно применен ко всем блокам!");
            triggerAutosave();
        }

        if (btnApplyTypografSidebar) btnApplyTypografSidebar.addEventListener("click", applyTypografToAll);
        if (btnApplyTypografInline) btnApplyTypografInline.addEventListener("click", applyTypografToAll);

        // ==================================================================
        // 7. WYSIWYG / MARKDOWN MODE SWITCHER
        // ==================================================================
        function setEditorMode(mode) {
            if (mode === currentMode) return;
            currentMode = mode;

            if (mode === "markdown") {
                btnModeMarkdown.classList.add("is-active");
                btnModeWysiwyg.classList.remove("is-active");
                
                let htmlContent = editorCanvas.innerHTML;
                let md = htmlContent
                    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
                    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
                    .replace(/<blockquote.*?>(.*?)<\/blockquote>/gis, '> $1\n\n')
                    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
                    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
                    .replace(/<hr class="habr-divider">/gi, '---')
                    .replace(/<br\s*[\/]?>/gi, '\n')
                    .replace(/&nbsp;/g, ' ');
                
                rawMarkdown.value = md.trim();
                editorCanvas.style.display = "none";
                rawMarkdown.style.display = "block";
                rawMarkdown.focus();
            } else {
                btnModeWysiwyg.classList.add("is-active");
                btnModeMarkdown.classList.remove("is-active");
                
                let mdContent = rawMarkdown.value;
                let html = mdContent
                    .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                    .replace(/## (.*?)\n/g, '<h2>$1</h2>')
                    .replace(/> (.*?)\n/g, '<blockquote class="habr-quote"><p>$1</p></blockquote>')
                    .replace(/---/g, '<hr class="habr-divider">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>');
                
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
        // 8. COUNTERS & REAL-TIME AUTOSAVE
        // ==================================================================
        function updateCounters() {
            let text = (currentMode === "wysiwyg" ? (editorCanvas ? editorCanvas.innerText : "") : (rawMarkdown ? rawMarkdown.value : "")) || "";
            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const readMinutes = Math.max(1, Math.ceil(words / 180));

            if (charCountLabel) charCountLabel.textContent = chars + " символов";
            if (wordCountLabel) wordCountLabel.textContent = words + " слов";
            if (readingTimeEstimate) readingTimeEstimate.textContent = readMinutes + " мин чтения";
        }

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

        function triggerAutosave() {
            if (draftStatusText) draftStatusText.textContent = "Сохранение...";
            if (saveTimeout) clearTimeout(saveTimeout);

            saveTimeout = setTimeout(function () {
                const draft = {
                    title: titleInput ? titleInput.value : "",
                    bodyHtml: editorCanvas ? editorCanvas.innerHTML : "",
                    bodyMd: rawMarkdown ? rawMarkdown.value : "",
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

        restoreDraft();

        // ==================================================================
        // 9. STEP 1 <-> STEP 2 TRANSITIONS & PUBLICATION
        // ==================================================================
        if (btnGoToSettings) {
            btnGoToSettings.addEventListener("click", function () {
                const title = (titleInput ? titleInput.value : "").trim();
                let body = (currentMode === "wysiwyg" ? (editorCanvas ? editorCanvas.innerText : "") : (rawMarkdown ? rawMarkdown.value : "")).trim();

                if (title.length < 10) {
                    showToast("⚠️ Заголовок должен содержать минимум 10 символов");
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

        // Publication Form Submit
        if (publicationForm) {
            publicationForm.addEventListener("submit", async function (e) {
                e.preventDefault();

                const title = (titleInput ? titleInput.value : "").trim();
                let body = (currentMode === "wysiwyg" ? (editorCanvas ? editorCanvas.innerHTML : "") : (rawMarkdown ? rawMarkdown.value : "")).trim();

                const selectedCategory = publicationForm.querySelector("input[name='category_slug']:checked");
                const category_slug = selectedCategory ? selectedCategory.value : "smart-contracts";
                const authorRoleSelect = document.getElementById("authorRoleSelect");
                const author_role = authorRoleSelect ? authorRoleSelect.value : "Разработчик";
                const tags = tagsInput ? tagsInput.value.split(",").map(s => s.trim()).filter(Boolean) : ["ПКСК", "Solidity"];

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
                    localStorage.removeItem(DRAFT_KEY);

                    showToast("🎉 Статья со всеми медиаэлементами успешно опубликована!");

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

        function escapeHtml(text) {
            if (!text) return "";
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

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
