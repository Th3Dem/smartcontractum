/**
 * SmartContractum — Volumetric 3D Waves & Node Constellation Controller
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
    for (let i = 0; i < 12; i++) {
        ambientParticles.push({
            cardIndex: i % 6,
            progress: Math.random(),
            speed: 0.0018 + Math.random() * 0.0015,
            size: 2.2 + Math.random() * 1.2
        });
    }

    // Active wave pulse streams (volumetric packets)
    const wavePackets = [];
    for (let i = 0; i < 5; i++) {
        wavePackets.push({
            progress: i * 0.2,
            speed: 0.0042,
            size: 4.8
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

    function getCardAnchor(card, containerRect, coreCenter) {
        const rect = card.getBoundingClientRect();
        const cardCenter = {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };

        let anchorX = cardCenter.x;
        let anchorY = cardCenter.y;

        if (cardCenter.x < coreCenter.x - 60) {
            anchorX = rect.right - containerRect.left;
        } else if (cardCenter.x > coreCenter.x + 60) {
            anchorX = rect.left - containerRect.left;
        }

        if (cardCenter.y < coreCenter.y - 40) {
            anchorY = rect.bottom - containerRect.top - 12;
        } else if (cardCenter.y > coreCenter.y + 40) {
            anchorY = rect.top - containerRect.top + 12;
        }

        return { x: anchorX, y: anchorY, center: cardCenter };
    }

    function getCoreAnchor(coreRect, containerRect, targetPos) {
        const coreCenter = {
            x: coreRect.left - containerRect.left + coreRect.width / 2,
            y: coreRect.top - containerRect.top + coreRect.height / 2
        };

        let anchorX = coreCenter.x;
        let anchorY = coreCenter.y;

        if (targetPos.x < coreCenter.x - 40) {
            anchorX = coreRect.left - containerRect.left + 20;
        } else if (targetPos.x > coreCenter.x + 40) {
            anchorX = coreRect.right - containerRect.left - 20;
        }

        if (targetPos.y < coreCenter.y - 30) {
            anchorY = coreRect.top - containerRect.top + 10;
        } else if (targetPos.y > coreCenter.y + 30) {
            anchorY = coreRect.bottom - containerRect.top - 10;
        }

        return { x: anchorX, y: anchorY, center: coreCenter };
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
        cards.forEach((card) => {
            const id = card.getAttribute('data-node-id');
            const accent = card.getAttribute('data-accent') || '#38bdf8';
            const cardAnchor = getCardAnchor(card, containerRect, rawCoreCenter);
            const coreAnchor = getCoreAnchor(coreRect, containerRect, cardAnchor);

            nodeDataList.push({
                id,
                accent,
                cardAnchor,
                coreAnchor,
                isHovered: (hoveredNodeId === id) || isCoreHovered
            });
        });

        // 1. Draw Volumetric 3D Waves and Subtle Idle Wave Connections
        nodeDataList.forEach((node) => {
            const start = node.cardAnchor;
            const end = node.coreAnchor;
            const isHovered = node.isHovered;
            const anyHovered = (hoveredNodeId !== null) || isCoreHovered;

            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.hypot(dx, dy);
            const normalX = -dy / dist;
            const normalY = dx / dist;
            const steps = 64;

            if (isHovered) {
                // ==========================================================
                // ACTIVE HOVER: Volumetric 3D Undulating Neon Plasma Wave
                // ==========================================================

                // Layer 1: Volumetric Deep Ambient Glow Underlay
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const envelope = Math.sin(t * Math.PI);
                    const waveOffset = Math.sin(t * 8 - waveTime * 2.8) * (11 * envelope);

                    const px = lx + normalX * waveOffset;
                    const py = ly + normalY * waveOffset;

                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.strokeStyle = node.accent;
                ctx.lineWidth = 8.0;
                ctx.shadowColor = node.accent;
                ctx.shadowBlur = 28;
                ctx.globalAlpha = 0.35;
                ctx.stroke();
                ctx.globalAlpha = 1.0;

                // Layer 2: Main Vibrant Saturated Wave Beam
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const envelope = Math.sin(t * Math.PI);
                    const waveOffset = Math.sin(t * 8 - waveTime * 2.8) * (11 * envelope);

                    const px = lx + normalX * waveOffset;
                    const py = ly + normalY * waveOffset;

                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.strokeStyle = node.accent;
                ctx.lineWidth = 3.6;
                ctx.shadowColor = node.accent;
                ctx.shadowBlur = 18;
                ctx.stroke();

                // Layer 3: 3D Volumetric Specular White Core Filament
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const envelope = Math.sin(t * Math.PI);
                    const waveOffset = Math.sin(t * 8 - waveTime * 2.8) * (11 * envelope);

                    const px = lx + normalX * waveOffset;
                    const py = ly + normalY * waveOffset;

                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.6;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Layer 4: Volumetric Traveling Energy Wave Packets
                wavePackets.forEach((p) => {
                    p.progress += p.speed;
                    if (p.progress > 1) p.progress = 0;

                    const t = p.progress;
                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const envelope = Math.sin(t * Math.PI);
                    const waveOffset = Math.sin(t * 8 - waveTime * 2.8) * (11 * envelope);

                    const px = lx + normalX * waveOffset;
                    const py = ly + normalY * waveOffset;

                    // Outer Halo
                    ctx.beginPath();
                    ctx.arc(px, py, p.size * (1 + envelope * 0.5), 0, Math.PI * 2);
                    ctx.fillStyle = node.accent;
                    ctx.shadowColor = node.accent;
                    ctx.shadowBlur = 20;
                    ctx.fill();

                    // Inner White Hot Core
                    ctx.beginPath();
                    ctx.arc(px, py, (p.size * 0.5) * (1 + envelope * 0.3), 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });

            } else {
                // ==========================================================
                // IDLE STATE: Stylish, Faint, Subtle Undulating Sine Wave
                // ==========================================================
                ctx.beginPath();
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const lx = start.x + dx * t;
                    const ly = start.y + dy * t;
                    const envelope = Math.sin(t * Math.PI);
                    // Gentle, subtle, slow sine undulation
                    const idleWave = Math.sin(t * 6 + waveTime * 0.9) * (4 * envelope);

                    const px = lx + normalX * idleWave;
                    const py = ly + normalY * idleWave;

                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }

                ctx.strokeStyle = anyHovered ? 'rgba(56, 189, 248, 0.05)' : 'rgba(56, 189, 248, 0.18)';
                ctx.lineWidth = 1.6;
                ctx.shadowBlur = 0;
                ctx.stroke();
            }
        });

        // 2. Ambient Particles in Idle
        if (hoveredNodeId === null && !isCoreHovered) {
            ambientParticles.forEach((p) => {
                const node = nodeDataList[p.cardIndex];
                if (!node) return;

                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;

                const start = node.cardAnchor;
                const end = node.coreAnchor;
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const dist = Math.hypot(dx, dy);
                const normalX = -dy / dist;
                const normalY = dx / dist;

                const t = p.progress;
                const envelope = Math.sin(t * Math.PI);
                const idleWave = Math.sin(t * 6 + waveTime * 0.9) * (4 * envelope);

                const lx = start.x + dx * t;
                const ly = start.y + dy * t;
                const px = lx + normalX * idleWave;
                const py = ly + normalY * idleWave;

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

    // Window Resize with Debounce
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    }, { passive: true });

    setTimeout(resize, 120);
});