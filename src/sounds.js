// Sound effects manager

const sounds = {};

function load(name, path) {
    try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 0.5;
        sounds[name] = audio;
    } catch (e) {
        console.warn(`Failed to load sound: ${name}`, e);
    }
}

// Preload all sounds
load('win', '/sounds/win.mp3');
load('wrong', '/sounds/wrong.mp3');

function play(name) {
    const s = sounds[name];
    if (!s) return;
    try {
        s.currentTime = 0;
        s.play().catch(() => { }); // ignore autoplay restrictions
    } catch {
        // Silently fail
    }
}

export function playWin() {
    play('win');
}

export function playWrong() {
    play('wrong');
}

export function setVolume(vol) {
    Object.values(sounds).forEach((s) => {
        s.volume = Math.max(0, Math.min(1, vol));
    });
}
