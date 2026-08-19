/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * High-Performance Lightweight 3D Physics Engine & GPU-Optimized Canvas
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

    // 2. Interactive Route Cards & Specialist Modal Controller
    const specialistModal = document.getElementById('specialistModal');
    const btnSpecialistTrigger = document.getElementById('btnSpecialistModalTrigger');
    const btnCloseSpecialist = document.getElementById('btnCloseSpecialistModal');

    function openSpecialistModal() {
        if (specialistModal) {
            specialistModal.classList.add('is-active');
            specialistModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSpecialistModal() {
        if (specialistModal) {
            specialistModal.classList.remove('is-active');
            specialistModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (btnSpecialistTrigger) {
        btnSpecialistTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openSpecialistModal();
        });
    }

    if (btnCloseSpecialist) {
        btnCloseSpecialist.addEventListener('click', closeSpecialistModal);
    }

    if (specialistModal) {
        specialistModal.addEventListener('click', (e) => {
            if (e.target === specialistModal) closeSpecialistModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && specialistModal && specialistModal.classList.contains('is-active')) {
            closeSpecialistModal();
        }
    });

    // Analytics event logger for all hero action routes
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach((card) => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-action-target') || card.getAttribute('data-route');
            const eventName = card.getAttribute('data-analytics-event') || 'hero_action_click';
            console.info(`[Analytics] Event: ${eventName}, Target: ${target}`);
        });
    });

    // 3. Performance State & Visibility Controller
    let isHeroVisible = true;
    const heroBanner = document.getElementById('heroBanner') || document.querySelector('.hero-3d-banner');

    if ('IntersectionObserver' in window && heroBanner) {
        const observer = new IntersectionObserver((entries) => {
            isHeroVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(heroBanner);
    }

    document.addEventListener('visibilitychange', () => {
        isHeroVisible = document.visibilityState === 'visible';
    });

    // 4. Lightweight 3D Spatial Hologram Physics & Mouse Tracking
    const cube = document.getElementById('crystal3dCube') || document.getElementById('cube3dObject');
    const matrix = document.getElementById('hero3dBgMatrix');

    let globalMouseX = window.innerWidth / 2;
    let globalMouseY = window.innerHeight / 2;

    let targetRotX = -18;
    let targetRotY = 32;
    let currentRotX = -18;
    let currentRotY = 32;
    let targetTransX = 0;
    let targetTransY = 0;
    let currentTransX = 0;
    let currentTransY = 0;
    let idleClock = 0;

    let pointerRafPending = false;

    function onPointerMove(clientX, clientY) {
        if (pointerRafPending) return;
        pointerRafPending = true;

        requestAnimationFrame(() => {
            globalMouseX = clientX;
            globalMouseY = clientY;

            const normX = (clientX / window.innerWidth - 0.5) * 2;
            const normY = (clientY / window.innerHeight - 0.5) * 2;

            targetRotX = -18 - normY * 30;
            targetRotY = 32 + normX * 42;
            targetTransX = normX * 14;
            targetTransY = normY * 10;
            pointerRafPending = false;
        });
    }

    window.addEventListener('mousemove', (e) => {
        onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    function render3DPhysics() {
        if (isHeroVisible) {
            idleClock += 0.02;
            const idleOffset = Math.sin(idleClock) * 3;

            // Smooth Lerp interpolation
            currentRotX += (targetRotX - currentRotX) * 0.08;
            currentRotY += (targetRotY - currentRotY) * 0.08;
            currentTransX += (targetTransX - currentTransX) * 0.07;
            currentTransY += (targetTransY - currentTransY) * 0.07;

            if (cube) {
                cube.style.transform = `translate3d(${currentTransX.toFixed(1)}px, ${(currentTransY + idleOffset).toFixed(1)}px, 0) rotateX(${currentRotX.toFixed(1)}deg) rotateY(${currentRotY.toFixed(1)}deg)`;
            }

            if (matrix) {
                matrix.style.transform = `translate(calc(-50% + ${(currentTransX * 0.3).toFixed(1)}px), calc(-50% + ${(currentTransY * 0.3).toFixed(1)}px))`;
            }
        }

        requestAnimationFrame(render3DPhysics);
    }

    if (cube || matrix) {
        render3DPhysics();
    }

    // 5. Ultra-Lightweight GPU Canvas Particle Engine (Zero shadowBlur overhead)
    const canvas = document.getElementById('cosmicShardsCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        let width = 0;
        let height = 0;
        let shards = [];
        const isMobile = window.innerWidth < 768;
        const SHARDS_COUNT = isMobile ? 16 : 28;

        const colorPalettes = [
            'rgba(56, 97, 251, ',   // CMC Blue
            'rgba(56, 189, 248, ',  // Electric Cyan
            'rgba(22, 199, 132, ',  // Mint
            'rgba(246, 184, 63, ',  // Gold
            'rgba(255, 255, 255, '  // White
        ];

        function resizeCanvas() {
            if (!heroBanner || !canvas) return;
            const rect = heroBanner.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width;
            canvas.height = height;
        }

        class FastCosmicShard {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = initial ? Math.random() * (width || 800) : (Math.random() > 0.5 ? 0 : width);
                this.y = Math.random() * (height || 500);
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 4 + 2;
                this.colorPrefix = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
                this.alpha = (Math.random() * 0.35 + 0.15).toFixed(2);
                this.angle = Math.random() * 6.28;
                this.angularVelocity = (Math.random() - 0.5) * 0.02;
                this.type = Math.floor(Math.random() * 2); // Diamond or Circle
            }

            update(localMouseX, localMouseY) {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.angularVelocity;

                // Ultra-fast squared distance check (avoids expensive Math.sqrt)
                const dx = localMouseX - this.x;
                const dy = localMouseY - this.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 28900 && distSq > 100) { // 170px radius
                    const invDist = 1 / Math.sqrt(distSq);
                    const force = (170 - (1 / invDist)) * 0.0004;
                    this.vx += dx * force;
                    this.vy += dy * force;
                }

                this.vx *= 0.985;
                this.vy *= 0.985;

                if (this.x < -15 || this.x > width + 15 || this.y < -15 || this.y > height + 15) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillStyle = this.colorPrefix + this.alpha + ')';

                ctx.beginPath();
                if (this.type === 0) {
                    // Optimized Fast Diamond
                    ctx.moveTo(0, -this.size);
                    ctx.lineTo(this.size * 0.65, 0);
                    ctx.lineTo(0, this.size);
                    ctx.lineTo(-this.size * 0.65, 0);
                } else {
                    // Fast Arc
                    ctx.arc(0, 0, this.size * 0.45, 0, 6.28);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        resizeCanvas();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 150);
        }, { passive: true });

        for (let i = 0; i < SHARDS_COUNT; i++) {
            shards.push(new FastCosmicShard());
        }

        function animateShards() {
            if (isHeroVisible && width > 0 && height > 0) {
                ctx.clearRect(0, 0, width, height);

                let localMouseX = globalMouseX;
                let localMouseY = globalMouseY;

                if (heroBanner) {
                    const rect = heroBanner.getBoundingClientRect();
                    localMouseX = globalMouseX - rect.left;
                    localMouseY = globalMouseY - rect.top;
                }

                for (let i = 0; i < shards.length; i++) {
                    shards[i].update(localMouseX, localMouseY);
                    shards[i].draw();
                }
            }

            requestAnimationFrame(animateShards);
        }

        animateShards();
    }

    // Initialize stats
    updateSystemStats();
});
