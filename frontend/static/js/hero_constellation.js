/**
 * SmartContractum — Hero Constellation Interactive Graph v4.1.0
 * Micro-Particle Energy Streams & Laser Synapses
 * File: frontend/static/js/hero_constellation.js
 */

(function () {
    "use strict";

    function initConstellation() {
        const container = document.getElementById('constellationContainer');
        const canvas = document.getElementById('constellationCanvas');
        const core = document.getElementById('constellationCore');
        const cards = document.querySelectorAll('.constellation-satellite-card');

        if (!container || !canvas || !core || cards.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let animationFrameId = null;
        let hoveredNodeId = null;
        let isCoreHovered = false;

        // Micro-particle system (streaks, rotating diamonds, quantum rings, cyber dust, photon sparks)
        const PARTICLES_PER_NODE = 10;
        const totalParticles = cards.length * PARTICLES_PER_NODE;
        const particles = [];

        function createParticle(cardIndex) {
            const types = ['streak', 'diamond', 'ring', 'dust', 'spark'];
            const type = types[Math.floor(Math.random() * types.length)];

            return {
                cardIndex: cardIndex,
                type: type,
                progress: Math.random(), // 0.0 to 1.0 along the trajectory
                // Calibrated slightly slower speed (smooth and energetic)
                speed: 0.0024 + Math.random() * 0.0026,
                size: 2.2 + Math.random() * 3.6,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.06,
                curveVariance: (Math.random() - 0.5) * 110,
                // Distributed across the button card volume
                spawnOffsetX: (Math.random() - 0.5) * 0.85,
                spawnOffsetY: (Math.random() - 0.5) * 0.80,
                // Central landing offset behind SmartContractum core
                destOffsetX: (Math.random() - 0.5) * 60,
                destOffsetY: (Math.random() - 0.5) * 30
            };
        }

        function initParticles() {
            particles.length = 0;
            cards.forEach(function (_, cardIndex) {
                for (let i = 0; i < PARTICLES_PER_NODE; i++) {
                    particles.push(createParticle(cardIndex));
                }
            });
        }

        function resize() {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            width = rect.width;
            height = rect.height;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            ctx.scale(dpr, dpr);

            if (particles.length === 0) {
                initParticles();
            }

            if (!animationFrameId) {
                render();
            }
        }

        function hexToRgba(hex, alpha) {
            hex = hex.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        }

        function getCardBoundingData(card, containerRect) {
            const rect = card.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2,
                width: rect.width,
                height: rect.height
            };
        }

        function render() {
            if (window.innerWidth <= 1080) return;

            ctx.clearRect(0, 0, width, height);

            const containerRect = container.getBoundingClientRect();
            const coreRect = core.getBoundingClientRect();
            const coreCenter = {
                x: coreRect.left - containerRect.left + coreRect.width / 2,
                y: coreRect.top - containerRect.top + coreRect.height / 2
            };

            // Collect card bounding boxes and accent colors
            const nodeData = [];
            cards.forEach(function (card) {
                const id = card.getAttribute('data-node-id');
                const accent = card.getAttribute('data-accent') || '#38bdf8';
                const bounds = getCardBoundingData(card, containerRect);
                nodeData.push({
                    id: id,
                    accent: accent,
                    bounds: bounds,
                    isHovered: (hoveredNodeId === id) || isCoreHovered
                });
            });

            // Update & Draw Micro-Particle Streams
            particles.forEach(function (p) {
                const node = nodeData[p.cardIndex];
                if (!node) return;

                const isHovered = node.isHovered;
                const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

                // Speed boost on hover
                const currentSpeed = isHovered ? (p.speed * 1.6) : (anyHovered ? p.speed * 0.75 : p.speed);
                p.progress += currentSpeed;
                p.angle += p.rotSpeed;

                if (p.progress >= 1) {
                    p.progress = 0;
                    p.curveVariance = (Math.random() - 0.5) * 110;
                    p.spawnOffsetX = (Math.random() - 0.5) * 0.85;
                    p.spawnOffsetY = (Math.random() - 0.5) * 0.80;
                    p.destOffsetX = (Math.random() - 0.5) * 60;
                    p.destOffsetY = (Math.random() - 0.5) * 30;
                }

                // Start position distributed across the FULL volume of the button
                const startX = node.bounds.x + p.spawnOffsetX * node.bounds.width;
                const startY = node.bounds.y + p.spawnOffsetY * node.bounds.height;

                // Destination point behind SmartContractum center pill
                const endX = coreCenter.x + p.destOffsetX;
                const endY = coreCenter.y + p.destOffsetY;

                const t = p.progress;

                // Wide Curved Trajectory with Bezier Control Point
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const dx = endX - startX;
                const dy = endY - startY;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / dist;
                const normalY = dx / dist;

                const cpX = midX + normalX * p.curveVariance;
                const cpY = midY + normalY * p.curveVariance;

                // Quadratic Bezier Interpolation
                const u = 1 - t;
                const px = u * u * startX + 2 * u * t * cpX + t * t * endX;
                const py = u * u * startY + 2 * u * t * cpY + t * t * endY;

                // Previous position for smooth comet tail direction
                const tPrev = Math.max(0, t - 0.045);
                const uPrev = 1 - tPrev;
                const prevX = uPrev * uPrev * startX + 2 * uPrev * tPrev * cpX + tPrev * tPrev * endX;
                const prevY = uPrev * uPrev * startY + 2 * uPrev * tPrev * cpY + tPrev * tPrev * endY;

                // Smooth Opacity Fade: Emerge from behind button, stay bright in flight, dissolve behind core
                let alpha = 1;
                if (t < 0.18) {
                    alpha = t / 0.18; // Smooth emergence
                } else if (t > 0.65) {
                    alpha = Math.max(0, (1 - t) / 0.35); // Smooth dissolution
                }

                if (!isHovered && anyHovered) {
                    alpha *= 0.25; // Dim non-hovered streams
                }

                if (alpha <= 0.01) return;

                ctx.save();
                ctx.globalAlpha = alpha;

                if (p.type === 'streak') {
                    // 1. Luminous Comet / Streak with Flowing Trail
                    const grad = ctx.createLinearGradient(prevX, prevY, px, py);
                    grad.addColorStop(0, hexToRgba(node.accent, 0));
                    grad.addColorStop(1, isHovered ? '#ffffff' : node.accent);

                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = isHovered ? (p.size * 1.2) : (p.size * 0.85);
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 8;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                } else if (p.type === 'diamond') {
                    // 2. Rotating Data Diamond
                    ctx.translate(px, py);
                    ctx.rotate(p.angle);
                    const dSize = isHovered ? (p.size * 1.3) : p.size;

                    ctx.beginPath();
                    ctx.moveTo(0, -dSize);
                    ctx.lineTo(dSize, 0);
                    ctx.lineTo(0, dSize);
                    ctx.lineTo(-dSize, 0);
                    ctx.closePath();

                    ctx.fillStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 8;
                    ctx.fill();

                } else if (p.type === 'ring') {
                    // 3. Quantum Energy Ring
                    const rSize = (p.size * (1 + (1 - alpha) * 0.7));
                    ctx.beginPath();
                    ctx.arc(px, py, rSize, 0, Math.PI * 2);
                    ctx.strokeStyle = node.accent;
                    ctx.lineWidth = 1.3;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 10;
                    ctx.stroke();

                } else if (p.type === 'dust') {
                    // 4. Soft Cyber Dust Mote
                    ctx.beginPath();
                    ctx.arc(px, py, p.size * 0.75, 0, Math.PI * 2);
                    ctx.fillStyle = hexToRgba(node.accent, 0.7);
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 6;
                    ctx.fill();

                } else {
                    // 5. Glowing Photon Spark
                    const dotRadius = isHovered ? (p.size * 1.2) : p.size;

                    // Outer Halo
                    ctx.beginPath();
                    ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 18 : 10;
                    ctx.fill();

                    // Hot White Core
                    ctx.beginPath();
                    ctx.arc(px, py, dotRadius * 0.45, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                }

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        }

        // Hover Listeners on Satellite Cards
        cards.forEach(function (card) {
            const id = card.getAttribute('data-node-id');

            card.addEventListener('mouseenter', function () {
                hoveredNodeId = id;
            });

            card.addEventListener('mouseleave', function () {
                hoveredNodeId = null;
            });
        });

        // Hover Listeners on Central Core
        core.addEventListener('mouseenter', function () {
            isCoreHovered = true;
        });

        core.addEventListener('mouseleave', function () {
            isCoreHovered = false;
        });

        // Specialist Modal Controller
        const specialistModal = document.getElementById('specialistModal');
        const btnSpecialistTrigger = document.getElementById('btnSpecialistModalTrigger');
        const btnSrSpecialist = document.getElementById('btnSrSpecialistModal');
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

        if (btnSpecialistTrigger) btnSpecialistTrigger.addEventListener('click', openSpecialistModal);
        if (btnSrSpecialist) btnSrSpecialist.addEventListener('click', openSpecialistModal);
        if (btnCloseSpecialist) btnCloseSpecialist.addEventListener('click', closeSpecialistModal);
        if (specialistModal) {
            specialistModal.addEventListener('click', function (e) {
                if (e.target === specialistModal) closeSpecialistModal();
            });
        }

        // Window Resize with Debounce
        let resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 100);
        }, { passive: true });

        // Immediate and deferred initialization
        resize();
        setTimeout(resize, 100);
        setTimeout(resize, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initConstellation);
    } else {
        initConstellation();
    }
    window.addEventListener('load', initConstellation);
})();
