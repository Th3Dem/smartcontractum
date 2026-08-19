/**
 * SmartContractum — Block 5 Data Sources Marketplace & Oracle Hub Controller
 * Live Category Filtering & Supplier Proposal Modal Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    const filterTabs = document.querySelectorAll('.filter-tab-btn');
    const tableRows = document.querySelectorAll('.source-row');
    const modalOverlay = document.getElementById('suggestModalOverlay');
    const btnOpenModal = document.getElementById('btnOpenSuggestModal');
    const btnCloseModal = document.getElementById('btnCloseSuggestModal');
    const btnCancelModal = document.getElementById('btnCancelSuggest');
    const formSuggest = document.getElementById('suggestSourceForm');
    const alertBox = document.getElementById('suggestAlertBox');
    const spinner = document.getElementById('suggestSpinner');
    const btnSubmit = document.getElementById('btnSubmitSuggest');

    // ==================================================================
    // 1. CATEGORY TABS FILTERING
    // ==================================================================
    filterTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            filterTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.getAttribute('data-category');

            tableRows.forEach((row) => {
                const rowCat = row.getAttribute('data-category');
                if (category === 'all' || rowCat === category) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // ==================================================================
    // 2. MODAL DIALOG CONTROLLER
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
    // 3. SUGGESTION FORM SUBMISSION (POST /api/v1/data-sources/suggest)
    // ==================================================================
    if (formSuggest) {
        formSuggest.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('inputSourceName').value.trim();
            const cbr_category = document.getElementById('selectCbrCategory').value;
            const api_type = document.getElementById('selectApiType').value;
            const contact_email = document.getElementById('inputContactEmail').value.trim();
            const description = document.getElementById('inputDescription').value.trim();

            if (name.length < 3 || contact_email.length < 5 || description.length < 10) {
                showAlert('Пожалуйста, заполните все обязательные поля корректно.', 'error');
                return;
            }

            const payload = {
                name,
                cbr_category,
                api_type,
                contact_email,
                description,
            };

            if (btnSubmit) btnSubmit.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';

            try {
                const response = await fetch('/api/v1/data-sources/suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.detail
                        ? (Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(', ') : data.detail)
                        : 'Ошибка отправки заявки.';
                    showAlert(`Ошибка: ${errorMsg}`, 'error');
                    return;
                }

                showAlert(`✅ Заявка принята! Регистрационный ID: ${data.application_id}`, 'success');
                formSuggest.reset();

                setTimeout(() => {
                    closeModal();
                }, 2000);

            } catch (err) {
                console.error(err);
                showAlert('Сетевая ошибка при отправке заявки.', 'error');
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
                if (spinner) spinner.style.display = 'none';
            }
        });
    }

    function showAlert(msg, type = 'error') {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.className = `suggest-alert-box alert-${type}`;
        alertBox.style.display = 'block';
    }
});
