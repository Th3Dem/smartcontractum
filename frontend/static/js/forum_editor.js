/**
 * SmartContractum — Habr 2.0 Article Creation & Editor Suite
 * Supports all 12 Rich Content Blocks, Segmented Views, Floating Inline Toolbar,
 * Block Handles & Menu, Interactive Table Controls, Live Preview, and Server Draft API.
 * File: frontend/static/js/forum_editor.js (v2.1.0)
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        // ==================================================================
        // 1. CORE DOM ELEMENTS
        // ==================================================================
        const titleInput = document.getElementById("articleTitleInput");
        const editorCanvas = document.getElementById("editorCanvas");
        const rawMarkdown = document.getElementById("rawMarkdownEditor");
        const formatToolbar = document.getElementById("formatToolbar");
        const slashMenu = document.getElementById("slashPopupMenu");

        // Topbar & Mode Switchers
        const editorViewSwitcher = document.getElementById("editorViewSwitcher");
        const btnViewEditor = document.getElementById("btnViewEditor");
        const btnViewPreview = document.getElementById("btnViewPreview");
        const btnViewSplit = document.getElementById("btnViewSplit");
        const btnModeWysiwyg = document.getElementById("btnModeWysiwyg");
        const btnModeMarkdown = document.getElementById("btnModeMarkdown");
        const draftStatusIndicator = document.getElementById("draftStatusIndicator");
        const draftStatusText = document.getElementById("draftStatusText");

        // Main Layout & Panes
        const editorMainGrid = document.getElementById("editorMainGrid");
        const editorMainColumn = document.getElementById("editorMainColumn");
        const editorStepText = document.getElementById("editorStepText");
        const editorStepSettings = document.getElementById("editorStepSettings");
        const editorStepPreview = document.getElementById("editorStepPreview");
        const editorSplitPreviewPane = document.getElementById("editorSplitPreviewPane");
        const editorSidebar = document.getElementById("editorSidebar");

        // Counters & Action Buttons
        const charCountLabel = document.getElementById("charCountLabel");
        const wordCountLabel = document.getElementById("wordCountLabel");
        const readingTimeEstimate = document.getElementById("readingTimeEstimate");
        const btnGoToSettings = document.getElementById("btnGoToSettings");
        const btnBackToText = document.getElementById("btnBackToText");
        const btnCancelSettings = document.getElementById("btnCancelSettings");
        const btnBackFromPreview = document.getElementById("btnBackFromPreview");
        const publicationForm = document.getElementById("publicationForm");
        const publishAlert = document.getElementById("publishAlert");
        const btnPublishFinal = document.getElementById("btnPublishFinal");
        const publishSpinner = document.getElementById("publishSpinner");
        const tagsInput = document.getElementById("tagsInput");
        const authorRoleSelect = document.getElementById("authorRoleSelect");

        // Typographer & Toast
        const btnApplyTypografSidebar = document.getElementById("btnApplyTypografSidebar");
        const btnApplyTypografInline = document.getElementById("btnApplyTypografInline");
        const editorToast = document.getElementById("editorToast");
        const editorToastMessage = document.getElementById("editorToastMessage");

        // Floating Selection Toolbar
        const scFloatingToolbar = document.getElementById("scFloatingToolbar");
        const btnInlineLink = document.getElementById("btnInlineLink");
        const scLinkPopover = document.getElementById("scLinkPopover");
        const scInlineLinkInput = document.getElementById("scInlineLinkInput");
        const scBtnApplyLink = document.getElementById("scBtnApplyLink");
        const scBtnUnlink = document.getElementById("scBtnUnlink");

        // Block Handle & Menu
        const scBlockHandle = document.getElementById("scBlockHandle");
        const scHandleTrigger = document.getElementById("scHandleTrigger");
        const scBlockActionMenu = document.getElementById("scBlockActionMenu");

        // Table Quick Controls
        const scTableQuickToolbar = document.getElementById("scTableQuickToolbar");
        const tableQuickToggleHeader = document.getElementById("tableQuickToggleHeader");
        const tableQuickToggleZebra = document.getElementById("tableQuickToggleZebra");
        const tableQuickBtnAddRow = document.getElementById("tableQuickBtnAddRow");
        const tableQuickBtnDelRow = document.getElementById("tableQuickBtnDelRow");
        const tableQuickBtnAddCol = document.getElementById("tableQuickBtnAddCol");
        const tableQuickBtnDelCol = document.getElementById("tableQuickBtnDelCol");
        const tableQuickBtnDeleteTable = document.getElementById("tableQuickBtnDeleteTable");

        // Preview Step Elements
        const previewArticleTitle = document.getElementById("previewArticleTitle");
        const previewArticleBody = document.getElementById("previewArticleBody");
        const previewHubBadge = document.getElementById("previewHubBadge");
        const previewReadTime = document.getElementById("previewReadTime");
        const previewAuthorRole = document.getElementById("previewAuthorRole");
        const previewTagsList = document.getElementById("previewTagsList");
        const previewPublicationDate = document.getElementById("previewPublicationDate");

        // Split Preview Elements
        const splitArticleTitle = document.getElementById("splitArticleTitle");
        const splitArticleBody = document.getElementById("splitArticleBody");
        const splitHubBadge = document.getElementById("splitHubBadge");
        const splitReadTime = document.getElementById("splitReadTime");
        const splitAuthorRole = document.getElementById("splitAuthorRole");
        const splitTagsList = document.getElementById("splitTagsList");

        // 12 Block Modals
        const modalVideo = document.getElementById("modalVideoEmbed");
        const modalImage = document.getElementById("modalImageInsert");
        const modalTable = document.getElementById("modalTableGenerator");
        const modalCode = document.getElementById("modalCodeBlock");
        const modalFormula = document.getElementById("modalFormulaInsert");
        const modalSpoiler = document.getElementById("modalSpoilerInsert");
        const modalAnchor = document.getElementById("modalAnchorInsert");

        // State
        let currentMode = "wysiwyg"; // 'wysiwyg' | 'markdown'
        let currentView = "editor";  // 'editor' | 'preview' | 'split'
        let saveTimeout = null;
        let savedSelectionRange = null;
        let currentActiveBlock = null;
        let currentActiveTable = null;
        let currentActiveTableCell = null;
        let hideHandleTimeout = null;
        const DRAFT_KEY = "smartcontractum_habr_article_draft_v2";

        // ==================================================================
        // 2. SELECTION & RANGE HELPERS
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
                updateLivePreview();
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
            updateLivePreview();
        }

        function getClosestParent(node, tagName) {
            let curr = node.nodeType === 3 ? node.parentNode : node;
            while (curr && curr !== editorCanvas && curr !== document.body) {
                if (curr.tagName && curr.tagName.toLowerCase() === tagName.toLowerCase()) {
                    return curr;
                }
                curr = curr.parentNode;
            }
            return null;
        }

        // ==================================================================
        // 3. FLOATING INLINE SELECTION TOOLBAR (#scFloatingToolbar)
        // ==================================================================
        function checkInlineSelection() {
            if (currentMode !== "wysiwyg") {
                if (scFloatingToolbar) scFloatingToolbar.style.display = "none";
                return;
            }

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                // If popover is active and focused, don't close immediately
                if (scLinkPopover && scLinkPopover.style.display === "block" && document.activeElement === scInlineLinkInput) {
                    return;
                }
                if (scFloatingToolbar) scFloatingToolbar.style.display = "none";
                if (scLinkPopover) scLinkPopover.style.display = "none";
                return;
            }

            const range = sel.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;

            // Ensure selection is inside editor canvas
            if (!editorCanvas.contains(commonAncestor)) {
                if (scFloatingToolbar) scFloatingToolbar.style.display = "none";
                return;
            }

            const rect = range.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                if (scFloatingToolbar) scFloatingToolbar.style.display = "none";
                return;
            }

            // Position floating toolbar centered above selected text
            const topPos = rect.top + window.scrollY - 46;
            const leftPos = rect.left + window.scrollX + (rect.width / 2);

            scFloatingToolbar.style.top = Math.max(10, topPos) + "px";
            scFloatingToolbar.style.left = leftPos + "px";
            scFloatingToolbar.style.display = "flex";

            // Update button active states
            updateInlineButtonStates();
        }

        function updateInlineButtonStates() {
            if (!scFloatingToolbar) return;

            const boldBtn = scFloatingToolbar.querySelector('[data-inline-cmd="bold"]');
            const italicBtn = scFloatingToolbar.querySelector('[data-inline-cmd="italic"]');
            const strikeBtn = scFloatingToolbar.querySelector('[data-inline-cmd="strikeThrough"]');
            const codeBtn = scFloatingToolbar.querySelector('[data-inline-cmd="code"]');
            const markerBtn = scFloatingToolbar.querySelector('[data-inline-cmd="marker"]');
            const linkBtn = scFloatingToolbar.querySelector('#btnInlineLink');

            if (boldBtn) boldBtn.classList.toggle("is-active", document.queryCommandState("bold"));
            if (italicBtn) italicBtn.classList.toggle("is-active", document.queryCommandState("italic"));
            if (strikeBtn) strikeBtn.classList.toggle("is-active", document.queryCommandState("strikeThrough"));

            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const node = sel.getRangeAt(0).commonAncestorContainer;
                if (codeBtn) codeBtn.classList.toggle("is-active", !!getClosestParent(node, "code"));
                if (markerBtn) markerBtn.classList.toggle("is-active", !!getClosestParent(node, "mark"));
                if (linkBtn) linkBtn.classList.toggle("is-active", !!getClosestParent(node, "a"));
            }
        }

        document.addEventListener("selectionchange", checkInlineSelection);
        if (editorCanvas) {
            editorCanvas.addEventListener("mouseup", checkInlineSelection);
            editorCanvas.addEventListener("keyup", checkInlineSelection);
        }

        // Inline Toolbar Action Handlers
        if (scFloatingToolbar) {
            scFloatingToolbar.addEventListener("click", function (e) {
                const btn = e.target.closest(".sc-inline-btn");
                if (!btn) return;

                const cmd = btn.getAttribute("data-inline-cmd");
                const action = btn.getAttribute("data-inline-action");

                if (cmd === "bold" || cmd === "italic" || cmd === "strikeThrough") {
                    document.execCommand(cmd, false, null);
                    updateInlineButtonStates();
                    triggerAutosave();
                    updateLivePreview();
                } else if (cmd === "code") {
                    toggleInlineCode();
                } else if (cmd === "marker") {
                    toggleInlineMarker();
                } else if (action === "toggle-link") {
                    toggleInlineLinkPopover();
                }
            });
        }

        function toggleInlineCode() {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const parentCode = getClosestParent(range.commonAncestorContainer, "code");

            if (parentCode) {
                const text = document.createTextNode(parentCode.textContent);
                parentCode.parentNode.replaceChild(text, parentCode);
            } else {
                const codeEl = document.createElement("code");
                codeEl.appendChild(range.extractContents());
                range.insertNode(codeEl);
            }
            updateInlineButtonStates();
            triggerAutosave();
            updateLivePreview();
        }

        function toggleInlineMarker() {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const parentMark = getClosestParent(range.commonAncestorContainer, "mark");

            if (parentMark) {
                const text = document.createTextNode(parentMark.textContent);
                parentMark.parentNode.replaceChild(text, parentMark);
            } else {
                const markEl = document.createElement("mark");
                markEl.className = "habr-highlight";
                markEl.appendChild(range.extractContents());
                range.insertNode(markEl);
            }
            updateInlineButtonStates();
            triggerAutosave();
            updateLivePreview();
        }

        function toggleInlineLinkPopover() {
            if (!scLinkPopover) return;
            saveSelection();

            if (scLinkPopover.style.display === "block") {
                scLinkPopover.style.display = "none";
                return;
            }

            scLinkPopover.style.display = "block";
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const parentA = getClosestParent(sel.getRangeAt(0).commonAncestorContainer, "a");
                if (parentA) {
                    scInlineLinkInput.value = parentA.getAttribute("href") || "";
                } else {
                    scInlineLinkInput.value = "";
                }
            }
            setTimeout(() => scInlineLinkInput.focus(), 50);
        }

        if (scBtnApplyLink) {
            scBtnApplyLink.addEventListener("click", function () {
                const url = scInlineLinkInput.value.trim();
                restoreSelection();

                if (!url) {
                    document.execCommand("unlink", false, null);
                } else {
                    document.execCommand("createLink", false, url);
                    // Ensure links have target blank
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const linkEl = getClosestParent(sel.getRangeAt(0).commonAncestorContainer, "a");
                        if (linkEl) {
                            linkEl.setAttribute("target", "_blank");
                            linkEl.setAttribute("rel", "noopener noreferrer");
                        }
                    }
                }

                if (scLinkPopover) scLinkPopover.style.display = "none";
                updateInlineButtonStates();
                triggerAutosave();
                updateLivePreview();
            });
        }

        if (scBtnUnlink) {
            scBtnUnlink.addEventListener("click", function () {
                restoreSelection();
                document.execCommand("unlink", false, null);
                if (scLinkPopover) scLinkPopover.style.display = "none";
                updateInlineButtonStates();
                triggerAutosave();
                updateLivePreview();
            });
        }

        // ==================================================================
        // 4. BLOCK HANDLE (6-DOTS ⋮⋮) & FLOATING ACTION MENU (#scBlockActionMenu)
        // ==================================================================
        function getTopLevelEditorBlock(target) {
            let curr = target;
            while (curr && curr.parentNode !== editorCanvas) {
                curr = curr.parentNode;
                if (!curr || curr === document.body) return null;
            }
            return curr;
        }

        if (editorCanvas && scBlockHandle) {
            editorCanvas.addEventListener("mousemove", function (e) {
                if (currentMode !== "wysiwyg") return;
                const block = getTopLevelEditorBlock(e.target);
                if (!block) return;

                if (hideHandleTimeout) clearTimeout(hideHandleTimeout);
                currentActiveBlock = block;

                const blockRect = block.getBoundingClientRect();
                const canvasRect = editorCanvas.getBoundingClientRect();

                scBlockHandle.style.top = (blockRect.top - canvasRect.top + editorCanvas.offsetTop + 4) + "px";
                scBlockHandle.style.left = (editorCanvas.offsetLeft - 34) + "px";
                scBlockHandle.style.display = "flex";
            });

            editorCanvas.addEventListener("mouseleave", function (e) {
                hideHandleTimeout = setTimeout(function () {
                    if (!scBlockActionMenu || scBlockActionMenu.style.display !== "flex") {
                        scBlockHandle.style.display = "none";
                    }
                }, 350);
            });

            scBlockHandle.addEventListener("mouseenter", function () {
                if (hideHandleTimeout) clearTimeout(hideHandleTimeout);
            });
        }

        if (scHandleTrigger && scBlockActionMenu) {
            scHandleTrigger.addEventListener("click", function (e) {
                e.stopPropagation();
                if (scBlockActionMenu.style.display === "flex") {
                    scBlockActionMenu.style.display = "none";
                    return;
                }

                const handleTop = parseInt(scBlockHandle.style.top, 10) || 0;
                const handleLeft = parseInt(scBlockHandle.style.left, 10) || 0;

                scBlockActionMenu.style.top = (handleTop + 30) + "px";
                scBlockActionMenu.style.left = handleLeft + "px";
                scBlockActionMenu.style.display = "flex";
            });

            document.addEventListener("click", function (e) {
                if (scBlockActionMenu && !scBlockActionMenu.contains(e.target) && e.target !== scHandleTrigger) {
                    scBlockActionMenu.style.display = "none";
                }
            });

            scBlockActionMenu.addEventListener("click", function (e) {
                const item = e.target.closest(".sc-block-menu-item");
                if (!item || !currentActiveBlock) return;

                const action = item.getAttribute("data-action");
                const transform = item.getAttribute("data-transform");

                if (action === "block-move-up") {
                    if (currentActiveBlock.previousElementSibling) {
                        currentActiveBlock.parentNode.insertBefore(currentActiveBlock, currentActiveBlock.previousElementSibling);
                        showToast("↑ Блок перемещен вверх");
                    }
                } else if (action === "block-move-down") {
                    if (currentActiveBlock.nextElementSibling) {
                        currentActiveBlock.parentNode.insertBefore(currentActiveBlock.nextElementSibling, currentActiveBlock);
                        showToast("↓ Блок перемещен вниз");
                    }
                } else if (action === "block-duplicate") {
                    const clone = currentActiveBlock.cloneNode(true);
                    currentActiveBlock.after(clone);
                    showToast("⧉ Блок продублирован");
                } else if (action === "block-delete") {
                    currentActiveBlock.remove();
                    if (!editorCanvas.innerHTML.trim()) {
                        editorCanvas.innerHTML = "<p><br></p>";
                    }
                    showToast("🗑 Блок удален");
                } else if (transform) {
                    transformBlock(currentActiveBlock, transform);
                }

                scBlockActionMenu.style.display = "none";
                updateCounters();
                triggerAutosave();
                updateLivePreview();
            });
        }

        function transformBlock(block, type) {
            const content = block.innerHTML;
            const textOnly = block.innerText.trim();
            let newEl;

            if (type === "p") {
                newEl = document.createElement("p");
                newEl.innerHTML = content || "<br>";
            } else if (type === "h2") {
                newEl = document.createElement("h2");
                newEl.innerHTML = textOnly || "Заголовок H2";
            } else if (type === "h3") {
                newEl = document.createElement("h3");
                newEl.innerHTML = textOnly || "Заголовок H3";
            } else if (type === "quote") {
                newEl = document.createElement("blockquote");
                newEl.className = "habr-quote";
                newEl.innerHTML = `<p>${content || textOnly}</p><cite class="habr-quote-author">— Цитата</cite>`;
            } else if (type === "code") {
                newEl = document.createElement("div");
                newEl.className = "habr-code-snippet";
                newEl.setAttribute("data-lang", "solidity");
                newEl.innerHTML = `
                    <div class="code-snippet-header">
                        <span class="code-snippet-lang">SOLIDITY</span>
                        <button type="button" class="btn-copy-snippet" onclick="navigator.clipboard.writeText(this.closest('.habr-code-snippet').querySelector('code').textContent)">Скопировать</button>
                    </div>
                    <pre class="code-pre"><code class="language-solidity">${escapeHtml(textOnly || '// code snippet')}</code></pre>
                `;
            } else if (type === "callout") {
                newEl = document.createElement("div");
                newEl.className = "habr-callout callout-info";
                newEl.innerHTML = `<p>${content || textOnly}</p>`;
            }

            if (newEl) {
                block.parentNode.replaceChild(newEl, block);
                showToast(`✓ Блок преобразован в ${type.toUpperCase()}`);
            }
        }

        // ==================================================================
        // 5. TABLE INTERACTIVE QUICK CONTROLS (#scTableQuickToolbar)
        // ==================================================================
        if (editorCanvas && scTableQuickToolbar) {
            editorCanvas.addEventListener("click", function (e) {
                const table = e.target.closest("table");
                if (table) {
                    currentActiveTable = table;
                    currentActiveTableCell = e.target.closest("td, th");

                    const tableRect = table.getBoundingClientRect();
                    const canvasRect = editorCanvas.getBoundingClientRect();

                    scTableQuickToolbar.style.top = (tableRect.top - canvasRect.top + editorCanvas.offsetTop - 42) + "px";
                    scTableQuickToolbar.style.left = (tableRect.left - canvasRect.left + editorCanvas.offsetLeft) + "px";
                    scTableQuickToolbar.style.display = "flex";

                    // Sync checkboxes
                    if (tableQuickToggleHeader) {
                        tableQuickToggleHeader.checked = !!table.querySelector("thead");
                    }
                    if (tableQuickToggleZebra) {
                        tableQuickToggleZebra.checked = table.classList.contains("table-striped");
                    }
                } else if (!scTableQuickToolbar.contains(e.target)) {
                    scTableQuickToolbar.style.display = "none";
                }
            });
        }

        // Table Header Toggle
        if (tableQuickToggleHeader) {
            tableQuickToggleHeader.addEventListener("change", function () {
                if (!currentActiveTable) return;
                const thead = currentActiveTable.querySelector("thead");
                const tbody = currentActiveTable.querySelector("tbody") || currentActiveTable;

                if (this.checked && !thead) {
                    // Turn first row into header
                    const firstRow = tbody.querySelector("tr");
                    if (firstRow) {
                        const newThead = document.createElement("thead");
                        const newTr = document.createElement("tr");
                        Array.from(firstRow.children).forEach(td => {
                            const th = document.createElement("th");
                            th.innerHTML = td.innerHTML || "Заголовок";
                            newTr.appendChild(th);
                        });
                        newThead.appendChild(newTr);
                        currentActiveTable.insertBefore(newThead, tbody);
                        firstRow.remove();
                    }
                } else if (!this.checked && thead) {
                    // Convert header into regular row
                    const headerRow = thead.querySelector("tr");
                    if (headerRow) {
                        const newTr = document.createElement("tr");
                        Array.from(headerRow.children).forEach(th => {
                            const td = document.createElement("td");
                            td.innerHTML = th.innerHTML;
                            newTr.appendChild(td);
                        });
                        tbody.insertBefore(newTr, tbody.firstChild);
                    }
                    thead.remove();
                }
                triggerAutosave();
                updateLivePreview();
            });
        }

        // Table Zebra Toggle
        if (tableQuickToggleZebra) {
            tableQuickToggleZebra.addEventListener("change", function () {
                if (!currentActiveTable) return;
                currentActiveTable.classList.toggle("table-striped", this.checked);
                triggerAutosave();
                updateLivePreview();
            });
        }

        // Add Row
        if (tableQuickBtnAddRow) {
            tableQuickBtnAddRow.addEventListener("click", function () {
                if (!currentActiveTable) return;
                const tbody = currentActiveTable.querySelector("tbody") || currentActiveTable;
                const rows = currentActiveTable.querySelectorAll("tr");
                const colCount = rows.length > 0 ? rows[0].children.length : 3;

                const newTr = document.createElement("tr");
                for (let i = 1; i <= colCount; i++) {
                    const td = document.createElement("td");
                    td.textContent = `Ячейка ${tbody.children.length + 1}.${i}`;
                    newTr.appendChild(td);
                }
                tbody.appendChild(newTr);
                triggerAutosave();
                updateLivePreview();
                showToast("+ Строка добавлена");
            });
        }

        // Delete Row
        if (tableQuickBtnDelRow) {
            tableQuickBtnDelRow.addEventListener("click", function () {
                if (!currentActiveTable) return;
                let targetRow = currentActiveTableCell ? currentActiveTableCell.closest("tr") : null;
                const tbody = currentActiveTable.querySelector("tbody") || currentActiveTable;

                if (!targetRow || !tbody.contains(targetRow)) {
                    targetRow = tbody.querySelector("tr:last-child");
                }

                if (targetRow) {
                    targetRow.remove();
                    triggerAutosave();
                    updateLivePreview();
                    showToast("- Строка удалена");
                }
            });
        }

        // Add Column
        if (tableQuickBtnAddCol) {
            tableQuickBtnAddCol.addEventListener("click", function () {
                if (!currentActiveTable) return;
                const theadTr = currentActiveTable.querySelector("thead tr");
                if (theadTr) {
                    const th = document.createElement("th");
                    th.textContent = `Колонка ${theadTr.children.length + 1}`;
                    theadTr.appendChild(th);
                }

                const tbodyRows = currentActiveTable.querySelectorAll("tbody tr");
                tbodyRows.forEach((tr, rIdx) => {
                    const td = document.createElement("td");
                    td.textContent = `Ячейка ${rIdx + 1}.${tr.children.length + 1}`;
                    tr.appendChild(td);
                });

                triggerAutosave();
                updateLivePreview();
                showToast("+ Колонка добавлена");
            });
        }

        // Delete Column
        if (tableQuickBtnDelCol) {
            tableQuickBtnDelCol.addEventListener("click", function () {
                if (!currentActiveTable) return;
                let colIndex = currentActiveTableCell ? currentActiveTableCell.cellIndex : -1;

                const allRows = currentActiveTable.querySelectorAll("tr");
                if (allRows.length === 0) return;

                if (colIndex === -1) {
                    colIndex = allRows[0].children.length - 1;
                }

                allRows.forEach(tr => {
                    if (tr.children[colIndex]) {
                        tr.children[colIndex].remove();
                    }
                });

                triggerAutosave();
                updateLivePreview();
                showToast("- Колонка удалена");
            });
        }

        // Delete Table
        if (tableQuickBtnDeleteTable) {
            tableQuickBtnDeleteTable.addEventListener("click", function () {
                if (!currentActiveTable) return;
                const wrapper = currentActiveTable.closest(".habr-table-wrapper") || currentActiveTable;
                wrapper.remove();
                scTableQuickToolbar.style.display = "none";
                currentActiveTable = null;
                triggerAutosave();
                updateLivePreview();
                showToast("🗑 Таблица удалена");
            });
        }

        // ==================================================================
        // 6. SEGMENTED VIEW SWITCHER ([✎ Редактор] [👁 Предпросмотр] [◫ Сплит])
        // ==================================================================
        function setViewMode(view) {
            currentView = view;

            // Update segmented nav active class
            if (btnViewEditor) btnViewEditor.classList.toggle("is-active", view === "editor");
            if (btnViewPreview) btnViewPreview.classList.toggle("is-active", view === "preview");
            if (btnViewSplit) btnViewSplit.classList.toggle("is-active", view === "split");

            // Reset step visibility
            if (view === "editor") {
                editorMainGrid.classList.remove("is-split-view");
                editorStepText.style.display = "block";
                editorStepSettings.style.display = "none";
                editorStepPreview.style.display = "none";
                editorSplitPreviewPane.style.display = "none";
                if (editorSidebar) editorSidebar.style.display = "flex";
            } else if (view === "preview") {
                editorMainGrid.classList.remove("is-split-view");
                editorStepText.style.display = "none";
                editorStepSettings.style.display = "none";
                editorStepPreview.style.display = "block";
                editorSplitPreviewPane.style.display = "none";
                if (editorSidebar) editorSidebar.style.display = "none";
                updateLivePreview();
            } else if (view === "split") {
                editorMainGrid.classList.add("is-split-view");
                editorStepText.style.display = "block";
                editorStepSettings.style.display = "none";
                editorStepPreview.style.display = "none";
                editorSplitPreviewPane.style.display = "block";
                if (editorSidebar) editorSidebar.style.display = "none";
                updateLivePreview();
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (btnViewEditor) btnViewEditor.addEventListener("click", () => setViewMode("editor"));
        if (btnViewPreview) btnViewPreview.addEventListener("click", () => setViewMode("preview"));
        if (btnViewSplit) btnViewSplit.addEventListener("click", () => setViewMode("split"));
        if (btnBackFromPreview) btnBackFromPreview.addEventListener("click", () => setViewMode("editor"));

        // ==================================================================
        // 7. LIVE PREVIEW GENERATOR (Real-Time Typography & Components)
        // ==================================================================
        function updateLivePreview() {
            const title = (titleInput ? titleInput.value.trim() : "") || "Заголовок публикации";
            
            // Hub / Category
            const selectedHubRadio = publicationForm ? publicationForm.querySelector("input[name='category_slug']:checked") : null;
            let hubTitle = "💻 Разработка смарт-контрактов";
            if (selectedHubRadio) {
                const parentChip = selectedHubRadio.closest(".hub-chip");
                if (parentChip) {
                    const textEl = parentChip.querySelector(".chip-title");
                    if (textEl) hubTitle = textEl.textContent.trim();
                }
            }

            // Role
            const role = authorRoleSelect ? authorRoleSelect.value : "Разработчик";

            // Body HTML
            let bodyHtml = "";
            if (currentMode === "wysiwyg") {
                bodyHtml = editorCanvas ? editorCanvas.innerHTML : "";
            } else {
                bodyHtml = convertMarkdownToHtml(rawMarkdown ? rawMarkdown.value : "");
            }

            if (!bodyHtml.trim()) {
                bodyHtml = "<p>Введите текст статьи в редакторе...</p>";
            }

            // Tags
            const rawTags = tagsInput ? tagsInput.value.split(",").map(s => s.trim()).filter(Boolean) : [];
            const tagsHtml = rawTags.map(t => `<span class="preview-tag-chip">#${escapeHtml(t)}</span>`).join(" ");

            // Reading Time
            const plainText = (currentMode === "wysiwyg" ? (editorCanvas ? editorCanvas.innerText : "") : (rawMarkdown ? rawMarkdown.value : "")) || "";
            const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
            const readMinutes = Math.max(1, Math.ceil(words / 180));
            const readTimeText = `${readMinutes} мин чтения`;

            // Render to Step 3 Full Preview
            if (previewArticleTitle) previewArticleTitle.textContent = title;
            if (previewHubBadge) previewHubBadge.textContent = hubTitle;
            if (previewReadTime) previewReadTime.textContent = readTimeText;
            if (previewAuthorRole) previewAuthorRole.textContent = role;
            if (previewArticleBody) previewArticleBody.innerHTML = bodyHtml;
            if (previewTagsList) previewTagsList.innerHTML = tagsHtml || '<span class="preview-tag-chip">#СмартКонтракты</span>';
            if (previewPublicationDate) {
                const now = new Date();
                previewPublicationDate.textContent = `Сегодня в ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            }

            // Render to Split View Right Pane
            if (splitArticleTitle) splitArticleTitle.textContent = title;
            if (splitHubBadge) splitHubBadge.textContent = hubTitle;
            if (splitReadTime) splitReadTime.textContent = readTimeText;
            if (splitAuthorRole) splitAuthorRole.textContent = role;
            if (splitArticleBody) splitArticleBody.innerHTML = bodyHtml;
            if (splitTagsList) splitTagsList.innerHTML = tagsHtml || '<span class="preview-tag-chip">#СмартКонтракты</span>';
        }

        function convertMarkdownToHtml(md) {
            if (!md) return "";
            return md
                .replace(/### (.*?)\n/g, '<h3>$1</h3>')
                .replace(/## (.*?)\n/g, '<h2>$1</h2>')
                .replace(/> (.*?)\n/g, '<blockquote class="habr-quote"><p>$1</p></blockquote>')
                .replace(/---/g, '<hr class="habr-divider">')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
        }

        // ==================================================================
        // 8. ALL 12 RICH BLOCK INSERTION HANDLERS
        // ==================================================================

        // 8.1 Video Embed Parser (YouTube, Vimeo, VK Video, Rutube)
        function parseVideoEmbedUrl(url) {
            if (!url) return null;
            url = url.trim();

            // YouTube
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

        // 8.2 Image Insertion (URL + File Picker)
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

        // 8.3 Interactive Table Generator
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

        // 8.4 Code Snippet with Language Switcher
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

        // 8.5 LaTeX Formula Insertion
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

        // 8.6 Spoiler Insertion
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

        // 8.7 Anchor Insertion
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

        // 8.8 Quote Block Insertion
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

        // 8.9 Divider Insertion
        function insertDividerRule() {
            insertHtmlAtCursor('<hr class="habr-divider"><p><br></p>');
            showToast("— Разделитель добавлен!");
        }

        // ==================================================================
        // 9. MODAL CONTROLLERS & CLOSERS
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
        // 10. FORMAT TOOLBAR DISPATCHER
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
                    updateLivePreview();
                }
            });
        }

        // ==================================================================
        // 11. SLASH ("/") POPUP MENU TRIGGER
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

                if (action === "insert-h2") { document.execCommand("formatBlock", false, "h2"); }
                else if (action === "insert-h3") { document.execCommand("formatBlock", false, "h3"); }
                else if (action === "insert-quote") { insertQuoteBlock(); }
                else if (action === "insert-ul") { document.execCommand("insertUnorderedList"); }
                else if (action === "insert-ol") { document.execCommand("insertOrderedList"); }
                else if (action === "open-video-modal") { openModal(modalVideo); }
                else if (action === "open-image-modal") { openModal(modalImage); }
                else if (action === "open-table-modal") { openModal(modalTable); }
                else if (action === "open-code-modal") { openModal(modalCode); }
                else if (action === "open-formula-modal") { openModal(modalFormula); }
                else if (action === "open-spoiler-modal") { openModal(modalSpoiler); }
                else if (action === "open-anchor-modal") { openModal(modalAnchor); }
                else if (action === "insert-divider") { insertDividerRule(); }

                updateCounters();
                triggerAutosave();
                updateLivePreview();
            });
        }

        // ==================================================================
        // 12. TYPOGRAPHER ENGINE (Кавычки «», тире —, неразрывные пробелы)
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
            updateLivePreview();
        }

        if (btnApplyTypografSidebar) btnApplyTypografSidebar.addEventListener("click", applyTypografToAll);
        if (btnApplyTypografInline) btnApplyTypografInline.addEventListener("click", applyTypografToAll);

        // ==================================================================
        // 13. WYSIWYG / MARKDOWN MODE SWITCHER
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
                let html = convertMarkdownToHtml(mdContent);
                
                editorCanvas.innerHTML = '<p>' + html + '</p>';
                rawMarkdown.style.display = "none";
                editorCanvas.style.display = "block";
                editorCanvas.focus();
            }
            updateCounters();
            updateLivePreview();
        }

        if (btnModeWysiwyg) btnModeWysiwyg.addEventListener("click", () => setEditorMode("wysiwyg"));
        if (btnModeMarkdown) btnModeMarkdown.addEventListener("click", () => setEditorMode("markdown"));

        // ==================================================================
        // 14. COUNTERS, AUTOSAVE & SERVER DRAFT API SYNC
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
                updateLivePreview();
            });
        }

        if (editorCanvas) {
            editorCanvas.addEventListener("input", function () {
                updateCounters();
                triggerAutosave();
                updateLivePreview();
            });
        }

        if (rawMarkdown) {
            rawMarkdown.addEventListener("input", function () {
                updateCounters();
                triggerAutosave();
                updateLivePreview();
            });
        }

        function triggerAutosave() {
            if (draftStatusText) draftStatusText.textContent = "Сохранение...";
            if (saveTimeout) clearTimeout(saveTimeout);

            saveTimeout = setTimeout(async function () {
                const selectedCategory = publicationForm ? publicationForm.querySelector("input[name='category_slug']:checked") : null;
                const category_slug = selectedCategory ? selectedCategory.value : "smart-contracts";
                const role = authorRoleSelect ? authorRoleSelect.value : "Разработчик";
                const tags = tagsInput ? tagsInput.value.split(",").map(s => s.trim()).filter(Boolean) : [];
                const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const draftData = {
                    title: titleInput ? titleInput.value : "",
                    body: currentMode === "wysiwyg" ? (editorCanvas ? editorCanvas.innerHTML : "") : (rawMarkdown ? rawMarkdown.value : ""),
                    bodyHtml: editorCanvas ? editorCanvas.innerHTML : "",
                    bodyMd: rawMarkdown ? rawMarkdown.value : "",
                    category_slug: category_slug,
                    hubs: [category_slug],
                    tags: tags,
                    author_role: role,
                    mode: currentMode,
                    timestamp: timeStr
                };

                // 1. LocalStorage persist
                try {
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
                } catch (e) {
                    console.error("LocalStorage save error:", e);
                }

                // 2. Server Draft API Sync (POST /api/v1/forum/drafts)
                try {
                    const response = await fetch("/api/v1/forum/drafts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: draftData.title,
                            body: draftData.body,
                            category_slug: draftData.category_slug,
                            hubs: draftData.hubs,
                            tags: draftData.tags,
                            author_role: draftData.author_role,
                            timestamp: draftData.timestamp
                        })
                    });

                    if (response.ok) {
                        if (draftStatusText) {
                            draftStatusText.textContent = `Сохранено на сервере (${timeStr})`;
                        }
                    } else {
                        if (draftStatusText) {
                            draftStatusText.textContent = `Сохранено локально (${timeStr})`;
                        }
                    }
                } catch (err) {
                    if (draftStatusText) {
                        draftStatusText.textContent = `Сохранено локально (${timeStr})`;
                    }
                }
            }, 800);
        }

        async function restoreDraft() {
            // 1. Try Server Draft API first (GET /api/v1/forum/drafts)
            try {
                const response = await fetch("/api/v1/forum/drafts");
                if (response.ok) {
                    const res = await response.json();
                    if (res.has_draft && res.draft) {
                        applyDraftData(res.draft);
                        if (draftStatusText) {
                            draftStatusText.textContent = `Восстановлен черновик сервера (${res.draft.timestamp || 'ранее'})`;
                        }
                        return;
                    }
                }
            } catch (err) {
                console.warn("Could not fetch server draft, trying localStorage fallback:", err);
            }

            // 2. Fallback to localStorage
            try {
                const saved = localStorage.getItem(DRAFT_KEY);
                if (!saved) return;
                const draft = JSON.parse(saved);
                applyDraftData(draft);
                if (draftStatusText && draft.timestamp) {
                    draftStatusText.textContent = `Сохранено в черновиках (${draft.timestamp})`;
                }
            } catch (e) {
                console.error("Draft restore error:", e);
            }
        }

        function applyDraftData(draft) {
            if (draft.title && titleInput) {
                titleInput.value = draft.title;
                titleInput.style.height = "auto";
                titleInput.style.height = (titleInput.scrollHeight) + "px";
            }

            const bodyContent = draft.bodyHtml || draft.body || "";
            if (bodyContent && editorCanvas) {
                editorCanvas.innerHTML = bodyContent;
            }

            if (draft.bodyMd && rawMarkdown) {
                rawMarkdown.value = draft.bodyMd;
            }

            if (draft.tags) {
                if (Array.isArray(draft.tags)) {
                    if (tagsInput) tagsInput.value = draft.tags.join(", ");
                } else if (tagsInput) {
                    tagsInput.value = draft.tags;
                }
            }

            if (draft.category_slug && publicationForm) {
                const radio = publicationForm.querySelector(`input[name='category_slug'][value='${draft.category_slug}']`);
                if (radio) {
                    radio.checked = true;
                    document.querySelectorAll(".hub-chip").forEach(c => c.classList.remove("is-selected"));
                    const parent = radio.closest(".hub-chip");
                    if (parent) parent.classList.add("is-selected");
                }
            }

            if (draft.author_role && authorRoleSelect) {
                authorRoleSelect.value = draft.author_role;
            }

            updateCounters();
            updateLivePreview();
        }

        restoreDraft();

        // ==================================================================
        // 15. STEP 1 <-> STEP 2 TRANSITIONS & PUBLICATION
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
                    updateLivePreview();
                }
            });
        });

        // Hub chip radio styling & sync
        document.querySelectorAll(".hub-chip input[type='radio']").forEach(function (radio) {
            radio.addEventListener("change", function () {
                document.querySelectorAll(".hub-chip").forEach(c => c.classList.remove("is-selected"));
                const parent = radio.closest(".hub-chip");
                if (parent) parent.classList.add("is-selected");
                triggerAutosave();
                updateLivePreview();
            });
        });

        if (authorRoleSelect) {
            authorRoleSelect.addEventListener("change", function () {
                triggerAutosave();
                updateLivePreview();
            });
        }

        // Publication Form Submit
        if (publicationForm) {
            publicationForm.addEventListener("submit", async function (e) {
                e.preventDefault();

                const title = (titleInput ? titleInput.value : "").trim();
                let body = (currentMode === "wysiwyg" ? (editorCanvas ? editorCanvas.innerHTML : "") : (rawMarkdown ? rawMarkdown.value : "")).trim();

                const selectedCategory = publicationForm.querySelector("input[name='category_slug']:checked");
                const category_slug = selectedCategory ? selectedCategory.value : "smart-contracts";
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
                    
                    // Clear Local and Server Draft
                    localStorage.removeItem(DRAFT_KEY);
                    try {
                        await fetch("/api/v1/forum/drafts", { method: "DELETE" });
                    } catch (e) {
                        console.warn("Could not delete server draft:", e);
                    }

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

        // ==================================================================
        // 16. UTILITY HELPERS
        // ==================================================================
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
