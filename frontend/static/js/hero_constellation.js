/**
 * SmartContractum — Volumetric Plasma Funnel Waves & Snug Node Constellation
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
        let waveTime = 0;
        let animationFrameId = null;

        // Ambient floating particles (3 per card)
        const ambientParticles = [];
        for (let i = 0; i < 18; i++) {
            ambientParticles.push({
                cardIndex: i % 6,
                progress: (Math.floor(i / 6) * 0.33 + Math.random() * 0.2) % 1,
                speed: 0.0028 + Math.random() * 0.0015,
                size: 3.5
            });
        }

        // Active hover wave pulse streams
        const wavePackets = [];
        for (let i = 0; i < 6; i++) {
            wavePackets.push({
                progress: i * 0.166,
                speed: 0.0055,
                size: 6.5
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
            let edgeY = coreCenter.y + (cardEdge.y - coreCenter.y) * 0.45;

            return {
                x: edgeX,
                y: edgeY,
                height: 60
            };
        }

        function render() {
            if (window.innerWidth <= 1080) return;

            ctx.clearRect(0, 0, width, height);
            waveTime += 0.032;

            const containerRect = container.getBoundingClientRect();
            const coreRect = core.getBoundingClientRect();
            const rawCoreCenter = {
                x: coreRect.left - containerRect.left + coreRect.width / 2,
                y: coreRect.top - containerRect.top + coreRect.height / 2
            };

            const nodeDataList = [];
            cards.forEach(function (card) {
                const id = card.getAttribute('data-node-id');
                const accent = card.getAttribute('data-accent') || '#38bdf8';
                const cardEdge = getCardEdgeData(card, containerRect, rawCoreCenter);
                const coreEdge = getCoreEdgeData(coreRect, containerRect, cardEdge);

                nodeDataList.push({
                    id: id,
                    accent: accent,
                    cardEdge: cardEdge,
                    coreEdge: coreEdge,
                    isHovered: (hoveredNodeId === id) || isCoreHovered
                });
            });

            // Draw Funnel Waves
            nodeDataList.forEach(function (node) {
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

                const cardHalfH = start.height * 0.46;
                const coreHalfH = end.height * 0.42;

                const topPoints = [];
                const botPoints = [];
                const centerPoints = [];

                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const envelope = Math.sin(t * Math.PI);

                    // Hourglass Funnel width
                    const baseHalfW = (cardHalfH * (1 - t) + coreHalfH * t) * (1 - 0.72 * envelope) + 8;

                    // Sine wave undulation
                    const waveFreq = isHovered ? 8.0 : 6.0;
                    const waveSpeed = isHovered ? 2.6 : 1.3;
                    const waveAmp = isHovered ? (11 * envelope) : (6 * envelope);
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
                    // ======================================================
                    // ACTIVE HOVER: Volumetric Glowing 3D Plasma Funnel Wave
                    // ======================================================

                    // 1. Funnel Mesh Fill
                    ctx.beginPath();
                    ctx.moveTo(topPoints[0].x, topPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(topPoints[i].x, topPoints[i].y);
                    for (let i = steps; i >= 0; i--) ctx.lineTo(botPoints[i].x, botPoints[i].y);
                    ctx.closePath();

                    const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                    grad.addColorStop(0, hexToRgba(node.accent, 0.65));
                    grad.addColorStop(0.5, hexToRgba(node.accent, 0.40));
                    grad.addColorStop(1, hexToRgba('#38bdf8', 0.75));

                    ctx.fillStyle = grad;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 32;
                    ctx.fill();

                    // 2. Glowing Outer Boundary Lines
                    ctx.beginPath();
                    ctx.moveTo(topPoints[0].x, topPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(topPoints[i].x, topPoints[i].y);
                    ctx.strokeStyle = hexToRgba(node.accent, 0.95);
                    ctx.lineWidth = 2.5;
                    ctx.shadowBlur = 20;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(botPoints[0].x, botPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(botPoints[i].x, botPoints[i].y);
                    ctx.strokeStyle = hexToRgba(node.accent, 0.95);
                    ctx.lineWidth = 2.5;
                    ctx.shadowBlur = 20;
                    ctx.stroke();

                    // 3. Central Specular Fiber Core Line
                    ctx.beginPath();
                    ctx.moveTo(centerPoints[0].x, centerPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(centerPoints[i].x, centerPoints[i].y);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.4;
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 14;
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // 4. Volumetric Flowing Energy Packets
                    wavePackets.forEach(function (p) {
                        p.progress += p.speed;
                        if (p.progress > 1) p.progress = 0;

                        const idx = Math.min(Math.floor(p.progress * steps), steps);
                        const pt = centerPoints[idx];
                        if (!pt) return;

                        const scaleW = 1 + (pt.halfW / cardHalfH) * 0.4;

                        // Glow Halo
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, p.size * scaleW, 0, Math.PI * 2);
                        ctx.fillStyle = node.accent;
                        ctx.shadowColor = node.accent;
                        ctx.shadowBlur = 24;
                        ctx.fill();

                        // Hot White Center
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, p.size * 0.45, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    });

                } else {
                    // ======================================================
                    // IDLE STATE: CLEARLY VISIBLE, RICH PLASMA FUNNEL WAVE
                    // ======================================================

                    // 1. Visible translucent ribbon fill
                    ctx.beginPath();
                    ctx.moveTo(topPoints[0].x, topPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(topPoints[i].x, topPoints[i].y);
                    for (let i = steps; i >= 0; i--) ctx.lineTo(botPoints[i].x, botPoints[i].y);
                    ctx.closePath();

                    const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                    const alpha = anyHovered ? 0.04 : 0.20;
                    grad.addColorStop(0, hexToRgba(node.accent, alpha * 1.8));
                    grad.addColorStop(0.5, hexToRgba(node.accent, alpha * 1.2));
                    grad.addColorStop(1, hexToRgba('#38bdf8', alpha * 1.6));

                    ctx.fillStyle = grad;
                    ctx.shadowBlur = 0;
                    ctx.fill();

                    // 2. Visible undulating wave boundary lines
                    ctx.beginPath();
                    ctx.moveTo(topPoints[0].x, topPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(topPoints[i].x, topPoints[i].y);
                    ctx.strokeStyle = anyHovered ? hexToRgba(node.accent, 0.08) : hexToRgba(node.accent, 0.45);
                    ctx.lineWidth = 1.6;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(botPoints[0].x, botPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(botPoints[i].x, botPoints[i].y);
                    ctx.strokeStyle = anyHovered ? hexToRgba(node.accent, 0.08) : hexToRgba(node.accent, 0.45);
                    ctx.lineWidth = 1.6;
                    ctx.stroke();

                    // 3. Main Centerline Undulating Wave (BOLD & GLOWING)
                    ctx.beginPath();
                    ctx.moveTo(centerPoints[0].x, centerPoints[0].y);
                    for (let i = 1; i <= steps; i++) ctx.lineTo(centerPoints[i].x, centerPoints[i].y);
                    ctx.strokeStyle = anyHovered ? hexToRgba(node.accent, 0.10) : hexToRgba(node.accent, 0.75);
                    ctx.lineWidth = 2.4;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = anyHovered ? 0 : 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            });

            // 2. Ambient Flowing Photons in Idle Mode (Continual movement)
            if (hoveredNodeId === null && !isCoreHovered) {
                ambientParticles.forEach(function (p) {
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
                    const waveOffset = Math.sin(t * 6.0 - waveTime * 1.3) * (6 * envelope);

                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const px = lx + normalX * waveOffset;
                    const py = ly + normalY * waveOffset;

                    // Glowing particle
                    ctx.beginPath();
                    ctx.arc(px, py, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 12;
                    ctx.fill();

                    // White Core
                    ctx.beginPath();
                    ctx.arc(px, py, p.size * 0.45, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }

            animationFrameId = requestAnimationFrame(render);
        }

        // Hover Listeners on Satellite Cards
        cards.forEach(function (card) {
            const id = card.getAttribute('data-node-id');

            card.addEventListener('mouseenter', function () {
                hoveredNodeId = id;
                wavePackets.forEach(function (p, idx) {
                    p.progress = idx * 0.166;
                });
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