// Sound effects manager — Web Audio API for high-quality playback

let audioCtx = null;
let gainNode = null;
const buffers = {};

function getContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.0; // full volume
        gainNode.connect(audioCtx.destination);
    }
    // Resume if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

async function load(name, path) {
    try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const ctx = getContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffers[name] = audioBuffer;
    } catch (e) {
        console.warn(`Failed to load sound: ${name}`, e);
    }
}

// Preload all sounds
load('win', '/sounds/win.mp3');
load('wrong', '/sounds/wrong.mp3');

function play(name) {
    try {
        const ctx = getContext();
        const buffer = buffers[name];
        if (!buffer) return;
        // Create a new source each time (supports overlapping plays)
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNode);
        source.start(0);
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
    if (gainNode) {
        gainNode.gain.value = Math.max(0, Math.min(2, vol)); // allow up to 2x boost
    }
}

