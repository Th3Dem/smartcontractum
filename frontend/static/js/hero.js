/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * Dynamic Async Stats Fetcher, Real-Time 3D Hologram Physics & Particle Engine
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

    // 3. Global 3D Spatial Hologram Physics & Mouse Tracking
    const cube = document.getElementById('crystal3dCube') || document.getElementById('cube3dObject');
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

    function onPointerMove(clientX, clientY) {
        globalMouseX = clientX;
        globalMouseY = clientY;

        const normX = (clientX / window.innerWidth - 0.5) * 2;   // -1.0 to 1.0
        const normY = (clientY / window.innerHeight - 0.5) * 2;  // -1.0 to 1.0

        targetRotX = -18 - normY * 38;
        targetRotY = 32 + normX * 52;
        targetTransX = normX * 18;
        targetTransY = normY * 12;
    }

    window.addEventListener('mousemove', (e) => {
        onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    if (cube) {
        function render3DPhysics() {
            idleClock += 0.025;
            const idleOffset = Math.sin(idleClock) * 4;

            // Smooth Lerp interpolation
            currentRotX += (targetRotX - currentRotX) * 0.08;
            currentRotY += (targetRotY - currentRotY) * 0.08;
            currentTransX += (targetTransX - currentTransX) * 0.07;
            currentTransY += (targetTransY - currentTransY) * 0.07;

            cube.style.transform = `translate3d(${currentTransX.toFixed(2)}px, ${(currentTransY + idleOffset).toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

            requestAnimationFrame(render3DPhysics);
        }

        render3DPhysics();
    }

    // 4. Interactive Cosmic Shards & Celestial Quantum Particle Engine
    const canvas = document.getElementById('cosmicShardsCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let shards = [];
        const SHARDS_COUNT = 55;

        const colors = [
            { r: 56, g: 97, b: 251 },   // CMC Royal Blue
            { r: 97, g: 136, b: 255 },  // Electric Cyan
            { r: 22, g: 199, b: 132 },  // Mint Green
            { r: 246, g: 184, b: 63 },  // Warm Gold
            { r: 255, g: 255, b: 255 }   // Pure White
        ];

        function resizeCanvas() {
            const heroBanner = document.getElementById('heroBanner') || document.querySelector('.hero-3d-banner');
            if (!heroBanner || !canvas) return;
            const rect = heroBanner.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        class CosmicShard {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = initial ? Math.random() * (width || 800) : (Math.random() > 0.5 ? 0 : width);
                this.y = Math.random() * (height || 500);
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 5 + 2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.5 + 0.2;
                this.angle = Math.random() * Math.PI * 2;
                this.angularVelocity = (Math.random() - 0.5) * 0.03;
                this.type = Math.floor(Math.random() * 3);
            }

            update(localMouseX, localMouseY) {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.angularVelocity;

                // Subtle cursor attraction
                const dx = localMouseX - this.x;
                const dy = localMouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180 && dist > 10) {
                    const force = (180 - dist) / 180 * 0.08;
                    this.vx += (dx / dist) * force;
                    this.vy += (dy / dist) * force;
                }

                // Damping
                this.vx *= 0.98;
                this.vy *= 0.98;

                if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
                ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`;
                ctx.shadowBlur = 8;

                ctx.beginPath();
                if (this.type === 0) {
                    // Diamond
                    ctx.moveTo(0, -this.size);
                    ctx.lineTo(this.size * 0.7, 0);
                    ctx.lineTo(0, this.size);
                    ctx.lineTo(-this.size * 0.7, 0);
                } else if (this.type === 1) {
                    // Triangle
                    ctx.moveTo(0, -this.size);
                    ctx.lineTo(this.size * 0.86, this.size * 0.5);
                    ctx.lineTo(-this.size * 0.86, this.size * 0.5);
                } else {
                    // Micro Circle
                    ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        for (let i = 0; i < SHARDS_COUNT; i++) {
            shards.push(new CosmicShard());
        }

        function animateShards() {
            ctx.clearRect(0, 0, width, height);

            const heroBanner = document.getElementById('heroBanner');
            let localMouseX = globalMouseX;
            let localMouseY = globalMouseY;
            if (heroBanner) {
                const rect = heroBanner.getBoundingClientRect();
                localMouseX = globalMouseX - rect.left;
                localMouseY = globalMouseY - rect.top;
            }

            shards.forEach((shard) => {
                shard.update(localMouseX, localMouseY);
                shard.draw();
            });

            requestAnimationFrame(animateShards);
        }

        animateShards();
    }

    // Initialize stats
    updateSystemStats();
});
