// Interactive animated number particles on a canvas background
// Particles scatter from mouse/touch, glow near cursor, and burst on click

export function initParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;
    let w, h;

    // Mouse / touch state
    const mouse = { x: -9999, y: -9999, active: false };
    const REPEL_RADIUS = 140;
    const REPEL_FORCE = 8;
    const FRICTION = 0.92;
    const RETURN_SPEED = 0.015;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticle(x, y, burst = false) {
        const baseX = x !== undefined ? x : Math.random() * w;
        const baseY = y !== undefined ? y : Math.random() * h;
        return {
            x: baseX,
            y: baseY,
            originX: baseX,
            originY: baseY,
            vx: burst ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 0.5,
            vy: burst ? (Math.random() - 0.5) * 12 : -Math.random() * 0.8 - 0.2,
            char: String(Math.floor(Math.random() * 10)),
            size: Math.random() * 20 + 12,
            baseOpacity: Math.random() * 0.25 + 0.06,
            opacity: 0,
            hue: Math.random() > 0.5 ? 270 : 190, // purple or cyan
            lightness: 65,
            life: burst ? 120 + Math.random() * 60 : Infinity,
            age: 0,
            burst,
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 70 }, () => createParticle());
        window.addEventListener('resize', resize);

        // Mouse events
        canvas.style.pointerEvents = 'auto';
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseenter', () => (mouse.active = true));
        canvas.addEventListener('mouseleave', () => (mouse.active = false));
        canvas.addEventListener('click', onTap);

        // Touch events
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('touchend', () => (mouse.active = false));
    }

    function onPointerMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    }

    function onTouchStart(e) {
        const t = e.touches[0];
        mouse.x = t.clientX;
        mouse.y = t.clientY;
        mouse.active = true;
        spawnBurst(t.clientX, t.clientY);
    }

    function onTouchMove(e) {
        const t = e.touches[0];
        mouse.x = t.clientX;
        mouse.y = t.clientY;
    }

    function onTap(e) {
        spawnBurst(e.clientX, e.clientY);
    }

    function spawnBurst(x, y) {
        const count = 8 + Math.floor(Math.random() * 6);
        for (let i = 0; i < count; i++) {
            particles.push(createParticle(x, y, true));
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.age++;

            // Remove expired burst particles
            if (p.burst && p.age > p.life) {
                particles.splice(i, 1);
                continue;
            }

            // --- Mouse repulsion ---
            if (mouse.active) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < REPEL_RADIUS && dist > 0) {
                    const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                    // Glow brighter near cursor
                    p.lightness = 65 + (1 - dist / REPEL_RADIUS) * 30;
                } else {
                    p.lightness += (65 - p.lightness) * 0.05;
                }
            } else {
                p.lightness += (65 - p.lightness) * 0.05;
            }

            // Apply friction
            p.vx *= FRICTION;
            p.vy *= FRICTION;

            // Non-burst particles: steady upward float + gentle horizontal sway
            if (!p.burst) {
                // Constant upward drift (varies per particle via initial vy)
                p.vy -= 0.06;
                // Gentle horizontal sway back toward origin (X only, not Y)
                p.vx += (p.originX - p.x) * RETURN_SPEED * 0.15;
                // Tiny random horizontal wobble
                p.vx += (Math.random() - 0.5) * 0.08;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Wrap around for non-burst particles
            if (!p.burst) {
                if (p.y < -30) { p.y = h + 30; p.originY = p.y; p.x = Math.random() * w; p.originX = p.x; }
                if (p.x < -30) p.x = w + 30;
                if (p.x > w + 30) p.x = -30;
            }

            // Opacity: fade in, and fade out for burst
            if (p.burst) {
                const fadeIn = Math.min(p.age / 10, 1);
                const fadeOut = Math.max(1 - (p.age - p.life + 40) / 40, 0);
                p.opacity = p.baseOpacity * 3 * fadeIn * fadeOut;
            } else {
                p.opacity += (p.baseOpacity - p.opacity) * 0.05;
            }

            // Draw
            const glow = mouse.active ? Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / REPEL_RADIUS) : 0;
            if (glow > 0.3) {
                ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, ${glow * 0.6})`;
                ctx.shadowBlur = 15 * glow;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            ctx.font = `${p.size}px 'Space Grotesk', monospace`;
            ctx.fillStyle = `hsla(${p.hue}, 85%, ${p.lightness}%, ${p.opacity})`;
            ctx.fillText(p.char, p.x, p.y);
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        animId = requestAnimationFrame(draw);
    }

    init();
    draw();

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', onPointerMove);
        canvas.removeEventListener('click', onTap);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
    };
}
