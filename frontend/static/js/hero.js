/**
 * SmartContractum — Block 1 Hero Section & Interactive Router Controller
 * Reactive Stationary Constellation Engine & GPU 3D Spatial Physics
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
    let isMouseInsideHero = true;
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

    if (heroBanner) {
        heroBanner.addEventListener('mouseenter', () => { isMouseInsideHero = true; });
        heroBanner.addEventListener('mouseleave', () => { isMouseInsideHero = false; });
    }

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

            targetRotX = -18 - normY * 26;
            targetRotY = 32 + normX * 36;
            targetTransX = normX * 12;
            targetTransY = normY * 8;
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
            idleClock += 0.015;
            const idleOffset = Math.sin(idleClock) * 2.5;

            // Smooth Lerp interpolation
            currentRotX += (targetRotX - currentRotX) * 0.06;
            currentRotY += (targetRotY - currentRotY) * 0.06;
            currentTransX += (targetTransX - currentTransX) * 0.05;
            currentTransY += (targetTransY - currentTransY) * 0.05;

            if (cube) {
                cube.style.transform = `translate3d(${currentTransX.toFixed(1)}px, ${(currentTransY + idleOffset).toFixed(1)}px, 0) rotateX(${currentRotX.toFixed(1)}deg) rotateY(${currentRotY.toFixed(1)}deg)`;
            }

            if (matrix) {
                matrix.style.transform = `translate(calc(-50% + ${(currentTransX * 0.25).toFixed(1)}px), calc(-50% + ${(currentTransY * 0.25).toFixed(1)}px))`;
            }
        }

        requestAnimationFrame(render3DPhysics);
    }

    if (cube || matrix) {
        render3DPhysics();
    }

    // 5. Reactive Stationary Constellation Engine (Motion only when mouse approaches)
    const canvas = document.getElementById('cosmicShardsCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        let width = 0;
        let height = 0;
        let shards = [];

        const colorPalettes = [
            'rgba(56, 97, 251, ',   // CMC Blue
            'rgba(56, 189, 248, ',  // Electric Cyan
            'rgba(22, 199, 132, ',  // Mint
            'rgba(246, 184, 63, ',  // Gold
            'rgba(255, 255, 255, '  // White
        ];

        class ReactiveCosmicShard {
            constructor(homeX, homeY) {
                this.homeX = homeX;
                this.homeY = homeY;
                this.x = homeX;
                this.y = homeY;
                this.vx = 0;
                this.vy = 0;
                // Variable particle size tiers: 65% micro, 25% medium, 10% large prominent nodes
                const sizeTier = Math.random();
                if (sizeTier > 0.90) {
                    this.baseSize = Math.random() * 3.5 + 5.5; // Large crystal node (5.5 - 9px)
                    this.tier = 2;
                } else if (sizeTier > 0.65) {
                    this.baseSize = Math.random() * 2.5 + 3.2; // Medium crystal shard (3.2 - 5.7px)
                    this.tier = 1;
                } else {
                    this.baseSize = Math.random() * 1.8 + 1.2; // Micro star (1.2 - 3px)
                    this.tier = 0;
                }

                this.colorPrefix = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
                this.baseAlpha = this.tier === 2 ? 0.38 : (Math.random() * 0.24 + 0.14);
                this.currentAlpha = this.baseAlpha;
                this.angle = Math.random() * 6.28;
                this.angularVelocity = 0;
                this.swirlDir = Math.random() > 0.5 ? 1 : -1;
                this.type = Math.floor(Math.random() * 3); // Diamond, Star Circle, Cross
            }

            update(localMouseX, localMouseY, isMouseActive) {
                const dxMouse = localMouseX - this.x;
                const dyMouse = localMouseY - this.y;
                const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;
                const INFLUENCE_RADIUS = 210;
                const INFLUENCE_SQ = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

                const dxHome = this.homeX - this.x;
                const dyHome = this.homeY - this.y;
                const distHomeSq = dxHome * dxHome + dyHome * dyHome;

                const isNearMouse = isMouseActive && distSqMouse < INFLUENCE_SQ;

                if (isNearMouse) {
                    const distMouse = Math.sqrt(distSqMouse);
                    // Soft quadratic easing factor
                    const proximity = 1 - (distMouse / INFLUENCE_RADIUS);
                    const force = Math.sin(proximity * Math.PI) * 0.022;

                    // 1. Smooth attraction toward cursor
                    this.vx += (dxMouse / distMouse) * force;
                    this.vy += (dyMouse / distMouse) * force;

                    // 2. Soft orbital floating swirl (prevents rigid clumping)
                    const tangentX = -dyMouse / distMouse;
                    const tangentY = dxMouse / distMouse;
                    const swirlForce = force * 0.55 * this.swirlDir;
                    this.vx += tangentX * swirlForce;
                    this.vy += tangentY * swirlForce;

                    this.angularVelocity += 0.0016 * this.swirlDir;
                    this.currentAlpha += (Math.min(0.75, this.baseAlpha + 0.38) - this.currentAlpha) * 0.06;
                } else {
                    // Symmetric return flight: flies back to home with the exact same energetic curve
                    if (distHomeSq > 0.35) {
                        const distHome = Math.sqrt(distHomeSq);
                        // Matches the forward attraction force curve
                        const returnForce = Math.sin(Math.min(distHome / 90, 1) * (Math.PI / 2)) * 0.022;
                        this.vx += (dxHome / distHome) * returnForce;
                        this.vy += (dyHome / distHome) * returnForce;
                    } else {
                        // Completely motionless at home
                        this.x = this.homeX;
                        this.y = this.homeY;
                        this.vx = 0;
                        this.vy = 0;
                    }

                    this.currentAlpha += (this.baseAlpha - this.currentAlpha) * 0.04;
                }

                // Viscous liquid damping
                this.vx *= 0.925;
                this.vy *= 0.925;
                this.angularVelocity *= 0.93;

                // Speed cap for silk-smooth float
                const speedSq = this.vx * this.vx + this.vy * this.vy;
                const MAX_SPEED = 1.7;
                if (speedSq > MAX_SPEED * MAX_SPEED) {
                    const speed = Math.sqrt(speedSq);
                    this.vx = (this.vx / speed) * MAX_SPEED;
                    this.vy = (this.vy / speed) * MAX_SPEED;
                }

                if (Math.abs(this.vx) < 0.003) this.vx = 0;
                if (Math.abs(this.vy) < 0.003) this.vy = 0;

                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.angularVelocity;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillStyle = this.colorPrefix + this.currentAlpha.toFixed(2) + ')';

                ctx.beginPath();
                if (this.type === 0) {
                    // Smooth Diamond Facet
                    ctx.moveTo(0, -this.baseSize);
                    ctx.lineTo(this.baseSize * 0.65, 0);
                    ctx.lineTo(0, this.baseSize);
                    ctx.lineTo(-this.baseSize * 0.65, 0);
                } else if (this.type === 1) {
                    // Smooth Star Dot
                    ctx.arc(0, 0, this.baseSize * 0.5, 0, 6.28);
                } else {
                    // Micro Cross / Plus
                    ctx.rect(-this.baseSize * 0.6, -this.baseSize * 0.2, this.baseSize * 1.2, this.baseSize * 0.4);
                    ctx.rect(-this.baseSize * 0.2, -this.baseSize * 0.6, this.baseSize * 0.4, this.baseSize * 1.2);
                }
                ctx.closePath();
                ctx.fill();

                // Extra subtle halo for larger nodes (Tier 2)
                if (this.tier === 2) {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.baseSize * 1.3, 0, 6.28);
                    ctx.fillStyle = this.colorPrefix + (this.currentAlpha * 0.25).toFixed(2) + ')';
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        function initShards() {
            if (!heroBanner || !canvas) return;
            const rect = heroBanner.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width;
            canvas.height = height;

            shards = [];
            const isMobile = width < 768;
            const cols = isMobile ? 6 : 11;
            const rows = isMobile ? 6 : 7;

            const stepX = width / (cols + 1);
            const stepY = height / (rows + 1);

            for (let c = 1; c <= cols; c++) {
                for (let r = 1; r <= rows; r++) {
                    const jitterX = (Math.random() - 0.5) * stepX * 0.8;
                    const jitterY = (Math.random() - 0.5) * stepY * 0.8;
                    const homeX = c * stepX + jitterX;
                    const homeY = r * stepY + jitterY;
                    shards.push(new ReactiveCosmicShard(homeX, homeY));
                }
            }
        }

        initShards();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initShards, 150);
        }, { passive: true });

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
                    shards[i].update(localMouseX, localMouseY, isMouseInsideHero);
                    shards[i].draw();
                }
            }

            requestAnimationFrame(animateShards);
        }

        animateShards();
    }

    // 6. Interactive 3D Mission Motto & Elegant Cyber Sparks / Stardust Particle Engine
    const mottoCanvas = document.getElementById('mottoLightningCanvas');
    const mottoPill = document.getElementById('heroEyebrow');
    const wordItems = document.querySelectorAll('.eyebrow-word-item');

    if (mottoCanvas && mottoPill && wordItems.length > 0) {
        const mCtx = mottoCanvas.getContext('2d');
        let mWidth = window.innerWidth;
        let mHeight = window.innerHeight;
        let activeWord = null;
        let isEngineRunning = false;
        let sparksRaf = null;
        let sparks = [];
        let microArcs = [];
        let shockwaves = [];
        let surgeTimer = null;

        function resizeMottoCanvas() {
            const hBanner = document.getElementById('heroBanner') || document.querySelector('.hero-3d-banner');
            if (hBanner && mottoCanvas) {
                const rect = hBanner.getBoundingClientRect();
                mWidth = Math.max(window.innerWidth, Math.round(rect.width));
                mHeight = Math.max(window.innerHeight, Math.round(rect.height));
                mottoCanvas.width = mWidth;
                mottoCanvas.height = mHeight;
            }
        }

        resizeMottoCanvas();
        window.addEventListener('resize', resizeMottoCanvas, { passive: true });
        window.addEventListener('load', resizeMottoCanvas, { passive: true });

        // Palette definitions for pure neon aesthetics
        const wordPalettes = {
            'ideas': ['#38bdf8', '#60a5fa', '#3861fb', '#ffffff'],
            'people': ['#16c784', '#34d399', '#10b981', '#ffffff'],
            'data': ['#f6b83f', '#fbbf24', '#f59e0b', '#ffffff'],
            'solutions': ['#c084fc', '#e879f9', '#a855f7', '#ffffff']
        };

        class CyberSpark {
            constructor(x, y, wordKey, highSpeed = false) {
                this.x = x;
                this.y = y;
                this.lastX = x;
                this.lastY = y;
                const palette = wordPalettes[wordKey] || wordPalettes['ideas'];
                this.color = palette[Math.floor(Math.random() * palette.length)];

                const angle = Math.random() * Math.PI * 2;
                const speed = highSpeed
                    ? (Math.random() * 12 + 5.0)
                    : (Math.random() * 6.5 + 2.0);

                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - (Math.random() * 1.8);
                this.life = 1.0;
                this.decay = Math.random() * 0.024 + 0.015;
                this.size = Math.random() * 2.8 + 1.2;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.flutter = (Math.random() - 0.5) * 0.2;
                this.type = Math.random() > 0.4 ? 'streak' : 'stardust'; // Streak or soft dot
            }

            update() {
                this.lastX = this.x;
                this.lastY = this.y;

                this.x += this.vx;
                this.y += this.vy;

                // Gentle air resistance & micro-buoyancy
                this.vx *= 0.96;
                this.vy = this.vy * 0.96 + 0.03 + Math.sin(this.life * 10) * this.flutter;
                this.twinklePhase += 0.2;
                this.life -= this.decay;
            }

            draw(ctx) {
                if (this.life <= 0) return;
                const alpha = Math.max(0, this.life);
                const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
                const currentAlpha = alpha * twinkle;

                ctx.save();
                if (this.type === 'streak') {
                    // Fine Luminous Neon Motion Streak
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.size * 0.85;
                    ctx.lineCap = 'round';
                    ctx.globalAlpha = currentAlpha * 0.85;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(this.lastX, this.lastY);
                    ctx.lineTo(this.x, this.y);
                    ctx.stroke();

                    // Sparkling White Head
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = currentAlpha;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 0.45, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Soft Glowing Stardust Orb
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = currentAlpha * 0.5;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = currentAlpha * 0.95;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        // Delicate Micro-Energy Arc along the word border (subtle, non-intrusive)
        class MicroArc {
            constructor(x, y, wordKey) {
                this.startX = x;
                this.startY = y;
                const palette = wordPalettes[wordKey] || wordPalettes['ideas'];
                this.color = palette[0];
                const angle = Math.random() * Math.PI * 2;
                const len = Math.random() * 20 + 10;
                this.endX = x + Math.cos(angle) * len;
                this.endY = y + Math.sin(angle) * len;

                const midX = (this.startX + this.endX) / 2 + (Math.random() - 0.5) * 8;
                const midY = (this.startY + this.endY) / 2 + (Math.random() - 0.5) * 8;
                this.points = [{ x: this.startX, y: this.startY }, { x: midX, y: midY }, { x: this.endX, y: this.endY }];
                this.life = 1.0;
                this.decay = 0.18;
            }

            update() {
                this.life -= this.decay;
            }

            draw(ctx) {
                if (this.life <= 0) return;
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.4;
                ctx.lineCap = 'round';
                ctx.globalAlpha = this.life * 0.75;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(this.points[0].x, this.points[0].y);
                ctx.lineTo(this.points[1].x, this.points[1].y);
                ctx.lineTo(this.points[2].x, this.points[2].y);
                ctx.stroke();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 0.8;
                ctx.globalAlpha = this.life * 0.9;
                ctx.stroke();
                ctx.restore();
            }
        }

        class SubtleShockwave {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.radius = 8;
                this.maxRadius = Math.random() * 120 + 90;
                this.life = 1.0;
                this.decay = 0.055;
            }

            update() {
                this.radius += (this.maxRadius - this.radius) * 0.16;
                this.life -= this.decay;
            }

            draw(ctx) {
                if (this.life <= 0) return;
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.6 * this.life;
                ctx.globalAlpha = this.life * 0.5;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        function triggerSparks(wordElem, isBurst = false) {
            const hBanner = document.getElementById('heroBanner') || document.querySelector('.hero-3d-banner');
            if (!wordElem || !hBanner) return;

            const bRect = hBanner.getBoundingClientRect();
            const wRect = wordElem.getBoundingClientRect();
            const wordKey = wordElem.getAttribute('data-word') || 'ideas';
            const color = wordElem.getAttribute('data-color') || '#38bdf8';

            const startX = wRect.left - bRect.left + wRect.width / 2;
            const startY = wRect.top - bRect.top + wRect.height / 2;

            if (isBurst) {
                shockwaves.push(new SubtleShockwave(startX, startY, color));
            }

            // Spawn elegant sparks
            const count = isBurst ? 22 : (Math.floor(Math.random() * 3) + 2);
            for (let i = 0; i < count; i++) {
                const sx = startX + (Math.random() - 0.5) * wRect.width;
                const sy = startY + (Math.random() - 0.5) * wRect.height;
                sparks.push(new CyberSpark(sx, sy, wordKey, isBurst));
            }

            // Occasional micro-energy crackle at the edge
            if (Math.random() > 0.5) {
                const mx = startX + (Math.random() - 0.5) * wRect.width;
                const my = startY + (Math.random() - 0.5) * wRect.height;
                microArcs.push(new MicroArc(mx, my, wordKey));
            }
        }

        function renderSparks() {
            mCtx.clearRect(0, 0, mWidth, mHeight);

            // Continuously emit delicate sparks while hovered
            if (activeWord && Math.random() > 0.25) {
                triggerSparks(activeWord, false);
            }

            // Update & Draw shockwaves
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                shockwaves[i].update();
                shockwaves[i].draw(mCtx);
                if (shockwaves[i].life <= 0) {
                    shockwaves.splice(i, 1);
                }
            }

            // Update & Draw micro-arcs
            for (let i = microArcs.length - 1; i >= 0; i--) {
                microArcs[i].update();
                microArcs[i].draw(mCtx);
                if (microArcs[i].life <= 0) {
                    microArcs.splice(i, 1);
                }
            }

            // Update & Draw sparks
            for (let i = sparks.length - 1; i >= 0; i--) {
                sparks[i].update();
                sparks[i].draw(mCtx);
                if (sparks[i].life <= 0) {
                    sparks.splice(i, 1);
                }
            }

            if (sparks.length > 0 || microArcs.length > 0 || shockwaves.length > 0 || activeWord !== null) {
                sparksRaf = requestAnimationFrame(renderSparks);
            } else {
                isEngineRunning = false;
                mCtx.clearRect(0, 0, mWidth, mHeight);
            }
        }

        function startEngine() {
            if (!isEngineRunning) {
                isEngineRunning = true;
                sparksRaf = requestAnimationFrame(renderSparks);
            }
        }

        wordItems.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                resizeMottoCanvas();
                activeWord = item;
                triggerSparks(item, true);
                startEngine();
            });

            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                item.style.transform = `translateZ(28px) scale(1.15) rotateX(${(-normY * 18).toFixed(1)}deg) rotateY(${(normX * 22).toFixed(1)}deg)`;
                if (!isEngineRunning) {
                    startEngine();
                }
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
                if (activeWord === item) {
                    activeWord = null;
                }
            });

            item.addEventListener('focus', () => {
                resizeMottoCanvas();
                activeWord = item;
                triggerSparks(item, true);
                startEngine();
            });

            item.addEventListener('blur', () => {
                if (activeWord === item) {
                    activeWord = null;
                }
            });

            item.addEventListener('touchstart', () => {
                resizeMottoCanvas();
                activeWord = item;
                item.classList.add('active-surge');
                triggerSparks(item, true);
                startEngine();

                clearTimeout(surgeTimer);
                surgeTimer = setTimeout(() => {
                    item.classList.remove('active-surge');
                    if (activeWord === item) {
                        activeWord = null;
                    }
                }, 1400);
            }, { passive: true });
        });
    }

    // Initialize stats
    updateSystemStats();
});
