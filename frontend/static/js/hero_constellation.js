/**
 * SmartContractum — Micro-Elements & Particle Flow Constellation Engine
 * Particles fly smoothly from behind cards and dissolve behind SmartContractum.
 * File: frontend/static/js/hero_constellation.js
 */

(function () {
    'use strict';

    function initConstellation() {
        const container = document.getElementById('constellationContainer');
        const canvas = document.getElementById('constellationCanvas');
        const core = document.getElementById('constellationCore');
        const cards = document.querySelectorAll('.constellation-satellite-card');

        if (!container || !canvas || !core || cards.length === 0) return;

        const ctx = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let hoveredNodeId = null;
        let isCoreHovered = false;
        let animationFrameId = null;

        // Particle Types: 'spark', 'diamond', 'streak', 'ring'
        const particleTypes = ['spark', 'spark', 'diamond', 'streak', 'streak', 'ring'];
        const particles = [];
        const totalBaseParticles = 54; // 9 per card

        for (let i = 0; i < totalBaseParticles; i++) {
            const cardIdx = i % 6;
            particles.push(createParticle(cardIdx, Math.random()));
        }

        function createParticle(cardIdx, initialProgress) {
            const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            return {
                cardIndex: cardIdx,
                progress: (initialProgress !== undefined) ? initialProgress : 0,
                speed: 0.0032 + Math.random() * 0.0028,
                size: 2.2 + Math.random() * 2.8,
                type: type,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.08,
                curveVariance: (Math.random() - 0.5) * 45, // Subtle individual curve offset
                tailLength: 10 + Math.random() * 16
            };
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
            width = Math.max(rect.width, 100);
            height = Math.max(rect.height, 100);

            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

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

        function getCardPosition(card, containerRect) {
            const rect = card.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2
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

            // Collect card origins and accent colors
            const nodeData = [];
            cards.forEach(function (card) {
                const id = card.getAttribute('data-node-id');
                const accent = card.getAttribute('data-accent') || '#38bdf8';
                const pos = getCardPosition(card, containerRect);
                nodeData.push({
                    id: id,
                    accent: accent,
                    pos: pos,
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
                const currentSpeed = isHovered ? (p.speed * 1.8) : (anyHovered ? p.speed * 0.7 : p.speed);
                p.progress += currentSpeed;
                p.angle += p.rotSpeed;

                if (p.progress >= 1) {
                    p.progress = 0;
                    p.curveVariance = (Math.random() - 0.5) * 45;
                }

                // Path Calculation: From behind card (t=0) to behind Core (t=1)
                const start = node.pos;
                const end = coreCenter;
                const t = p.progress;

                // Smooth organic Bezier curve trajectory
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;

                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / dist;
                const normalY = dx / dist;

                // Control point with subtle individual variance
                const cpX = midX + normalX * p.curveVariance;
                const cpY = midY + normalY * p.curveVariance;

                // Quadratic Bezier Formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
                const u = 1 - t;
                const px = u * u * start.x + 2 * u * t * cpX + t * t * end.x;
                const py = u * u * start.y + 2 * u * t * cpY + t * t * end.y;

                // Previous position for streak / comet tail
                const tPrev = Math.max(0, t - 0.05);
                const uPrev = 1 - tPrev;
                const prevX = uPrev * uPrev * start.x + 2 * uPrev * tPrev * cpX + tPrev * tPrev * end.x;
                const prevY = uPrev * uPrev * start.y + 2 * uPrev * tPrev * cpY + tPrev * tPrev * end.y;

                // Opacity curve: Fades in smoothly as it leaves card (0 -> 0.2), fully visible in flight,
                // and dissolves smoothly behind SmartContractum core (0.7 -> 1.0)
                let alpha = 1;
                if (t < 0.2) {
                    alpha = t / 0.2; // Smooth emergence from behind card
                } else if (t > 0.65) {
                    alpha = Math.max(0, (1 - t) / 0.35); // Smooth dissolution behind SmartContractum
                }

                if (!isHovered && anyHovered) {
                    alpha *= 0.25; // Dim non-hovered streams
                }

                if (alpha <= 0.01) return;

                // Draw Specific Micro-Element Type
                ctx.save();
                ctx.globalAlpha = alpha;

                if (p.type === 'streak') {
                    // 1. Light Comet / Streak with Flow Tail
                    const grad = ctx.createLinearGradient(prevX, prevY, px, py);
                    grad.addColorStop(0, hexToRgba(node.accent, 0));
                    grad.addColorStop(1, isHovered ? '#ffffff' : node.accent);

                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = isHovered ? (p.size * 1.2) : (p.size * 0.8);
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 8;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                } else if (p.type === 'diamond') {
                    // 2. Data Diamond / Micro-Shard
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
                    const rSize = (p.size * (1 + (1 - alpha) * 0.8));
                    ctx.beginPath();
                    ctx.arc(px, py, rSize, 0, Math.PI * 2);
                    ctx.strokeStyle = node.accent;
                    ctx.lineWidth = 1.4;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 10;
                    ctx.stroke();

                } else {
                    // 4. Glowing Photon Dot / Spark
                    const dotRadius = isHovered ? (p.size * 1.2) : p.size;

                    // Outer Glow
                    ctx.beginPath();
                    ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 10;
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