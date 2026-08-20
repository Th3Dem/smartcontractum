/**
 * SmartContractum — Hero Constellation Interactive Graph v3.90
 * Dynamic Particle Streams with Detached Button Glass Shards & Laser Synapses
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
        const SHARDS_PER_NODE = 10;
        const totalParticles = cards.length * SHARDS_PER_NODE;
        const particles = [];

        function createFragmentParticle(cardIndex, index) {
            const types = ['glass-shard', 'crystal-chip', 'facet-tile', 'luminous-trail', 'photon-core'];
            const type = types[index % types.length];

            // Shard geometry
            const shardWidth = 6 + Math.random() * 8; // 6px to 14px
            const shardHeight = 4 + Math.random() * 6; // 4px to 10px

            return {
                cardIndex: cardIndex,
                type: type,
                progress: Math.random(), // 0.0 to 1.0 along the trajectory
                speed: 0.0035 + Math.random() * 0.0038,
                size: 2.5 + Math.random() * 3.5,
                shardWidth: shardWidth,
                shardHeight: shardHeight,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.08,
                curveVariance: (Math.random() - 0.5) * 120, // Wide natural arc
                // Spawn origin on the button perimeter
                spawnAngle: Math.random() * Math.PI * 2,
                spawnOffsetX: (Math.random() - 0.5) * 0.88,
                spawnOffsetY: (Math.random() - 0.5) * 0.82,
                // Central landing offset
                destOffsetX: (Math.random() - 0.5) * 50,
                destOffsetY: (Math.random() - 0.5) * 24
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

            // Update & Draw Button Fragment Shards & Energy Streams
            particles.forEach(function (p) {
                const node = nodeData[p.cardIndex];
                if (!node) return;

                const isHovered = node.isHovered;
                const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

                // Gentle speed boost on hover
                const currentSpeed = isHovered ? (p.speed * 1.5) : (anyHovered ? p.speed * 0.7 : p.speed);
                p.progress += currentSpeed;
                p.angle += isHovered ? (p.rotSpeed * 1.5) : p.rotSpeed;

                if (p.progress >= 1) {
                    p.progress = 0;
                    p.curveVariance = (Math.random() - 0.5) * 120;
                    p.spawnOffsetX = (Math.random() - 0.5) * 0.88;
                    p.spawnOffsetY = (Math.random() - 0.5) * 0.82;
                    p.destOffsetX = (Math.random() - 0.5) * 50;
                    p.destOffsetY = (Math.random() - 0.5) * 24;
                }

                // Start position directly on the button's volumetric surface/border
                const startX = node.bounds.x + p.spawnOffsetX * node.bounds.width;
                const startY = node.bounds.y + p.spawnOffsetY * node.bounds.height;

                // Destination point behind SmartContractum center core
                const endX = coreCenter.x + p.destOffsetX;
                const endY = coreCenter.y + p.destOffsetY;

                const t = p.progress;

                // Curved Trajectory with Normal Vector Displacement
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const dx = endX - startX;
                const dy = endY - startY;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / dist;
                const normalY = dx / dist;

                const cpX = midX + normalX * p.curveVariance;
                const cpY = midY + normalY * p.curveVariance;

                // Quadratic Bezier Position
                const u = 1 - t;
                const px = u * u * startX + 2 * u * t * cpX + t * t * endX;
                const py = u * u * startY + 2 * u * t * cpY + t * t * endY;

                // Previous position for comet tail
                const tPrev = Math.max(0, t - 0.05);
                const uPrev = 1 - tPrev;
                const prevX = uPrev * uPrev * startX + 2 * uPrev * tPrev * cpX + tPrev * tPrev * endX;
                const prevY = uPrev * uPrev * startY + 2 * uPrev * tPrev * cpY + tPrev * tPrev * endY;

                // Smooth Detachment & Dissolution Opacity
                let alpha = 1;
                if (t < 0.14) {
                    alpha = t / 0.14; // Smooth peeling off / detachment from button
                } else if (t > 0.68) {
                    alpha = Math.max(0, (1 - t) / 0.32); // Fusing into center core
                }

                if (!isHovered && anyHovered) {
                    alpha *= 0.22; // Dim unhovered streams
                }

                if (alpha <= 0.01) return;

                ctx.save();
                ctx.globalAlpha = alpha;

                // 1. BUTTON FRAGMENT: GLASS SHARD (Кусочек стеклянной кнопки с неоновой кромкой)
                if (p.type === 'glass-shard') {
                    ctx.translate(px, py);
                    ctx.rotate(p.angle);

                    const scale = isHovered ? 1.25 : 1.0;
                    const sw = p.shardWidth * scale;
                    const sh = p.shardHeight * scale;

                    // Shard Dark Glass Body (Matching button card fill)
                    ctx.beginPath();
                    ctx.roundRect(-sw / 2, -sh / 2, sw, sh, 2);
                    ctx.fillStyle = hexToRgba('#0f172a', 0.85);
                    ctx.fill();

                    // Glowing Accent Border (Matching button's illuminated rim)
                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = isHovered ? 1.6 : 1.1;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 7;
                    ctx.stroke();

                    // Specular Corner Glow
                    ctx.beginPath();
                    ctx.arc(-sw / 2 + 1.5, -sh / 2 + 1.5, 1, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();

                // 2. BUTTON FRAGMENT: CRYSTAL CHIP (Кристаллический осколок-ромб)
                } else if (p.type === 'crystal-chip') {
                    ctx.translate(px, py);
                    ctx.rotate(p.angle);

                    const cSize = (isHovered ? p.size * 1.3 : p.size) * 1.5;

                    ctx.beginPath();
                    ctx.moveTo(0, -cSize);
                    ctx.lineTo(cSize * 0.85, 0);
                    ctx.lineTo(0, cSize);
                    ctx.lineTo(-cSize * 0.85, 0);
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba('#1e293b', 0.90);
                    ctx.fill();

                    ctx.strokeStyle = isHovered ? '#ffffff' : node.accent;
                    ctx.lineWidth = 1.2;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 14 : 7;
                    ctx.stroke();

                // 3. BUTTON FRAGMENT: FACET TILE (Граненая микро-плитка)
                } else if (p.type === 'facet-tile') {
                    ctx.translate(px, py);
                    ctx.rotate(p.angle);

                    const tSize = isHovered ? p.size * 1.4 : p.size;

                    ctx.beginPath();
                    ctx.moveTo(-tSize, -tSize * 0.6);
                    ctx.lineTo(tSize * 0.6, -tSize);
                    ctx.lineTo(tSize, tSize * 0.6);
                    ctx.lineTo(-tSize * 0.6, tSize);
                    ctx.closePath();

                    ctx.fillStyle = hexToRgba(node.accent, isHovered ? 0.35 : 0.20);
                    ctx.fill();

                    ctx.strokeStyle = node.accent;
                    ctx.lineWidth = 1.0;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 8;
                    ctx.stroke();

                // 4. LUMINOUS TAIL / STREAM (Световой шлейф за отделившимся осколком)
                } else if (p.type === 'luminous-trail') {
                    const grad = ctx.createLinearGradient(prevX, prevY, px, py);
                    grad.addColorStop(0, hexToRgba(node.accent, 0));
                    grad.addColorStop(1, isHovered ? '#ffffff' : node.accent);

                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = isHovered ? (p.size * 1.1) : (p.size * 0.75);
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 8;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                // 5. PHOTON SPARK (Яркая энергетическая искра)
                } else {
                    const dotRadius = isHovered ? (p.size * 1.1) : (p.size * 0.85);

                    ctx.beginPath();
                    ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = isHovered ? 16 : 9;
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
