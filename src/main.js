// NumHunt — Main entry & screen router

import { initParticles } from './particles.js';
import { createGameState, startRound } from './engine.js';
import { renderLanding } from './screens/landing.js';
import { renderDifficulty } from './screens/difficulty.js';
import { renderGame } from './screens/game.js';
import { renderResult } from './screens/result.js';
import { renderGameOver } from './screens/gameover.js';
import { renderLeaderboard } from './screens/leaderboard.js';
import './style.css';

const app = document.getElementById('app');
let state = null;

// --- Global persistent particle background ---
const particleCanvas = document.createElement('canvas');
particleCanvas.id = 'particle-canvas';
document.body.insertBefore(particleCanvas, app);
initParticles(particleCanvas);

function showLanding() {
    state = null;
    app.innerHTML = '';
    renderLanding(app, (username) => {
        state = createGameState(username);
        showDifficulty();
    });
}

function showDifficulty() {
    renderDifficulty(app, state.username, (diffKey) => {
        startRound(state, diffKey);
        showGame();
    }, () => showLanding()); // onBack → landing
}

function showGame() {
    renderGame(app, state, (roundResult) => {
        showResult(roundResult);
    }, () => showDifficulty()); // onBack → difficulty (restarts round selection)
}

function showResult(roundResult) {
    const failed = roundResult.result === 'failed';

    renderResult(app, state, roundResult, () => {
        if (failed) {
            // FAIL = game over immediately, no more rounds
            showGameOver();
        } else if (state.currentRound >= 4) {
            showGameOver();
        } else {
            // Auto-advance to next difficulty
            const nextDiff = state.roundOrder[state.currentRound];
            startRound(state, nextDiff);
            showGame();
        }
    }, failed); // pass failed flag so button text changes
}

function showGameOver() {
    renderGameOver(
        app,
        state,
        () => showLanding(),
        () => showLeaderboard()
    );
}

function showLeaderboard() {
    renderLeaderboard(app, state ? state.username : '', () => {
        if (state && state.currentRound > 0) {
            showGameOver();
        } else {
            showLanding();
        }
    });
}

// Start the app
showLanding();
