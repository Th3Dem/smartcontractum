/**
 * SmartContractum — Block 4 Low-Code Builder & 5-Step Audit Simulator Controller
 * Interactive Node Flow & Step-by-Step Security Pipeline Animation
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btnStartAuditSimulation');
    const spinner = document.getElementById('auditSpinner');
    const certBox = document.getElementById('auditCertificateBox');
    const certScore = document.getElementById('certScore');
    const certHash = document.getElementById('certHash');
    const btnReset = document.getElementById('btnResetCanvas');

    if (!btnStart) return;

    btnStart.addEventListener('click', async () => {
        btnStart.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (certBox) certBox.style.display = 'none';

        // Reset all 5 steps to initial state
        for (let i = 1; i <= 5; i++) {
            const item = document.getElementById(`stepItem${i}`);
            const badge = document.getElementById(`stepBadge${i}`);
            if (item) {
                item.className = 'audit-step-item';
                const icon = item.querySelector('.step-status-icon');
                if (icon) icon.textContent = '⚪';
            }
            if (badge) {
                badge.className = 'step-badge';
                badge.textContent = 'В очереди';
            }
        }

        try {
            const response = await fetch('/api/v1/builder/simulate-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_id: 'SC-2026-PKSC-0042',
                    scenario_title: 'Инициация платежа по договору №409-АПК'
                })
            });

            const data = await response.json();

            // Run step-by-step 650ms animation pipeline
            const totalSteps = 5;
            for (let step = 1; step <= totalSteps; step++) {
                const item = document.getElementById(`stepItem${step}`);
                const badge = document.getElementById(`stepBadge${step}`);

                // 1. In-Progress phase
                if (item) {
                    item.className = 'audit-step-item step-in-progress';
                    const icon = item.querySelector('.step-status-icon');
                    if (icon) icon.textContent = '⏳';
                }
                if (badge) {
                    badge.className = 'step-badge badge-in-progress';
                    badge.textContent = 'Проверка...';
                }

                // Wait 650ms per step
                await new Promise(r => setTimeout(r, 650));

                // 2. Completed phase
                if (item) {
                    item.className = 'audit-step-item step-completed';
                    const icon = item.querySelector('.step-status-icon');
                    if (icon) icon.textContent = '✅';
                }
                if (badge) {
                    badge.className = 'step-badge badge-completed';
                    badge.textContent = 'Пройден';
                }
            }

            // All steps complete: Reveal Certificate
            if (certBox) {
                certBox.style.display = 'flex';
                if (certScore) certScore.textContent = data.overall_score || 'A+ (Compliant)';
                if (certHash) certHash.textContent = (data.sha256_hash || '').substring(0, 24) + '...';
            }

        } catch (err) {
            console.error('Audit simulation error:', err);
        } finally {
            btnStart.disabled = false;
            if (spinner) spinner.style.display = 'none';
        }
    });

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (certBox) certBox.style.display = 'none';
            for (let i = 1; i <= 5; i++) {
                const item = document.getElementById(`stepItem${i}`);
                const badge = document.getElementById(`stepBadge${i}`);
                if (item) {
                    item.className = 'audit-step-item';
                    const icon = item.querySelector('.step-status-icon');
                    if (icon) icon.textContent = '⚪';
                }
                if (badge) {
                    badge.className = 'step-badge';
                    badge.textContent = 'В очереди';
                }
            }
        });
    }
});
