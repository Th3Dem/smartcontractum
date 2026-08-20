/**
 * SmartContractum — Hero Constellation Interactive Graph v4.0.0
 * Ultra-Fluid Detached Button Glass Shards & Smooth Luminous Trails Engine
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

        // Button Fragment Shards & Micro-Crystal Particle System
        const SHARDS_PER_NODE = 9;
        const TRAIL_MAX_LENGTH = 14;
        const particles = [];

        const SHARD_TYPES = [
            'triangle-shard',   // 1. Triangular glass splinter
            'trapezoid-glass',  // 2. Asymmetric faceted trapezoid
            'hex-crystal',      // 3. Hexagonal crystal prism
            'rhombus-diamond',  // 4. Slender rhombus diamond
            'curved-splinter',  // 5. Elongated glass needle / splinter
            'rect-chip'         // 6. Micro rounded glass tile
        ];

        function createFragmentParticle(cardIndex, index) {
            const type = SHARD_TYPES[index % SHARD_TYPES.length];

            // Shard dimensions (varied from subtle 5px to prominent 16px)
            const baseScale = 0.75 + Math.random() * 0.75;
            const w = (6 + Math.random() * 10) * baseScale;
            const h = (4 + Math.random() * 7) * baseScale;

            return {
                cardIndex: cardIndex,
                type: type,
                progress: Math.random(), // 0.0 to 1.0 along the trajectory
                // Slower, much more fluid and hypnotic flight speed
                speed: 0.0011 + Math.random() * 0.0015,
                width: w,
                height: h,
                size: (w + h) / 2,
                angle: Math.random() * Math.PI * 2,
                // Gentle, smooth tumbling
                rotSpeed: (Math.random() - 0.5) * 0.028,
                curveVariance: (Math.random() - 0.5) * 110, // Wide natural arc
                
                // Spawn position along the facing edge of the button
                spawnNormY: 0.1 + Math.random() * 0.8, // 10% to 90% along vertical edge
                spawnDepth: Math.random() * 5,          // 0 to 5px inside edge

                // Destination landing offset in core
                destOffsetX: (Math.random() - 0.5) * 44,
                destOffsetY: (Math.random() - 0.5) * 22,

                // Multi-segment historical trail
                trail: []
            };
        }

        function initParticles() {
            particles.length = 0;
            cards.forEach(function (_, cardIndex) {
                for (let i = 0; i < SHARDS_PER_NODE; i++) {
                    particles.push(createFragmentParticle(cardIndex, i));
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
            const left = rect.left - containerRect.left;
            const top = rect.top - containerRect.top;
            return {
                left: left,
                top: top,
                right: left + rect.width,
                bottom: top + rect.height,
                centerX: left + rect.width / 2,
                centerY: top + rect.height / 2,
                width: rect.width,
                height: rect.height,
                // Determine if card is on the left or right side of the screen
                isLeftSide: (left + rect.width / 2) < (containerRect.width / 2)
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

            // Collect real-time card bounding boxes and accent colors
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

            // Update & Draw Each Fluid Fragment Shard
            particles.forEach(function (p) {
                const node = nodeData[p.cardIndex];
                if (!node) return;

                const isHovered = node.isHovered;
                const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

                // Smooth speed multiplier (calm glide by default, gentle boost on hover)
                const currentSpeed = isHovered ? (p.speed * 1.45) : (anyHovered ? p.speed * 0.7 : p.speed);
                p.progress += currentSpeed;
                p.angle += isHovered ? (p.rotSpeed * 1.35) : p.rotSpeed;

                // Loop reset when reaching center core
                if (p.progress >= 1) {
                    p.progress = 0;
                    p.trail = [];
                    p.curveVariance = (Math.random() - 0.5) * 110;
                    p.spawnNormY = 0.1 + Math.random() * 0.8;
                    p.spawnDepth = Math.random() * 5;
                    p.destOffsetX = (Math.random() - 0.5) * 44;
                    p.destOffsetY = (Math.random() - 0.5) * 22;
                }

                // 1. Precise Edge Detachment:
                // Left-side buttons: detach from the RIGHT edge facing the core.
                // Right-side buttons: detach from the LEFT edge facing the core.
                let startX, startY;
                if (node.bounds.isLeftSide) {
                    startX = node.bounds.right - p.spawnDepth;
                    startY = node.bounds.top + p.spawnNormY * node.bounds.height;
                } else {
                    startX = node.bounds.left + p.spawnDepth;
                    startY = node.bounds.top + p.spawnNormY * node.bounds.height;
                }

                // Center destination landing coordinates
                const endX = coreCenter.x + p.destOffsetX;
                const endY = coreCenter.y + p.destOffsetY;

                const t = p.progress;

                // Curved Trajectory with Bezier Normal Vector
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const dx = endX - startX;
                const dy = endY - startY;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / (dist || 1);
                const normalY = dx / (dist || 1);

                const cpX = midX + normalX * p.curveVariance;
                const cpY = midY + normalY * p.curveVariance;

                // Smooth quadratic Bezier coordinates
                const u = 1 - t;
                const px = u * u * startX + 2 * u * t * cpX + t * t * endX;
                const py = u * u * startY + 2 * u * t * cpY + t * t * endY;

                // Smooth Opacity & Scale Dynamics
                // - t < 0.15: Smooth peeling/detachment growth from edge (scale: 0.3 -> 1.0, alpha: 0 -> 1.0)
                // - 0.15 <= t <= 0.68: Steady luminous flight
                // - t > 0.68: Graceful dissolution and absorption into core
                let alpha = 1.0;
                let scale = 1.0;

                if (t < 0.15) {
                    const normT = t / 0.15;
                    alpha = normT;
                    scale = 0.35 + 0.65 * normT;
                } else if (t > 0.68) {
                    const fadeT = (t - 0.68) / 0.32;
                    alpha = Math.max(0, 1.0 - fadeT);
                    scale = 1.0 - 0.45 * fadeT;
                }

                if (!isHovered && anyHovered) {
                    alpha *= 0.25;
                }

                if (alpha <= 0.01) return;

                // Record historical position for smooth tapered ribbon trail
                p.trail.unshift({ x: px, y: py, alpha: alpha, scale: scale });
                if (p.trail.length > TRAIL_MAX_LENGTH) {
                    p.trail.pop();
                }

                // ==========================================================
                // A. DRAW GLOWING TAPERED FADING TRAIL (Шлейф осколка)
                // ==========================================================
                if (p.trail.length >= 2) {
                    for (let i = 0; i < p.trail.length - 1; i++) {
                        const pt1 = p.trail[i];
                        const pt2 = p.trail[i + 1];
                        const trailRatio = 1 - (i / p.trail.length);
                        const segmentAlpha = alpha * Math.pow(trailRatio, 1.8) * (isHovered ? 0.75 : 0.48);

                        if (segmentAlpha <= 0.01) continue;

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(pt1.x, pt1.y);
                        ctx.lineTo(pt2.x, pt2.y);
                        ctx.strokeStyle = hexToRgba(node.accent, segmentAlpha);
                        ctx.lineWidth = Math.max(0.6, (p.size * 0.35 * trailRatio * (isHovered ? 1.4 : 1.0)));
                        ctx.lineCap = 'round';
                        if (isHovered) {
                            ctx.shadowColor = node.accent;
                            ctx.shadowBlur = 6;
                        }
                        ctx.stroke();
                        ctx.restore();
                    }
                }

                // ==========================================================
                // B. DRAW DETACHED BUTTON GLASS SHARD (Разнообразные кусочки)
                // ==========================================================
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(px, py);
                ctx.rotate(p.angle);
                ctx.scale(scale, scale);

                const sw = p.width * (isHovered ? 1.2 : 1.0);
                const sh = p.height * (isHovered ? 1.2 : 1.0);

                // 1. TRIANGLE SHARD (Треугольный скол)
                if (p.type === 'triangle-shard') {
                    ctx.beginPath();
                    ctx.moveTo(0, -sh * 0.9);
                    ctx.lineTo(sw * 0.6, sh * 0.7);
                    ctx.lineTo(-sw * 0.5, sh * 0.5);
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba('#0f172a', 0.90);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = isHovered ? 1.5 : 1.1;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 15 : 7;
                    ctx.stroke();

                    // Specular Apex Gleam
                    ctx.beginPath();
                    ctx.arc(0, -sh * 0.9, 1, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                // 2. TRAPEZOID GLASS (Трапециевидный граненый осколок)
                } else if (p.type === 'trapezoid-glass') {
                    ctx.beginPath();
                    ctx.moveTo(-sw * 0.4, -sh * 0.5);
                    ctx.lineTo(sw * 0.5, -sh * 0.4);
                    ctx.lineTo(sw * 0.35, sh * 0.5);
                    ctx.lineTo(-sw * 0.5, sh * 0.4);
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba('#1e293b', 0.92);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = isHovered ? 1.4 : 1.0;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 6;
                    ctx.stroke();

                    // Internal Glass Refraction line
                    ctx.beginPath();
                    ctx.moveTo(-sw * 0.2, -sh * 0.3);
                    ctx.lineTo(sw * 0.2, sh * 0.3);
                    ctx.strokeStyle = hexToRgba(node.accent, 0.45);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();

                // 3. HEX CRYSTAL (Шестигранная микро-призма)
                } else if (p.type === 'hex-crystal') {
                    const r = (sw + sh) / 4;
                    ctx.beginPath();
                    for (let a = 0; a < 6; a++) {
                        const angle = (a * Math.PI) / 3;
                        const hx = Math.cos(angle) * r;
                        const hy = Math.sin(angle) * r * 0.8;
                        if (a === 0) ctx.moveTo(hx, hy);
                        else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba('#0b1426', 0.94);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = isHovered ? 1.4 : 1.0;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 7;
                    ctx.stroke();

                    // Center Core Glow Dot
                    ctx.beginPath();
                    ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                // 4. RHOMBUS DIAMOND (Ромбовидный осколок)
                } else if (p.type === 'rhombus-diamond') {
                    ctx.beginPath();
                    ctx.moveTo(0, -sh);
                    ctx.lineTo(sw * 0.6, 0);
                    ctx.lineTo(0, sh);
                    ctx.lineTo(-sw * 0.6, 0);
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba('#0f172a', 0.88);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = isHovered ? 1.4 : 1.0;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 7;
                    ctx.stroke();

                // 5. CURVED SPLINTER (Продолговатый осколок-стрелка)
                } else if (p.type === 'curved-splinter') {
                    ctx.beginPath();
                    ctx.moveTo(-sw * 0.7, 0);
                    ctx.quadraticCurveTo(0, -sh * 0.6, sw * 0.7, 0);
                    ctx.quadraticCurveTo(0, sh * 0.6, -sw * 0.7, 0);
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba(node.accent, isHovered ? 0.35 : 0.20);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = 1.1;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 8;
                    ctx.stroke();

                // 6. RECT CHIP (Скругленный стеклянный микро-чип кнопки)
                } else {
                    ctx.beginPath();
                    ctx.roundRect(-sw / 2, -sh / 2, sw, sh, 1.5);
                    ctx.fillStyle = hexToRgba('#1e293b', 0.90);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = isHovered ? 1.5 : 1.1;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 7;
                    ctx.stroke();

                    // Specular Corner Highlight
                    ctx.beginPath();
                    ctx.arc(-sw / 2 + 1.2, -sh / 2 + 1.2, 0.9, 0, Math.PI * 2);
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
