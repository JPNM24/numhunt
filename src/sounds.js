// Sound effects manager — Web Audio API synthesized sounds
// No external files needed — generates clear, loud sounds in real-time

let audioCtx = null;

function getContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

// --- Synthesized Win Sound: triumphant ascending chord ---
export function playWin() {
    try {
        const ctx = getContext();
        const now = ctx.currentTime;

        // Play a bright ascending arpeggio (C5 → E5 → G5 → C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.7, now);
        masterGain.gain.linearRampToValueAtTime(0, now + 1.2);
        masterGain.connect(ctx.destination);

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Each note starts slightly after the previous
            const noteStart = now + i * 0.12;
            noteGain.gain.setValueAtTime(0, noteStart);
            noteGain.gain.linearRampToValueAtTime(0.6, noteStart + 0.05);
            noteGain.gain.linearRampToValueAtTime(0.3, noteStart + 0.4);
            noteGain.gain.linearRampToValueAtTime(0, now + 1.2);

            osc.connect(noteGain);
            noteGain.connect(masterGain);
            osc.start(noteStart);
            osc.stop(now + 1.3);
        });

        // Add a shimmer/sparkle effect on top
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(2093, now + 0.35);
        shimmerGain.gain.setValueAtTime(0, now + 0.35);
        shimmerGain.gain.linearRampToValueAtTime(0.3, now + 0.4);
        shimmerGain.gain.linearRampToValueAtTime(0, now + 0.9);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(masterGain);
        shimmer.start(now + 0.35);
        shimmer.stop(now + 1.0);
    } catch {
        // Silently fail if audio not supported
    }
}

// --- Synthesized Wrong Sound: short low buzz ---
export function playWrong() {
    try {
        const ctx = getContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.2);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    } catch {
        // Silently fail
    }
}
