// Difficulty selection screen — 4 glassmorphism cards

import { DIFFICULTIES } from '../engine.js';

export function renderDifficulty(container, username, onSelect, onBack) {
  const cards = Object.entries(DIFFICULTIES)
    .map(
      ([key, d]) => `
    <button class="diff-card glass-card" data-diff="${key}" style="--card-color: ${d.color}; --card-glow: ${d.glow}">
      <span class="diff-emoji">${d.emoji}</span>
      <h3 class="diff-name">${d.name}</h3>
      <div class="diff-stats">
        <div class="stat"><span class="stat-label">Range</span><span class="stat-val">${d.min} – ${d.max}</span></div>
        <div class="stat"><span class="stat-label">Guesses</span><span class="stat-val">${d.maxGuesses}</span></div>
        <div class="stat"><span class="stat-label">Base Score</span><span class="stat-val">${d.baseScore.toLocaleString()}</span></div>
      </div>
    </button>
  `
    )
    .join('');

  container.innerHTML = `
    <div class="screen difficulty-screen fade-in">
      <div class="screen-header">
        <button id="diff-back" class="btn btn-ghost">← Back</button>
        <div>
          <h2>Welcome, <span class="accent">${escapeHtml(username)}</span></h2>
          <p class="subtitle">Choose your first challenge</p>
        </div>
        <div style="width:80px"></div>
      </div>
      <div class="diff-grid">
        ${cards}
      </div>
      <p class="hint-text">You'll play all 4 rounds — Easy → Nightmare</p>
    </div>
  `;

  container.querySelectorAll('.diff-card').forEach((card) => {
    card.addEventListener('click', () => onSelect(card.dataset.diff));
  });

  container.querySelector('#diff-back').addEventListener('click', onBack);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
