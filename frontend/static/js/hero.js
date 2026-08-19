/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * Dynamic Async Stats Fetcher, Spatial 3D Matrix & Celestial Quantum Shards Particle Engine
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

    // 4. Interactive Cosmic Shards & Celestial Quantum Ledger Particle Engine
    const canvas = document.getElementById('cosmicShardsCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let shards = [];
        const SHARDS_COUNT = 65;

        // Smooth cursor tracker on canvas
        let cursorX = 0;
        let cursorY = 0;

        // Cryptographic Telemetry Tags
        const cryptoTags = [
            '0x7F4A', 'SHA256', 'SLA 99.9%', 'CBR_NODE', 'ESCROW_OK',
            'GAS 0.001', 'BLOCK #1480', 'GOST_2026', 'ORACLE_V1', 'ZKP_VALID'
        ];

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
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 6 + 2.5; // 2.5px to 8.5px
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.55 + 0.25;
                this.angle = Math.random() * Math.PI * 2;
                this.angularVelocity = (Math.random() - 0.5) * 0.035;
                this.type = Math.floor(Math.random() * 4); // 0: diamond, 1: triangle, 2: crystal polygon, 3: quantum star
                this.depth = Math.random() * 0.7 + 0.6; // Parallax depth
                this.tag = Math.random() > 0.65 ? cryptoTags[Math.floor(Math.random() * cryptoTags.length)] : null;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update(localMouseX, localMouseY) {
                this.angle += this.angularVelocity;
                this.pulsePhase += 0.03;
                this.x += this.vx * this.depth;
                this.y += this.vy * this.depth;

                // Magnetic attraction towards cursor
                if (isMouseActive) {
                    const dx = localMouseX - this.x;
                    const dy = localMouseY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 480 && dist > 10) {
                        // Smooth non-linear gravity
                        const force = (480 - dist) / 480;
                        const pullFactor = force * 0.028;
                        this.vx += (dx / dist) * pullFactor;
                        this.vy += (dy / dist) * pullFactor;

                        // Orbital swirl when close to cursor
                        if (dist < 130) {
                            this.vx += (-dy / dist) * 0.018;
                            this.vy += (dx / dist) * 0.018;
                        }
                    }
                }

                // Fluid damping
                this.vx *= 0.94;
                this.vy *= 0.94;

                // Screen boundary wrapping
                if (this.x < -30) this.x = width + 20;
                if (this.x > width + 30) this.x = -20;
                if (this.y < -30) this.y = height + 20;
                if (this.y > height + 30) this.y = -20;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                const pulse = Math.sin(this.pulsePhase) * 0.15;
                const effectiveAlpha = Math.min(1, Math.max(0.1, this.alpha + pulse));
                const rgba = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${effectiveAlpha})`;
                const glowRgba = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${effectiveAlpha * 0.4})`;

                ctx.fillStyle = rgba;
                ctx.strokeStyle = glowRgba;
                ctx.lineWidth = 1;
                ctx.shadowColor = rgba;
                ctx.shadowBlur = 10;

                ctx.beginPath();
                if (this.type === 0) {
                    // Diamond Shard
                    const s = this.size;
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.65, 0);
                    ctx.lineTo(0, s);
                    ctx.lineTo(-s * 0.65, 0);
                } else if (this.type === 1) {
                    // Triangular Crystal
                    const s = this.size;
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.85, s * 0.7);
                    ctx.lineTo(-s * 0.85, s * 0.7);
                } else if (this.type === 2) {
                    // Hexagonal Micro-Facet
                    const s = this.size * 0.8;
                    for (let i = 0; i < 6; i++) {
                        const a = (i * Math.PI) / 3;
                        const px = Math.cos(a) * s;
                        const py = Math.sin(a) * s;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                } else {
                    // Quantum Stardust 4-Point Star
                    const s = this.size * 0.9;
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.25, -s * 0.25);
                    ctx.lineTo(s, 0);
                    ctx.lineTo(s * 0.25, s * 0.25);
                    ctx.lineTo(0, s);
                    ctx.lineTo(-s * 0.25, s * 0.25);
                    ctx.lineTo(-s, 0);
                    ctx.lineTo(-s * 0.25, -s * 0.25);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Render micro bytecode tag on active shards
                if (this.tag && effectiveAlpha > 0.4) {
                    ctx.rotate(-this.angle); // Keep text horizontal
                    ctx.font = '9px "JetBrains Mono", Consolas, monospace';
                    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${effectiveAlpha * 0.65})`;
                    ctx.shadowBlur = 0;
                    ctx.fillText(this.tag, 10, -4);
                }

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
            let targetMouseX = width / 2;
            let targetMouseY = height / 2;

            if (heroBlock) {
                const rect = heroBlock.getBoundingClientRect();
                targetMouseX = globalMouseX - rect.left;
                targetMouseY = globalMouseY - rect.top;
            }

            // Smooth cursor tracker interpolation
            cursorX += (targetMouseX - cursorX) * 0.1;
            cursorY += (targetMouseY - cursorY) * 0.1;

            // 1. Cursor Magnetic Light Flare & Aura
            if (isMouseActive) {
                const radialGradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 160);
                radialGradient.addColorStop(0, 'rgba(56, 97, 251, 0.15)');
                radialGradient.addColorStop(0.5, 'rgba(22, 199, 132, 0.06)');
                radialGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = radialGradient;
                ctx.beginPath();
                ctx.arc(cursorX, cursorY, 160, 0, Math.PI * 2);
                ctx.fill();
            }

            // 2. Update & draw all shards
            const nearestToCursor = [];

            for (let i = 0; i < shards.length; i++) {
                const shard = shards[i];
                shard.update(cursorX, cursorY);
                shard.draw();

                // Track distance to cursor for tether lines
                if (isMouseActive) {
                    const dMouse = Math.hypot(cursorX - shard.x, cursorY - shard.y);
                    if (dMouse < 140) {
                        nearestToCursor.push({ shard, dist: dMouse });
                    }
                }

                // Constellation lines between adjacent shards
                for (let j = i + 1; j < shards.length; j++) {
                    const s2 = shards[j];
                    const dx = shard.x - s2.x;
                    const dy = shard.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 72) {
                        const alpha = (1 - dist / 72) * 0.28;
                        ctx.beginPath();
                        ctx.moveTo(shard.x, shard.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.strokeStyle = `rgba(56, 97, 251, ${alpha})`;
                        ctx.lineWidth = 0.75;
                        ctx.stroke();
                    }
                }
            }

            // 3. Interactive Force-Field Tether Lines to Cursor
            if (isMouseActive && nearestToCursor.length > 0) {
                nearestToCursor.sort((a, b) => a.dist - b.dist);
                const tetherCount = Math.min(3, nearestToCursor.length);
                for (let k = 0; k < tetherCount; k++) {
                    const { shard, dist } = nearestToCursor[k];
                    const alpha = (1 - dist / 140) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(cursorX, cursorY);
                    ctx.lineTo(shard.x, shard.y);
                    ctx.strokeStyle = `rgba(97, 136, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
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
