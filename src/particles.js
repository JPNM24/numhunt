// Animated number particles on a canvas background

export function initParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.8 - 0.2,
            char: String(Math.floor(Math.random() * 10)),
            size: Math.random() * 20 + 12,
            opacity: Math.random() * 0.3 + 0.05,
            hue: Math.random() > 0.5 ? 270 : 190, // purple or cyan
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 60 }, createParticle);
        window.addEventListener('resize', resize);
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
            ctx.font = `${p.size}px 'Space Grotesk', monospace`;
            ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
            ctx.fillText(p.char, p.x, p.y);

            p.x += p.vx;
            p.y += p.vy;

            if (p.y < -30) {
                p.y = h + 30;
                p.x = Math.random() * w;
            }
            if (p.x < -30) p.x = w + 30;
            if (p.x > w + 30) p.x = -30;
        }
        animId = requestAnimationFrame(draw);
    }

    init();
    draw();

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
    };
}
