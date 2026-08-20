/**
 * SmartContractum — Volumetric Plasma Funnel Waves & Node Constellation Controller
 * File: frontend/static/js/hero_constellation.js
 */

document.addEventListener('DOMContentLoaded', () => {
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
    let waveTime = 0;
    let animationFrameId = null;

    // Ambient floating particles
    const ambientParticles = [];
    for (let i = 0; i < 14; i++) {
        ambientParticles.push({
            cardIndex: i % 6,
            progress: Math.random(),
            speed: 0.0016 + Math.random() * 0.0012,
            size: 2.4 + Math.random() * 1.4
        });
    }

    // Active wave pulse streams (volumetric packets)
    const wavePackets = [];
    for (let i = 0; i < 5; i++) {
        wavePackets.push({
            progress: i * 0.2,
            speed: 0.0038,
            size: 5.5
        });
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

    function getCardEdgeData(card, containerRect, coreCenter) {
        const rect = card.getBoundingClientRect();
        const cardCenter = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };

        const cardH = rect.height;
        let edgeX = cardCenter.x;
        let isLeft = true;

        if (cardCenter.x < coreCenter.x) {
            edgeX = rect.right - containerRect.left;
            isLeft = true;
        } else {
            edgeX = rect.left - containerRect.left;
            isLeft = false;
        }

        return {
            x: edgeX,
            y: cardCenter.y,
            height: cardH,
            isLeft: isLeft
        };
    }

    function getCoreEdgeData(coreRect, containerRect, cardEdge) {
        const coreCenter = {
            x: coreRect.left - containerRect.left + coreRect.width / 2,
            y: coreRect.top - containerRect.top + coreRect.height / 2
        };

        let edgeX = cardEdge.isLeft ? (coreRect.left - containerRect.left + 15) : (coreRect.right - containerRect.left - 15);
        let edgeY = coreCenter.y + (cardEdge.y - coreCenter.y) * 0.35;

        return {
            x: edgeX,
            y: edgeY,
            height: 64
        };
    }

    function hexToRgba(hex, alpha) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return gba(, , , );
    }

    function render() {
        if (window.innerWidth <= 1080) return;

        ctx.clearRect(0, 0, width, height);
        waveTime += 0.028;

        const containerRect = container.getBoundingClientRect();
        const coreRect = core.getBoundingClientRect();
        const rawCoreCenter = {
            x: coreRect.left - containerRect.left + coreRect.width / 2,
            y: coreRect.top - containerRect.top + coreRect.height / 2
        };

        const nodeDataList = [];
        cards.forEach((card) => {
            const id = card.getAttribute('data-node-id');
            const accent = card.getAttribute('data-accent') || '#38bdf8';
            const cardEdge = getCardEdgeData(card, containerRect, rawCoreCenter);
            const coreEdge = getCoreEdgeData(coreRect, containerRect, cardEdge);

            nodeDataList.push({
                id,
                accent,
                cardEdge,
                coreEdge,
                isHovered: (hoveredNodeId === id) || isCoreHovered
            });
        });

        // Draw Funnel Waves (Starts at button height, narrows in middle, widens at core)
        nodeDataList.forEach((node) => {
            const start = node.cardEdge;
            const end = node.coreEdge;
            const isHovered = node.isHovered;
            const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.hypot(dx, dy);
            const normalX = -dy / dist;
            const normalY = dx / dist;
            const steps = 60;

            const cardHalfH = start.height * 0.48; // Full button height match
            const coreHalfH = end.height * 0.45;

            // Generate Top & Bottom Contour Points
            const topPoints = [];
            const botPoints = [];
            const centerPoints = [];

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const lx = start.x + dx * t;
                const ly = start.y + dy * t;
                const envelope = Math.sin(t * Math.PI);

                // Hourglass / Funnel width formula: Wide at start, narrow in middle, widens at core
                const baseHalfW = (cardHalfH * (1 - t) + coreHalfH * t) * (1 - 0.76 * envelope) + 8;

                // Wave undulation
                const waveFreq = isHovered ? 7.5 : 5.5;
                const waveSpeed = isHovered ? 2.4 : 1.0;
                const waveAmp = isHovered ? (10 * envelope) : (4 * envelope);
                const waveOffset = Math.sin(t * waveFreq - waveTime * waveSpeed) * waveAmp;

                const cx = lx + normalX * waveOffset;
                const cy = ly + normalY * waveOffset;

                centerPoints.push({ x: cx, y: cy, t: t, halfW: baseHalfW });

                topPoints.push({
                    x: cx + normalX * baseHalfW,
                    y: cy + normalY * baseHalfW
                });

                botPoints.push({
                    x: cx - normalX * baseHalfW,
                    y: cy - normalY * baseHalfW
                });
            }

            if (isHovered) {
                // ==========================================================
                // ACTIVE HOVER: Volumetric Glowing Plasma Funnel Ribbon
                // ==========================================================

                // 1. Fill Funnel Mesh with Gradient
                ctx.beginPath();
                ctx.moveTo(topPoints[0].x, topPoints[0].y);
                for (let i = 1; i <= steps; i++) {
                    ctx.lineTo(topPoints[i].x, topPoints[i].y);
                }
                for (let i = steps; i >= 0; i--) {
                    ctx.lineTo(botPoints[i].x, botPoints[i].y);
                }
                ctx.closePath();

                const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                grad.addColorStop(0, hexToRgba(node.accent, 0.55));
                grad.addColorStop(0.5, hexToRgba(node.accent, 0.35));
                grad.addColorStop(1, hexToRgba('#38bdf8', 0.65));

                ctx.fillStyle = grad;
                ctx.shadowColor = node.accent;
                ctx.shadowBlur = 28;
                ctx.fill();

                // 2. Top & Bottom Glowing Outer Boundary Lines
                ctx.beginPath();
                ctx.moveTo(topPoints[0].x, topPoints[0].y);
                for (let i = 1; i <= steps; i++) {
                    ctx.lineTo(topPoints[i].x, topPoints[i].y);
                }
                ctx.strokeStyle = hexToRgba(node.accent, 0.85);
                ctx.lineWidth = 2.2;
                ctx.shadowBlur = 18;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(botPoints[0].x, botPoints[0].y);
                for (let i = 1; i <= steps; i++) {
                    ctx.lineTo(botPoints[i].x, botPoints[i].y);
                }
                ctx.strokeStyle = hexToRgba(node.accent, 0.85);
                ctx.lineWidth = 2.2;
                ctx.shadowBlur = 18;
                ctx.stroke();

                // 3. Central Specular Fiber Core Line
                ctx.beginPath();
                ctx.moveTo(centerPoints[0].x, centerPoints[0].y);
                for (let i = 1; i <= steps; i++) {
                    ctx.lineTo(centerPoints[i].x, centerPoints[i].y);
                }
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.0;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // 4. Volumetric Flowing Wave Energy Packets
                wavePackets.forEach((p) => {
                    p.progress += p.speed;
                    if (p.progress > 1) p.progress = 0;

                    const idx = Math.min(Math.floor(p.progress * steps), steps);
                    const pt = centerPoints[idx];
                    if (!pt) return;

                    const scaleW = 1 + (pt.halfW / cardHalfH) * 0.4;

                    // Volumetric Glow Halo
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, p.size * scaleW, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 22;
                    ctx.fill();

                    // Hot White Core
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, p.size * 0.45, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });

            } else {
                // ==========================================================
                // IDLE STATE: Subtle, Faint, Elegant Plasma Funnel Ribbon
                // ==========================================================
                ctx.beginPath();
                ctx.moveTo(topPoints[0].x, topPoints[0].y);
                for (let i = 1; i <= steps; i++) {
                    ctx.lineTo(topPoints[i].x, topPoints[i].y);
                }
                for (let i = steps; i >= 0; i--) {
                    ctx.lineTo(botPoints[i].x, botPoints[i].y);
                }
                ctx.closePath();

                const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                const alpha = anyHovered ? 0.02 : 0.08;
                grad.addColorStop(0, hexToRgba(node.accent, alpha * 1.5));
                grad.addColorStop(0.5, hexToRgba(node.accent, alpha * 0.8));
                grad.addColorStop(1, hexToRgba('#38bdf8', alpha * 1.2));

                ctx.fillStyle = grad;
                ctx.shadowBlur = 0;
                ctx.fill();

                // Faint center guideline
                ctx.beginPath();
                ctx.moveTo(centerPoints[0].x, centerPoints[0].y);
                for (let i = 1; i <= steps; i++) {
                    ctx.lineTo(centerPoints[i].x, centerPoints[i].y);
                }
                ctx.strokeStyle = anyHovered ? 'rgba(56, 189, 248, 0.04)' : 'rgba(56, 189, 248, 0.16)';
                ctx.lineWidth = 1.4;
                ctx.stroke();
            }
        });

        // Ambient particles in idle
        if (hoveredNodeId === null && !isCoreHovered) {
            ambientParticles.forEach((p) => {
                const node = nodeDataList[p.cardIndex];
                if (!node) return;

                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;

                const start = node.cardEdge;
                const end = node.coreEdge;
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / dist;
                const normalY = dx / dist;

                const t = p.progress;
                const envelope = Math.sin(t * Math.PI);
                const waveOffset = Math.sin(t * 5.5 - waveTime * 1.0) * (4 * envelope);

                const lx = start.x + dx * t;
                const ly = start.y + dy * t;
                const px = lx + normalX * waveOffset;
                const py = ly + normalY * waveOffset;

                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = node.accent;
                ctx.shadowColor = node.accent;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }

        animationFrameId = requestAnimationFrame(render);
    }

    // Hover Listeners on Satellite Cards
    cards.forEach((card) => {
        const id = card.getAttribute('data-node-id');

        card.addEventListener('mouseenter', () => {
            hoveredNodeId = id;
            wavePackets.forEach((p, idx) => {
                p.progress = idx * 0.2;
            });
        });

        card.addEventListener('mouseleave', () => {
            hoveredNodeId = null;
        });
    });

    // Hover Listeners on Central Core
    core.addEventListener('mouseenter', () => {
        isCoreHovered = true;
    });

    core.addEventListener('mouseleave', () => {
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
        specialistModal.addEventListener('click', (e) => {
            if (e.target === specialistModal) closeSpecialistModal();
        });
    }

    // Debounced Resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    }, { passive: true });

    setTimeout(resize, 120);
});