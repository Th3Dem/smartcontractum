/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * Dynamic Async Stats Fetcher & Global Full-Viewport 3D Spatial Hologram Physics
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Asynchronous System Stats Fetcher
    async function updateSystemStats() {
        try {
            const response = await fetch('/api/v1/system/stats');
            if (!response.ok) return;

            const data = await response.json();
            const stats = data.stats || data;

            const elExperts = document.getElementById('statExpertsCount');
            const elPassports = document.getElementById('statPassportsCount');
            const elSources = document.getElementById('statSourcesCount');
            const elScenarios = document.getElementById('statScenariosCount');

            if (stats.experts_count !== undefined && elExperts) {
                elExperts.textContent = `${stats.experts_count.toLocaleString('ru-RU')}+`;
            } else if (stats.registered_experts !== undefined && elExperts) {
                elExperts.textContent = `${stats.registered_experts.toLocaleString('ru-RU')}+`;
            }

            if (stats.passports_count !== undefined && elPassports) {
                elPassports.textContent = stats.passports_count.toLocaleString('ru-RU');
            } else if (stats.generated_passports !== undefined && elPassports) {
                elPassports.textContent = stats.generated_passports.toLocaleString('ru-RU');
            }

            if (stats.data_sources_count !== undefined && elSources) {
                elSources.textContent = stats.data_sources_count.toLocaleString('ru-RU');
            } else if (stats.trusted_sources !== undefined && elSources) {
                elSources.textContent = stats.trusted_sources.toLocaleString('ru-RU');
            }

            if (stats.verified_scenarios_count !== undefined && elScenarios) {
                elScenarios.textContent = stats.verified_scenarios_count.toLocaleString('ru-RU');
            } else if (stats.verified_scenarios !== undefined && elScenarios) {
                elScenarios.textContent = stats.verified_scenarios.toLocaleString('ru-RU');
            }
        } catch (err) {
            console.debug('System stats live update offline fallback in effect.');
        }
    }

    // 2. Interactive Route Cards Click Analytics / Transition
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card) => {
        card.addEventListener('click', (e) => {
            const route = card.getAttribute('data-route');
            console.info(`Navigating to route intent: ${route}`);
        });
    });

    // 3. Global Full-Viewport 3D Spatial Hologram Physics & Mouse Tracking
    const cube = document.getElementById('crystal3dCube');
    const matrix = document.getElementById('hero3dBgMatrix');

    if (cube) {
        let targetRotX = -18;
        let targetRotY = 32;
        let currentRotX = -18;
        let currentRotY = 32;
        let targetTransX = 0;
        let targetTransY = 0;
        let currentTransX = 0;
        let currentTransY = 0;

        // Base Idle Animation Phase
        let idleClock = 0;

        function onPointerMove(clientX, clientY) {
            const normX = (clientX / window.innerWidth - 0.5) * 2;   // -1.0 to 1.0
            const normY = (clientY / window.innerHeight - 0.5) * 2;  // -1.0 to 1.0

            targetRotX = -18 - normY * 34;
            targetRotY = 32 + normX * 48;
            targetTransX = normX * 28;
            targetTransY = normY * 18;
        }

        // Global Mouse Move Listener across ENTIRE Screen
        window.addEventListener('mousemove', (e) => {
            onPointerMove(e.clientX, e.clientY);
        }, { passive: true });

        // Touch Tracking for Mobile & Tablets
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Smooth Lerp Animation Loop (60 FPS)
        function render3DPhysics() {
            idleClock += 0.02;
            const idleOffset = Math.sin(idleClock) * 5;

            // Damping Linear Interpolation (Lerp)
            currentRotX += (targetRotX - currentRotX) * 0.06;
            currentRotY += (targetRotY - currentRotY) * 0.06;
            currentTransX += (targetTransX - currentTransX) * 0.05;
            currentTransY += (targetTransY - currentTransY) * 0.05;

            // Apply 3D matrix transform to cube
            cube.style.transform = `translate3d(${currentTransX.toFixed(2)}px, ${(currentTransY + idleOffset).toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

            // Subtle parallax on background matrix container
            if (matrix) {
                matrix.style.transform = `translate(calc(-50% + ${(currentTransX * 0.35).toFixed(1)}px), calc(-50% + ${(currentTransY * 0.35).toFixed(1)}px))`;
            }

            requestAnimationFrame(render3DPhysics);
        }

        render3DPhysics();
    }

    updateSystemStats();
});
