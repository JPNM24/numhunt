// Landing screen — username entry + play CTA + leaderboard preview

import { getLeaderboard } from '../leaderboard.js';

export function renderLanding(container, onPlay) {
    container.innerHTML = `
    <div class="screen landing">
      <canvas id="particle-canvas"></canvas>
      <div class="landing-content">
        <div class="logo-wrap">
          <h1 class="logo glitch" data-text="NumHunt">Num<span class="accent">Hunt</span></h1>
          <p class="tagline">Find the number. Beat the world. 🎯</p>
        </div>

        <div class="glass-card username-card">
          <label for="username-input" class="input-label">Choose your hunter name</label>
          <div class="input-row">
            <input type="text" id="username-input" class="neon-input" placeholder="Enter username..." maxlength="20" autocomplete="off" />
            <button id="play-btn" class="btn btn-primary pulse-glow" disabled>
              <span>Play Now</span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="glass-card preview-card">
          <h3 class="card-title">🏆 Top Hunters</h3>
          <div id="preview-board" class="preview-board">
            <div class="loading-dots"><span></span><span></span><span></span></div>
          </div>
        </div>

        <button id="how-to-play-btn" class="btn btn-ghost">❓ How to Play</button>
      </div>

      <!-- How to Play Modal -->
      <div id="htp-modal" class="modal-overlay hidden">
        <div class="glass-card modal-card">
          <button class="modal-close" id="htp-close">&times;</button>
          <h2>How to Play</h2>
          <div class="htp-content">
            <div class="htp-step"><span class="step-num">1</span><p>Enter your hunter name and hit <strong>Play Now</strong></p></div>
            <div class="htp-step"><span class="step-num">2</span><p>Choose a difficulty — each has a different number range and scoring</p></div>
            <div class="htp-step"><span class="step-num">3</span><p>Guess the secret number! You'll get hints: <strong class="high-text">TOO HIGH 🔥</strong> or <strong class="low-text">TOO LOW ❄️</strong></p></div>
            <div class="htp-step"><span class="step-num">4</span><p>Fewer guesses + faster time = more points. Earn bonuses!</p></div>
            <div class="bonus-grid">
              <div class="bonus-item"><span>💀</span><p>First Try: +500 pts</p></div>
              <div class="bonus-item"><span>⚡</span><p>Under 10s: +100 pts</p></div>
              <div class="bonus-item"><span>🔥</span><p>3+ Streak: ×1.5 score</p></div>
            </div>
            <div class="htp-step"><span class="step-num">5</span><p>Play 4 rounds (Easy → Nightmare) and climb the global leaderboard!</p></div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Wire up
    const input = container.querySelector('#username-input');
    const btn = container.querySelector('#play-btn');
    const htpBtn = container.querySelector('#how-to-play-btn');
    const htpModal = container.querySelector('#htp-modal');
    const htpClose = container.querySelector('#htp-close');

    input.addEventListener('input', () => {
        btn.disabled = input.value.trim().length < 2;
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !btn.disabled) onPlay(input.value.trim());
    });

    btn.addEventListener('click', () => {
        if (!btn.disabled) onPlay(input.value.trim());
    });

    htpBtn.addEventListener('click', () => htpModal.classList.remove('hidden'));
    htpClose.addEventListener('click', () => htpModal.classList.add('hidden'));
    htpModal.addEventListener('click', (e) => {
        if (e.target === htpModal) htpModal.classList.add('hidden');
    });

    // Load leaderboard preview
    loadPreview(container);

    // Focus input
    setTimeout(() => input.focus(), 300);
}

async function loadPreview(container) {
    const board = container.querySelector('#preview-board');
    try {
        const data = await getLeaderboard(5);
        if (data.length === 0) {
            board.innerHTML = '<p class="empty-text">No scores yet — be the first!</p>';
            return;
        }
        board.innerHTML = data
            .map(
                (e, i) => `
      <div class="preview-row">
        <span class="rank">${['🥇', '🥈', '🥉'][i] || `#${i + 1}`}</span>
        <span class="name">${escapeHtml(e.username)}</span>
        <span class="score">${e.score.toLocaleString()}</span>
      </div>
    `
            )
            .join('');
    } catch {
        board.innerHTML = '<p class="empty-text">Leaderboard unavailable</p>';
    }
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}
