/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * Dynamic Async Stats Fetcher, Global 3D Spatial Matrix & Interactive Cosmic Shards Canvas
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
    let globalMouseX = window.innerWidth / 2;
    let globalMouseY = window.innerHeight / 2;
    let isMouseActive = false;

    if (cube) {
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
            isMouseActive = true;

            const normX = (clientX / window.innerWidth - 0.5) * 2;   // -1.0 to 1.0
            const normY = (clientY / window.innerHeight - 0.5) * 2;  // -1.0 to 1.0

            targetRotX = -18 - normY * 34;
            targetRotY = 32 + normX * 48;
            targetTransX = normX * 28;
            targetTransY = normY * 18;
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
            idleClock += 0.02;
            const idleOffset = Math.sin(idleClock) * 5;

            // Lerp interpolation
            currentRotX += (targetRotX - currentRotX) * 0.06;
            currentRotY += (targetRotY - currentRotY) * 0.06;
            currentTransX += (targetTransX - currentTransX) * 0.05;
            currentTransY += (targetTransY - currentTransY) * 0.05;

            cube.style.transform = `translate3d(${currentTransX.toFixed(2)}px, ${(currentTransY + idleOffset).toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;

            if (matrix) {
                matrix.style.transform = `translate(calc(-50% + ${(currentTransX * 0.35).toFixed(1)}px), calc(-50% + ${(currentTransY * 0.35).toFixed(1)}px))`;
            }

            requestAnimationFrame(render3DPhysics);
        }

        render3DPhysics();
    }

    // 4. Interactive Cosmic Shards & Magnetic Cursor Gravity Particle Field
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
            const heroBlock = document.getElementById('heroBlock');
            if (!heroBlock) return;
            const rect = heroBlock.getBoundingClientRect();
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
                this.originX = Math.random() * (width || 800);
                this.originY = Math.random() * (height || 500);
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.size = Math.random() * 6 + 2.5; // 2.5px to 8.5px
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.55 + 0.25;
                this.angle = Math.random() * Math.PI * 2;
                this.angularVelocity = (Math.random() - 0.5) * 0.04;
                this.type = Math.floor(Math.random() * 3); // 0: diamond, 1: triangle, 2: crystal polygon
                this.depth = Math.random() * 0.8 + 0.6; // Parallax depth
            }

            update(localMouseX, localMouseY) {
                // Natural ambient flow
                this.angle += this.angularVelocity;
                this.x += this.vx * this.depth;
                this.y += this.vy * this.depth;

                // Magnetic attraction towards cursor
                if (isMouseActive) {
                    const dx = localMouseX - this.x;
                    const dy = localMouseY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 480 && dist > 8) {
                        // Gravitational acceleration (smooth pull)
                        const force = (480 - dist) / 480;
                        const pullFactor = force * 0.028;
                        this.vx += (dx / dist) * pullFactor;
                        this.vy += (dy / dist) * pullFactor;

                        // Orbital swirl when close to cursor
                        if (dist < 120) {
                            this.vx += (-dy / dist) * 0.015;
                            this.vy += (dx / dist) * 0.015;
                        }
                    }
                }

                // Fluid damping
                this.vx *= 0.94;
                this.vy *= 0.94;

                // Spring back slightly towards ambient area if out of bounds
                if (this.x < -30) this.x = width + 20;
                if (this.x > width + 30) this.x = -20;
                if (this.y < -30) this.y = height + 20;
                if (this.y > height + 30) this.y = -20;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                const rgba = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
                const glowRgba = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.5})`;

                ctx.fillStyle = rgba;
                ctx.strokeStyle = glowRgba;
                ctx.lineWidth = 1;
                ctx.shadowColor = rgba;
                ctx.shadowBlur = 8;

                ctx.beginPath();
                if (this.type === 0) {
                    // Diamond Shard
                    const s = this.size;
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.6, 0);
                    ctx.lineTo(0, s);
                    ctx.lineTo(-s * 0.6, 0);
                } else if (this.type === 1) {
                    // Triangle Crystal Fragment
                    const s = this.size;
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.8, s * 0.7);
                    ctx.lineTo(-s * 0.8, s * 0.7);
                } else {
                    // Hexagonal Micro-Facet
                    const s = this.size * 0.8;
                    for (let i = 0; i < 6; i++) {
                        const a = (i * Math.PI) / 3;
                        const px = Math.cos(a) * s;
                        const py = Math.sin(a) * s;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        }

        function initShards() {
            resizeCanvas();
            shards = [];
            for (let i = 0; i < SHARDS_COUNT; i++) {
                shards.push(new CosmicShard());
            }
        }

        function renderCosmicField() {
            ctx.clearRect(0, 0, width, height);

            // Convert global mouse position to local canvas coordinates
            const heroBlock = document.getElementById('heroBlock');
            let localMouseX = width / 2;
            let localMouseY = height / 2;

            if (heroBlock) {
                const rect = heroBlock.getBoundingClientRect();
                localMouseX = globalMouseX - rect.left;
                localMouseY = globalMouseY - rect.top;
            }

            // Update & draw all shards
            for (let i = 0; i < shards.length; i++) {
                const shard = shards[i];
                shard.update(localMouseX, localMouseY);
                shard.draw();

                // Subtle constellation lines between very close shards
                for (let j = i + 1; j < shards.length; j++) {
                    const s2 = shards[j];
                    const dx = shard.x - s2.x;
                    const dy = shard.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 65) {
                        ctx.beginPath();
                        ctx.moveTo(shard.x, shard.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.strokeStyle = `rgba(56, 97, 251, ${(1 - dist / 65) * 0.25})`;
                        ctx.lineWidth = 0.75;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(renderCosmicField);
        }

        window.addEventListener('resize', resizeCanvas);
        initShards();
        renderCosmicField();
    }

    updateSystemStats();
});
