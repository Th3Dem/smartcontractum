/**
 * SmartContractum — Block 3 Passport Wizard & Decision Tree Client Controller
 * Async Tree Generation, Markdown Exporter & Clipboard Synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
    const wizardForm = document.getElementById('passportWizardForm');
    const alertBox = document.getElementById('wizardAlertBox');
    const treeDisplay = document.getElementById('decisionTreeDisplay');
    const codeDisplay = document.getElementById('displayPassportCode');
    const btnSubmit = document.getElementById('btnGeneratePassport');
    const spinner = document.getElementById('genSpinner');
    const btnDownload = document.getElementById('btnDownloadMarkdown');
    const btnCopy = document.getElementById('btnCopyTree');

    // In-memory state for exported markdown
    let currentPassportCode = codeDisplay ? codeDisplay.textContent.trim() : 'SC-2026-PKSC-DEMO';
    let currentMarkdownContent = '';

    // ==================================================================
    // 1. WIZARD FORM SUBMISSION (AJAX GENERATE TREE)
    // ==================================================================

    if (wizardForm) {
        wizardForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('inputTitle').value.trim();
            const parties = document.getElementById('inputParties').value.trim();
            const trigger_event = document.getElementById('inputTrigger').value.trim();
            const exception_flow = document.getElementById('inputExceptions').value.trim();
            const data_source_type = document.getElementById('selectDataSource').value;
            const success_action = document.getElementById('inputSuccessAction').value.trim();

            if (title.length < 5 || parties.length < 5 || trigger_event.length < 5 || exception_flow.length < 5) {
                showAlert('Пожалуйста, заполните все обязательные поля (минимум 5 символов).', 'error');
                return;
            }

            const payload = {
                title,
                parties,
                trigger_event,
                exception_flow,
                data_source_type,
                success_action,
            };

            // Loading state
            if (btnSubmit) btnSubmit.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';

            try {
                const response = await fetch('/api/v1/passport/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.detail
                        ? (Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(', ') : data.detail)
                        : 'Ошибка генерации паспорта.';
                    showAlert(`Ошибка: ${errorMsg}`, 'error');
                    return;
                }

                // Update UI with generated Tree and Code
                currentPassportCode = data.passport_code;
                currentMarkdownContent = data.full_passport_markdown;

                if (codeDisplay) codeDisplay.textContent = data.passport_code;
                if (treeDisplay) {
                    treeDisplay.textContent = data.decision_tree_text;
                    // Pulse animation
                    treeDisplay.parentElement.style.animation = 'none';
                    setTimeout(() => {
                        treeDisplay.parentElement.style.animation = 'fadeIn 0.4s ease-out';
                    }, 10);
                }

                showAlert('✅ Паспорт и «Дерево решений» успешно сформированы!', 'success');

            } catch (err) {
                console.error(err);
                showAlert('Сетевая ошибка при генерации. Проверьте соединение.', 'error');
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
                if (spinner) spinner.style.display = 'none';
            }
        });
    }

    // ==================================================================
    // 2. CLIENT-SIDE MARKDOWN EXPORTER (.MD DOWNLOAD)
    // ==================================================================

    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const content = currentMarkdownContent || (
                `# 📑 ПАСПОРТ СМАРТ-КОНТРАКТА ПКСК: ${currentPassportCode}\n\n` +
                `\`\`\`text\n${treeDisplay ? treeDisplay.textContent : ''}\n\`\`\`\n`
            );

            const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `passport-${currentPassportCode.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showAlert('📥 Файл паспорта смарт-контракта (.md) успешно сохранен.', 'success');
        });
    }

    // ==================================================================
    // 3. COPY TO CLIPBOARD
    // ==================================================================

    if (btnCopy && treeDisplay) {
        btnCopy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(treeDisplay.textContent);
                const origText = btnCopy.textContent;
                btnCopy.textContent = '✓ Скопировано!';
                btnCopy.style.color = '#10b981';
                setTimeout(() => {
                    btnCopy.textContent = origText;
                    btnCopy.style.color = '';
                }, 2000);
            } catch (err) {
                showAlert('Не удалось скопировать в буфер обмена.', 'error');
            }
        });
    }

    function showAlert(msg, type = 'error') {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.className = `wizard-alert-box alert-${type}`;
        alertBox.style.display = 'block';
    }
});
