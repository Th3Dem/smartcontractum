/**
 * SmartContractum — Block 6 Profile & Umbrella Workspace Controller
 * Dynamic Tabs, Financial Royalty Dashboard & Contract Proposal Modal Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-nav-btn');
    const tabPanels = {
        contracts: document.getElementById('tabContentContracts'),
        royalties: document.getElementById('tabContentRoyalties'),
        passports: document.getElementById('tabContentPassports'),
        settings: document.getElementById('tabContentSettings'),
    };

    const modalOverlay = document.getElementById('umbrellaModalOverlay');
    const btnOpenModal = document.getElementById('btnOpenUmbrellaModal');
    const btnCloseModal = document.getElementById('btnCloseUmbrellaModal');
    const btnCancelModal = document.getElementById('btnCancelUmbrella');
    const formSubmit = document.getElementById('umbrellaSubmitForm');
    const alertBox = document.getElementById('umbrellaAlertBox');
    const spinner = document.getElementById('umbrellaSpinner');
    const btnSubmitForm = document.getElementById('btnSubmitUmbrellaForm');
    const contractsTableBody = document.getElementById('contractsTableBody');

    // ==================================================================
    // 1. TAB SWITCHING CONTROLLER
    // ==================================================================
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const tabKey = btn.getAttribute('data-tab');
            Object.keys(tabPanels).forEach((k) => {
                if (tabPanels[k]) {
                    tabPanels[k].style.display = k === tabKey ? 'flex' : 'none';
                }
            });
        });
    });

    // ==================================================================
    // 2. MODAL DIALOG MANAGEMENT
    // ==================================================================
    if (btnOpenModal && modalOverlay) {
        btnOpenModal.addEventListener('click', () => {
            modalOverlay.style.display = 'flex';
            if (alertBox) alertBox.style.display = 'none';
        });
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.style.display = 'none';
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // ==================================================================
    // 3. UMBRELLA CONTRACT SUBMISSION (POST /api/v1/profile/umbrella/submit)
    // ==================================================================
    if (formSubmit) {
        formSubmit.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('inputContractTitle').value.trim();
            const version = document.getElementById('inputVersion').value.trim();
            const passport_code = document.getElementById('inputPassportCode').value.trim();
            const royalty_percent = parseFloat(document.getElementById('inputRoyalty').value);
            const agreed_terms = document.getElementById('checkAgreedTerms').checked;

            if (title.length < 5 || passport_code.length < 5) {
                showAlert('Заполните обязательные поля корректно (минимум 5 символов).', 'error');
                return;
            }

            if (isNaN(royalty_percent) || royalty_percent < 0.1 || royalty_percent > 50.0) {
                showAlert('Процент роялти должен быть в диапазоне от 0.1% до 50.0%.', 'error');
                return;
            }

            if (!agreed_terms) {
                showAlert('Необходимо согласие с условиями лицензионного договора.', 'error');
                return;
            }

            const payload = {
                title,
                version,
                passport_code,
                royalty_percent,
                agreed_terms,
            };

            if (btnSubmitForm) btnSubmitForm.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';

            try {
                const response = await fetch('/api/v1/profile/umbrella/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.detail
                        ? (Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(', ') : data.detail)
                        : 'Ошибка подачи контракта на публикацию.';
                    showAlert(`Ошибка: ${errorMsg}`, 'error');
                    return;
                }

                showAlert(`✅ Контракт принят! Код трекинга: ${data.tracking_code}`, 'success');

                // Prepend to table dynamically
                if (contractsTableBody) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="col-bold-title">${title}</td>
                        <td><span class="version-tag">${version}</span></td>
                        <td><code class="code-passport">${passport_code}</code></td>
                        <td class="text-emerald font-bold">${royalty_percent}%</td>
                        <td class="font-bold">0</td>
                        <td><span class="status-pill status-audit">🛡️ Пред-Аудит ИБ (Внутренний)</span></td>
                    `;
                    contractsTableBody.insertBefore(tr, contractsTableBody.firstChild);
                }

                formSubmit.reset();

                setTimeout(() => {
                    closeModal();
                }, 2000);

            } catch (err) {
                console.error(err);
                showAlert('Сетевая ошибка при отправке заявки.', 'error');
            } finally {
                if (btnSubmitForm) btnSubmitForm.disabled = false;
                if (spinner) spinner.style.display = 'none';
            }
        });
    }

    function showAlert(msg, type = 'error') {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.className = `umbrella-alert-box alert-${type}`;
        alertBox.style.display = 'block';
    }
});
