// Game over screen — final score, rank, leaderboard submit

import { addScore, getRank } from '../leaderboard.js';

export function renderGameOver(container, state, onPlayAgain, onViewLeaderboard) {
  container.innerHTML = `
    <div class="screen gameover-screen fade-in">
      <canvas id="confetti-canvas"></canvas>
      <div class="gameover-content">
        <div class="glitch-text" data-text="GAME OVER">GAME OVER</div>
        <div class="final-score-wrap glass-card">
          <p class="final-label">Final Score</p>
          <h1 class="final-score" id="final-score">0</h1>
          <p class="rank-text" id="rank-text">Calculating rank...</p>
        </div>

        <div class="round-summary glass-card">
          <h3>Round Breakdown</h3>
          <div class="summary-rows" id="summary-rows"></div>
        </div>

        <div class="gameover-actions">
          <button id="play-again-btn" class="btn btn-primary btn-large pulse-glow">🎮 Play Again</button>
          <button id="leaderboard-btn" class="btn btn-secondary btn-large">🏆 Leaderboard</button>
        </div>
      </div>
    </div>
  `;

  // Animate final score
  const scoreEl = container.querySelector('#final-score');
  animateCount(scoreEl, 0, state.totalScore, 2000);

  // Show round breakdown
  const rows = container.querySelector('#summary-rows');
  rows.innerHTML = state.roundResults
    .map(
      (r, i) => `
    <div class="summary-row ${r.failed ? 'failed' : 'success'}">
      <span class="summary-round">R${i + 1}</span>
      <span class="summary-diff">${r.difficulty}</span>
      <span class="summary-guesses">${r.guessCount} guesses</span>
      <span class="summary-score">${r.failed ? '✗' : `+${r.score.toLocaleString()}`}</span>
    </div>
  `
    )
    .join('');

  // Submit score and get rank
  submitAndRank(state, container.querySelector('#rank-text'));

  // Confetti
  launchConfetti(container.querySelector('#confetti-canvas'));

  // Buttons
  container.querySelector('#play-again-btn').addEventListener('click', onPlayAgain);
  container.querySelector('#leaderboard-btn').addEventListener('click', onViewLeaderboard);
}

async function submitAndRank(state, rankEl) {
  try {
    await addScore(state.username, state.totalScore, 'all');
    const rank = await getRank(state.totalScore);
    rankEl.textContent = `🏆 You ranked #${rank} globally!`;
    rankEl.classList.add('rank-reveal');
  } catch {
    rankEl.textContent = 'Score saved locally';
  }
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function launchConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Ensure confetti is above particles but doesn't block interaction
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  const colors = ['#a855f7', '#06b6d4', '#ec4899', '#22c55e', '#f59e0b', '#fff'];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 1,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      if (p.opacity <= 0) continue;
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      p.vy += 0.05;
      if (frame > 120) p.opacity -= 0.01;
    }
    frame++;
    if (alive && frame < 300) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
