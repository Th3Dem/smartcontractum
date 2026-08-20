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

    // 6. Interactive 3D Mission Motto Pop-Out & Dynamic Mouse Parallax Engine
    const wordItems = document.querySelectorAll('.eyebrow-word-item');

    if (wordItems.length > 0) {
        wordItems.forEach((item) => {
            let itemRaf = null;

            item.addEventListener('mouseenter', () => {
                item.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease';
            });

            item.addEventListener('mousemove', (e) => {
                if (itemRaf) cancelAnimationFrame(itemRaf);

                itemRaf = requestAnimationFrame(() => {
                    const rect = item.getBoundingClientRect();
                    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

                    const transX = (normX * 12).toFixed(1);
                    const transY = (normY * 8).toFixed(1);
                    const rotX = (-normY * 26).toFixed(1);
                    const rotY = (normX * 30).toFixed(1);

                    item.style.transform = `translate3d(${transX}px, ${transY}px, 70px) scale(1.42) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
                });
            });

            item.addEventListener('mouseleave', () => {
                if (itemRaf) cancelAnimationFrame(itemRaf);
                item.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease';
                item.style.transform = '';
            });

            item.addEventListener('touchstart', () => {
                item.style.transform = 'translate3d(0px, -4px, 70px) scale(1.42) rotateX(8deg) rotateY(0deg)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 1500);
            }, { passive: true });
        });
    }

    // 7. Smooth Anchor Scrolling for Hero Scroll Cue
    const heroScrollCue = document.querySelector('.hero-scroll-cue');
    if (heroScrollCue) {
        heroScrollCue.addEventListener('click', (e) => {
            const targetHref = heroScrollCue.getAttribute('href');
            if (targetHref && targetHref.startsWith('#')) {
                const targetElement = document.querySelector(targetHref);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    if (window.history && window.history.pushState) {
                        window.history.pushState(null, null, targetHref);
                    }
                }
            }
        });
    }



    // 8. Interactive Node Constellation Graph Canvas Controller
    function initConstellationGraph() {
        const canvas = document.getElementById('constellationCanvas');
        const container = document.getElementById('constellationGraphSection');
        const core = document.getElementById('constellationCore');
        const nodes = document.querySelectorAll('.constellation-node');

        if (!canvas || !container || !core || nodes.length === 0) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let hoveredNodeIndex = -1;
        let isCoreHovered = false;
        let animationFrameId = null;

        // Packet particle system
        const packets = [];
        const packetCountPerNode = 3;

        for (let n = 0; n < nodes.length; n++) {
            for (let p = 0; p < packetCountPerNode; p++) {
                packets.push({
                    nodeIndex: n,
                    progress: Math.random(),
                    speed: 0.0035 + Math.random() * 0.0035,
                    size: 2.5 + Math.random() * 1.5,
                    direction: Math.random() > 0.5 ? 1 : -1
                });
            }
        }

        function resize() {
            if (window.innerWidth <= 1080) {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                return;
            }
            const rect = container.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            if (width === 0 || height === 0) return;

            canvas.width = width * (window.devicePixelRatio || 1);
            canvas.height = height * (window.devicePixelRatio || 1);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

            if (!animationFrameId) {
                render();
            }
        }

        function getPositions() {
            const containerRect = container.getBoundingClientRect();
            const coreRect = core.getBoundingClientRect();
            const corePos = {
                x: coreRect.left - containerRect.left + coreRect.width / 2,
                y: coreRect.top - containerRect.top + coreRect.height / 2
            };

            const nodePositions = [];
            nodes.forEach((node) => {
                const bubble = node.querySelector('.node-icon-bubble') || node;
                const bRect = bubble.getBoundingClientRect();
                nodePositions.push({
                    x: bRect.left - containerRect.left + bRect.width / 2,
                    y: bRect.top - containerRect.top + bRect.height / 2,
                    color: node.getAttribute('data-color') || '#38bdf8'
                });
            });

            return { corePos, nodePositions };
        }

        function render() {
            if (window.innerWidth <= 1080) return;

            ctx.clearRect(0, 0, width, height);

            const { corePos, nodePositions } = getPositions();

            // Draw synaptic laser lines to all nodes
            nodePositions.forEach((nPos, idx) => {
                const isHovered = (hoveredNodeIndex === idx) || isCoreHovered;
                const strokeColor = isHovered ? nPos.color : 'rgba(56, 189, 248, 0.22)';
                const lineWidth = isHovered ? 2.5 : 1.2;

                ctx.beginPath();
                ctx.moveTo(corePos.x, corePos.y);

                const cpX = (corePos.x + nPos.x) / 2;
                const cpY = corePos.y + (nPos.y - corePos.y) * 0.15;
                ctx.quadraticCurveTo(cpX, cpY, nPos.x, nPos.y);

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = lineWidth;
                if (isHovered) {
                    ctx.shadowColor = nPos.color;
                    ctx.shadowBlur = 12;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            // Update & Draw Packets
            packets.forEach((packet) => {
                const targetNode = nodePositions[packet.nodeIndex];
                if (!targetNode) return;

                const isHovered = (hoveredNodeIndex === packet.nodeIndex) || isCoreHovered;
                const currentSpeed = isHovered ? packet.speed * 2.2 : packet.speed;

                packet.progress += currentSpeed;
                if (packet.progress > 1) packet.progress = 0;

                const cpX = (corePos.x + targetNode.x) / 2;
                const cpY = corePos.y + (targetNode.y - corePos.y) * 0.15;

                const t = packet.direction === 1 ? packet.progress : (1 - packet.progress);
                const invT = 1 - t;
                const px = invT * invT * corePos.x + 2 * invT * t * cpX + t * t * targetNode.x;
                const py = invT * invT * corePos.y + 2 * invT * t * cpY + t * t * targetNode.y;

                ctx.beginPath();
                ctx.arc(px, py, isHovered ? packet.size * 1.35 : packet.size, 0, Math.PI * 2);
                ctx.fillStyle = targetNode.color;
                ctx.shadowColor = targetNode.color;
                ctx.shadowBlur = isHovered ? 12 : 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(render);
        }

        nodes.forEach((node, idx) => {
            node.addEventListener('mouseenter', () => { hoveredNodeIndex = idx; });
            node.addEventListener('mouseleave', () => { hoveredNodeIndex = -1; });
        });

        core.addEventListener('mouseenter', () => { isCoreHovered = true; });
        core.addEventListener('mouseleave', () => { isCoreHovered = false; });

        window.addEventListener('resize', resize, { passive: true });
        setTimeout(resize, 100);
    }

    // Initialize Constellation Graph
    initConstellationGraph();

    // Initialize stats
    updateSystemStats();
});
