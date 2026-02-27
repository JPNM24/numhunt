// Main gameplay screen

import { DIFFICULTIES, makeGuess, isGameOver, getRoundFailed } from '../engine.js';
import { playWin, playWrong } from '../sounds.js';

export function renderGame(container, state, onRoundEnd, onBack) {
  const diff = DIFFICULTIES[state.difficulty];
  const roundNum = state.currentRound;

  container.innerHTML = `
    <div class="screen game-screen fade-in">
      <div class="game-header">
        <button id="game-back" class="btn btn-ghost">← Quit</button>
        <div class="game-info-left">
          <span class="round-badge">Round ${roundNum}/4</span>
          <span class="diff-badge" style="--badge-color: ${diff.color}">${diff.emoji} ${diff.name}</span>
        </div>
        <div class="game-info-right">
          <span class="score-ticker">Score: <strong id="score-display">${state.totalScore.toLocaleString()}</strong></span>
        </div>
      </div>

      <div class="game-body">
        <div class="range-visual">
          <div class="range-bar">
            <div class="range-fill" id="range-fill"></div>
            <span class="range-label range-low" id="range-low">${state.low}</span>
            <span class="range-label range-high" id="range-high">${state.high}</span>
          </div>
        </div>

        <div id="feedback-zone" class="feedback-zone">
          <p class="feedback-text" id="feedback-text">Guess a number between <strong>${state.low}</strong> and <strong>${state.high}</strong></p>
        </div>

        <div class="guess-input-wrap glass-card">
          <input type="number" id="guess-input" class="guess-input" min="${diff.min}" max="${diff.max}" placeholder="?" autocomplete="off" />
          <button id="guess-btn" class="btn btn-primary">
            <span>Guess</span>
          </button>
        </div>

        <div class="game-meta">
          <span class="guess-counter" id="guess-counter">Guesses: 0 / ${diff.maxGuesses}</span>
          <span class="timer" id="timer">⏱ 0.0s</span>
        </div>

        <div class="guess-history" id="guess-history">
          <p class="history-label">Your guesses:</p>
          <div class="history-trail" id="history-trail"></div>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#guess-input');
  const btn = container.querySelector('#guess-btn');
  const feedbackText = container.querySelector('#feedback-text');
  const feedbackZone = container.querySelector('#feedback-zone');
  const guessCounter = container.querySelector('#guess-counter');
  const timerEl = container.querySelector('#timer');
  const scoreDisplay = container.querySelector('#score-display');
  const historyTrail = container.querySelector('#history-trail');
  const rangeLow = container.querySelector('#range-low');
  const rangeHigh = container.querySelector('#range-high');
  const rangeFill = container.querySelector('#range-fill');
  const gameScreen = container.querySelector('.game-screen');

  // Timer (with guard to prevent leak on screen change)
  let roundActive = true;
  let timerInterval = setInterval(() => {
    if (!roundActive || !document.contains(timerEl)) {
      clearInterval(timerInterval);
      return;
    }
    const elapsed = ((Date.now() - state.roundStartTime) / 1000).toFixed(1);
    timerEl.textContent = `⏱ ${elapsed}s`;
  }, 100);

  // Update range visual
  function updateRange() {
    const total = diff.max - diff.min;
    const leftPct = ((state.low - diff.min) / total) * 100;
    const widthPct = ((state.high - state.low) / total) * 100;
    rangeFill.style.left = `${leftPct}%`;
    rangeFill.style.width = `${Math.max(widthPct, 1)}%`;
    rangeLow.textContent = state.low;
    rangeHigh.textContent = state.high;
  }

  updateRange();

  function handleGuess() {
    // Guard: prevent double-submit after round ends
    if (!roundActive) return;

    const val = parseInt(input.value);
    if (isNaN(val) || val < diff.min || val > diff.max) {
      feedbackText.innerHTML = `<span class="warn-text">Enter a number between ${state.low} and ${state.high}!</span>`;
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      return;
    }

    const result = makeGuess(state, val);

    // Update guess history
    const chip = document.createElement('span');
    chip.className = `guess-chip ${result.result === 'too_high' ? 'chip-high' : result.result === 'too_low' ? 'chip-low' : 'chip-correct'}`;
    chip.textContent = val;
    historyTrail.appendChild(chip);

    guessCounter.textContent = `Guesses: ${state.guessCount} / ${diff.maxGuesses}`;
    input.value = '';

    if (result.result === 'correct') {
      roundActive = false;
      clearInterval(timerInterval);
      playWin();
      feedbackZone.className = 'feedback-zone correct-feedback';
      feedbackText.innerHTML = `<span class="correct-text slide-up">🎉 CORRECT! The number was ${state.target}</span>`;
      scoreDisplay.textContent = state.totalScore.toLocaleString();
      btn.disabled = true;
      input.disabled = true;
      gameScreen.classList.add('win-flash');
      setTimeout(() => onRoundEnd(result), 2000);
      return;
    }

    if (result.result === 'too_high') {
      playWrong();
      feedbackZone.className = 'feedback-zone high-feedback';
      feedbackText.innerHTML = `<span class="high-text slide-up">TOO HIGH 🔥</span>`;
      gameScreen.classList.add('shake');
      setTimeout(() => gameScreen.classList.remove('shake'), 500);
    } else {
      playWrong();
      feedbackZone.className = 'feedback-zone low-feedback';
      feedbackText.innerHTML = `<span class="low-text slide-up">TOO LOW ❄️</span>`;
      gameScreen.classList.add('shake');
      setTimeout(() => gameScreen.classList.remove('shake'), 500);
    }

    updateRange();

    // Check if out of guesses
    if (isGameOver(state)) {
      roundActive = false;
      clearInterval(timerInterval);
      const failResult = getRoundFailed(state);
      feedbackZone.className = 'feedback-zone fail-feedback';
      feedbackText.innerHTML = `<span class="fail-text">💀 Out of guesses! The number was <strong>${state.target}</strong></span>`;
      btn.disabled = true;
      input.disabled = true;
      setTimeout(() => onRoundEnd(failResult), 2500);
      return;
    }

    input.focus();
  }

  btn.addEventListener('click', handleGuess);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !input.disabled) handleGuess();
  });

  container.querySelector('#game-back').addEventListener('click', () => {
    roundActive = false;
    clearInterval(timerInterval);
    onBack();
  });

  setTimeout(() => input.focus(), 200);
}
