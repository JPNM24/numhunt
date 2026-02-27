// Full leaderboard screen — top 20

import { getLeaderboard } from '../leaderboard.js';

export function renderLeaderboard(container, currentUsername, onBack) {
    container.innerHTML = `
    <div class="screen leaderboard-screen fade-in">
      <div class="screen-header">
        <button id="lb-back" class="btn btn-ghost">← Back</button>
        <h2>🏆 Global Leaderboard</h2>
        <button id="lb-refresh" class="btn btn-ghost">🔄 Refresh</button>
      </div>
      <div class="glass-card lb-card">
        <div class="lb-table" id="lb-table">
          <div class="loading-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>
  `;

    container.querySelector('#lb-back').addEventListener('click', onBack);
    container.querySelector('#lb-refresh').addEventListener('click', () => loadBoard(container, currentUsername));

    loadBoard(container, currentUsername);
}

async function loadBoard(container, currentUsername) {
    const table = container.querySelector('#lb-table');
    table.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

    try {
        const data = await getLeaderboard(20);
        if (data.length === 0) {
            table.innerHTML = '<p class="empty-text">No scores yet — play a game!</p>';
            return;
        }

        table.innerHTML = `
      <div class="lb-header-row">
        <span class="lb-col rank-col">#</span>
        <span class="lb-col name-col">Hunter</span>
        <span class="lb-col score-col">Score</span>
        <span class="lb-col date-col">Date</span>
      </div>
      ${data
                .map(
                    (e, i) => `
        <div class="lb-row ${e.username === currentUsername ? 'is-you' : ''} ${i < 3 ? 'top-three' : ''}">
          <span class="lb-col rank-col">${['🥇', '🥈', '🥉'][i] || i + 1}</span>
          <span class="lb-col name-col">${escapeHtml(e.username)} ${e.username === currentUsername ? '<span class="you-badge">YOU</span>' : ''}</span>
          <span class="lb-col score-col">${e.score.toLocaleString()}</span>
          <span class="lb-col date-col">${formatDate(e.created_at)}</span>
        </div>
      `
                )
                .join('')}
    `;
    } catch {
        table.innerHTML = '<p class="empty-text">Failed to load leaderboard</p>';
    }
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}
