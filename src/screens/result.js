// Round result breakdown screen

import { DIFFICULTIES } from '../engine.js';

export function renderResult(container, state, roundResult, onNext, isFailed) {
  const diff = DIFFICULTIES[roundResult.difficulty || state.difficulty];
  const isLast = state.currentRound >= 4;
  const failed = roundResult.result === 'failed';

  const bonusHtml = roundResult.bonuses && roundResult.bonuses.length > 0
    ? roundResult.bonuses.map(b => `<div class="bonus-pill">${b.label} <span>+${b.value}</span></div>`).join('')
    : '<p class="no-bonus">No bonuses this round</p>';

  container.innerHTML = `
    <div class="screen result-screen fade-in">
      <div class="result-icon">${failed ? '💀' : '🎉'}</div>
      <h2 class="result-title">${failed ? 'Round Failed' : 'Round Complete!'}</h2>
      ${failed ? '<p class="subtitle" style="color:var(--text-muted);margin-top:-8px">Game over — better luck next time!</p>' : ''}

      <div class="glass-card result-card">
        <div class="result-row">
          <span>Difficulty</span>
          <span style="color: ${diff.color}">${diff.emoji} ${diff.name}</span>
        </div>
        <div class="result-row">
          <span>Target Number</span>
          <span>${roundResult.target || state.target}</span>
        </div>
        <div class="result-row">
          <span>Guesses Used</span>
          <span>${roundResult.guessCount || state.guessCount}</span>
        </div>
        <div class="result-row">
          <span>Time</span>
          <span>${(roundResult.time || 0).toFixed(1)}s</span>
        </div>
        <hr class="divider"/>
        <div class="result-row big">
          <span>Round Score</span>
          <span class="score-value ${failed ? 'zero' : 'earned'}" id="anim-score">0</span>
        </div>
        <div class="bonuses-section">
          ${bonusHtml}
        </div>
        <hr class="divider"/>
        <div class="result-row big total">
          <span>Total Score</span>
          <span class="total-value">${state.totalScore.toLocaleString()}</span>
        </div>
        ${state.streak >= 3 ? `<div class="streak-indicator">🔥 ${state.streak} round streak!</div>` : ''}
      </div>

      <button id="next-btn" class="btn btn-primary btn-large pulse-glow">
        ${failed ? '🚩 See Final Score' : isLast ? '🏁 See Final Results' : '➡️ Next Round'}
      </button>
    </div>
  `;

  // Animate score counting
  const scoreEl = container.querySelector('#anim-score');
  const targetScore = failed ? 0 : (roundResult.roundScore || 0);
  animateCount(scoreEl, 0, targetScore, 1200);

  container.querySelector('#next-btn').addEventListener('click', onNext);
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
