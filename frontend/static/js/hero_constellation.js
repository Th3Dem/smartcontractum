/**
 * SmartContractum — Hero Constellation Interactive Graph v4.2.0
 * Multi-Tier Particle Stream: Luminous Fading Trails & Corner Micro-Dots Swarm
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

        // Configuration
        const MAIN_PARTICLES_PER_NODE = 9;
        const MICRO_DOTS_PER_NODE = 22; // Rich swarm of fine corner/border sparkles
        const TRAIL_LENGTH = 10;

        const mainParticles = [];
        const microDots = [];

        // 1. Main Particles with Dedicated Fading Trails
        function createMainParticle(cardIndex) {
            const types = ['streak', 'diamond', 'ring', 'spark'];
            const type = types[Math.floor(Math.random() * types.length)];

            return {
                cardIndex: cardIndex,
                type: type,
                progress: Math.random(),
                speed: 0.0022 + Math.random() * 0.0024,
                size: 2.4 + Math.random() * 3.4,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
                curveVariance: (Math.random() - 0.5) * 110,
                spawnOffsetX: (Math.random() - 0.5) * 0.84,
                spawnOffsetY: (Math.random() - 0.5) * 0.78,
                destOffsetX: (Math.random() - 0.5) * 55,
                destOffsetY: (Math.random() - 0.5) * 28,
                trail: [] // History of recent positions
            };
        }

        // 2. Fine Micro-Dots Streaming from all 4 Corners and Frame Edges
        function createMicroDot(cardIndex) {
            // Spawn location from corners or border perimeter
            const corner = Math.floor(Math.random() * 5);
            let offX, offY;

            if (corner === 0) {
                // Top-Left corner
                offX = -0.45 + Math.random() * 0.12;
                offY = -0.42 + Math.random() * 0.12;
            } else if (corner === 1) {
                // Top-Right corner
                offX = 0.45 - Math.random() * 0.12;
                offY = -0.42 + Math.random() * 0.12;
            } else if (corner === 2) {
                // Bottom-Left corner
                offX = -0.45 + Math.random() * 0.12;
                offY = 0.42 - Math.random() * 0.12;
            } else if (corner === 3) {
                // Bottom-Right corner
                offX = 0.45 - Math.random() * 0.12;
                offY = 0.42 - Math.random() * 0.12;
            } else {
                // Frame perimeter edge
                const side = Math.floor(Math.random() * 4);
                if (side === 0) { offX = (Math.random() - 0.5) * 0.9; offY = -0.45; }
                else if (side === 1) { offX = 0.45; offY = (Math.random() - 0.5) * 0.85; }
                else if (side === 2) { offX = (Math.random() - 0.5) * 0.9; offY = 0.45; }
                else { offX = -0.45; offY = (Math.random() - 0.5) * 0.85; }
            }

            return {
                cardIndex: cardIndex,
                progress: Math.random(),
                speed: 0.0018 + Math.random() * 0.0028,
                size: 1.0 + Math.random() * 1.6, // Fine micro-dot
                pulsePhase: Math.random() * Math.PI * 2,
                curveVariance: (Math.random() - 0.5) * 90,
                spawnOffsetX: offX,
                spawnOffsetY: offY,
                destOffsetX: (Math.random() - 0.5) * 60,
                destOffsetY: (Math.random() - 0.5) * 30,
                prevX: 0,
                prevY: 0
            };
        }

        function initParticles() {
            mainParticles.length = 0;
            microDots.length = 0;

            cards.forEach(function (_, cardIndex) {
                for (let i = 0; i < MAIN_PARTICLES_PER_NODE; i++) {
                    mainParticles.push(createMainParticle(cardIndex));
                }
                for (let j = 0; j < MICRO_DOTS_PER_NODE; j++) {
                    microDots.push(createMicroDot(cardIndex));
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

            if (mainParticles.length === 0) {
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

            // ==============================================================
            // 1. RENDER MICRO-DOTS SWARM (Летят из всех 4 углов и рамки)
            // ==============================================================
            microDots.forEach(function (p) {
                const node = nodeData[p.cardIndex];
                if (!node) return;

                const isHovered = node.isHovered;
                const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

                const currentSpeed = isHovered ? (p.speed * 1.5) : (anyHovered ? p.speed * 0.75 : p.speed);
                p.progress += currentSpeed;

                if (p.progress >= 1) {
                    p.progress = 0;
                    p.curveVariance = (Math.random() - 0.5) * 90;
                    p.destOffsetX = (Math.random() - 0.5) * 60;
                    p.destOffsetY = (Math.random() - 0.5) * 30;
                }

                const startX = node.bounds.x + p.spawnOffsetX * node.bounds.width;
                const startY = node.bounds.y + p.spawnOffsetY * node.bounds.height;
                const endX = coreCenter.x + p.destOffsetX;
                const endY = coreCenter.y + p.destOffsetY;

                const t = p.progress;
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const dx = endX - startX;
                const dy = endY - startY;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / (dist || 1);
                const normalY = dx / (dist || 1);

                const cpX = midX + normalX * p.curveVariance;
                const cpY = midY + normalY * p.curveVariance;

                const u = 1 - t;
                const px = u * u * startX + 2 * u * t * cpX + t * t * endX;
                const py = u * u * startY + 2 * u * t * cpY + t * t * endY;

                // Previous position for fine micro-tail
                const tPrev = Math.max(0, t - 0.035);
                const uPrev = 1 - tPrev;
                const prevX = uPrev * uPrev * startX + 2 * uPrev * tPrev * cpX + tPrev * tPrev * endX;
                const prevY = uPrev * uPrev * startY + 2 * uPrev * tPrev * cpY + tPrev * tPrev * endY;

                let alpha = 1;
                if (t < 0.15) {
                    alpha = t / 0.15;
                } else if (t > 0.70) {
                    alpha = Math.max(0, (1 - t) / 0.30);
                }

                // Shimmering twinkle
                alpha *= (0.65 + 0.35 * Math.sin(p.pulsePhase + t * 18));

                if (!isHovered && anyHovered) {
                    alpha *= 0.25;
                }

                if (alpha <= 0.01) return;

                ctx.save();
                ctx.globalAlpha = alpha;

                // Micro spark line/trail
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(px, py);
                ctx.strokeStyle = hexToRgba(node.accent, isHovered ? 0.9 : 0.65);
                ctx.lineWidth = isHovered ? (p.size * 1.2) : p.size;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Micro dot head
                ctx.beginPath();
                ctx.arc(px, py, p.size * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? '#ffffff' : node.accent;
                ctx.fill();

                ctx.restore();
            });

            // ==============================================================
            // 2. RENDER MAIN PARTICLES WITH FADING TRAILS (Шлейф за каждым)
            // ==============================================================
            mainParticles.forEach(function (p) {
                const node = nodeData[p.cardIndex];
                if (!node) return;

                const isHovered = node.isHovered;
                const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

                const currentSpeed = isHovered ? (p.speed * 1.55) : (anyHovered ? p.speed * 0.75 : p.speed);
                p.progress += currentSpeed;
                p.angle += p.rotSpeed;

                if (p.progress >= 1) {
                    p.progress = 0;
                    p.trail = [];
                    p.curveVariance = (Math.random() - 0.5) * 110;
                    p.spawnOffsetX = (Math.random() - 0.5) * 0.84;
                    p.spawnOffsetY = (Math.random() - 0.5) * 0.78;
                    p.destOffsetX = (Math.random() - 0.5) * 55;
                    p.destOffsetY = (Math.random() - 0.5) * 28;
                }

                const startX = node.bounds.x + p.spawnOffsetX * node.bounds.width;
                const startY = node.bounds.y + p.spawnOffsetY * node.bounds.height;
                const endX = coreCenter.x + p.destOffsetX;
                const endY = coreCenter.y + p.destOffsetY;

                const t = p.progress;
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const dx = endX - startX;
                const dy = endY - startY;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / (dist || 1);
                const normalY = dx / (dist || 1);

                const cpX = midX + normalX * p.curveVariance;
                const cpY = midY + normalY * p.curveVariance;

                const u = 1 - t;
                const px = u * u * startX + 2 * u * t * cpX + t * t * endX;
                const py = u * u * startY + 2 * u * t * cpY + t * t * endY;

                let alpha = 1;
                if (t < 0.16) {
                    alpha = t / 0.16;
                } else if (t > 0.66) {
                    alpha = Math.max(0, (1 - t) / 0.34);
                }

                if (!isHovered && anyHovered) {
                    alpha *= 0.25;
                }

                if (alpha <= 0.01) return;

                // Push position to fading trail buffer
                p.trail.unshift({ x: px, y: py, alpha: alpha });
                if (p.trail.length > TRAIL_LENGTH) {
                    p.trail.pop();
                }

                // --- 2.1 DRAW LUMINOUS FADING TRAIL (Шлейф) ---
                if (p.trail.length >= 2) {
                    for (let i = 0; i < p.trail.length - 1; i++) {
                        const pt1 = p.trail[i];
                        const pt2 = p.trail[i + 1];
                        const trailRatio = 1 - (i / p.trail.length);
                        const segmentAlpha = alpha * Math.pow(trailRatio, 1.6) * (isHovered ? 0.8 : 0.55);

                        if (segmentAlpha <= 0.01) continue;

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(pt1.x, pt1.y);
                        ctx.lineTo(pt2.x, pt2.y);
                        ctx.strokeStyle = hexToRgba(node.accent, segmentAlpha);
                        ctx.lineWidth = Math.max(0.6, p.size * 0.45 * trailRatio * (isHovered ? 1.3 : 1.0));
                        ctx.lineCap = 'round';
                        if (isHovered) {
                            ctx.shadowColor = node.accent;
                            ctx.shadowBlur = 8;
                        }
                        ctx.stroke();
                        ctx.restore();
                    }
                }

                // --- 2.2 DRAW MAIN PARTICLE HEAD ---
                ctx.save();
                ctx.globalAlpha = alpha;

                if (p.type === 'streak') {
                    const ptPrev = p.trail[1] || { x: px, y: py };
                    const grad = ctx.createLinearGradient(ptPrev.x, ptPrev.y, px, py);
                    grad.addColorStop(0, hexToRgba(node.accent, 0));
                    grad.addColorStop(1, isHovered ? '#ffffff' : node.accent);

                    ctx.beginPath();
                    ctx.moveTo(ptPrev.x, ptPrev.y);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = isHovered ? (p.size * 1.3) : (p.size * 0.95);
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 8;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                } else if (p.type === 'diamond') {
                    ctx.translate(px, py);
                    ctx.rotate(p.angle);
                    const dSize = isHovered ? (p.size * 1.3) : p.size;

                    ctx.beginPath();
                    ctx.moveTo(0, -dSize);
                    ctx.lineTo(dSize * 0.9, 0);
                    ctx.lineTo(0, dSize);
                    ctx.lineTo(-dSize * 0.9, 0);
                    ctx.closePath();

                    ctx.fillStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 8;
                    ctx.fill();

                } else if (p.type === 'ring') {
                    const rSize = (p.size * (1 + (1 - alpha) * 0.65));
                    ctx.beginPath();
                    ctx.arc(px, py, rSize, 0, Math.PI * 2);
                    ctx.strokeStyle = node.accent;
                    ctx.lineWidth = 1.3;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 10;
                    ctx.stroke();

                } else {
                    // Photon Spark
                    const dotRadius = isHovered ? (p.size * 1.2) : p.size;

                    ctx.beginPath();
                    ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 18 : 10;
                    ctx.fill();

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
