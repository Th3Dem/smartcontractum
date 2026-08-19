/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * Dynamic Async Stats Fetcher, 3D Web3 Emblem Parallax & Card Interactions
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

    // 3. 3D Holographic Cube Parallax Tilt Interaction
    const heroWrapper = document.getElementById('hero3dWrapper');
    const cube = document.getElementById('crystal3dCube');

    if (heroWrapper && cube) {
        let isHovered = false;

        heroWrapper.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        heroWrapper.addEventListener('mouseleave', () => {
            isHovered = false;
            cube.style.transform = 'rotateX(-22deg) rotateY(35deg)';
        });

        heroWrapper.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            const rect = heroWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = -22 + (y / (rect.height / 2)) * -25;
            const rotateY = 35 + (x / (rect.width / 2)) * 35;

            cube.style.transform = `rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale(1.08)`;
        });
    }

    updateSystemStats();
});
