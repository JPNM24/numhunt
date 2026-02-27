// NumHunt Game Engine — difficulty configs, scoring, state management

export const DIFFICULTIES = {
  easy: {
    name: 'Easy',
    emoji: '😊',
    min: 1,
    max: 50,
    maxGuesses: 10,
    baseScore: 500,
    color: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  medium: {
    name: 'Medium',
    emoji: '🔥',
    min: 1,
    max: 200,
    maxGuesses: 10,
    baseScore: 1000,
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  hard: {
    name: 'Hard',
    emoji: '💀',
    min: 1,
    max: 500,
    maxGuesses: 10,
    baseScore: 2000,
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  nightmare: {
    name: 'Nightmare',
    emoji: '👹',
    min: 1,
    max: 1000,
    maxGuesses: 10,
    baseScore: 3500,
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
};

export const TOTAL_ROUNDS = 4; // one round per difficulty

export function createGameState(username) {
  return {
    username,
    currentRound: 0,
    roundOrder: ['easy', 'medium', 'hard', 'nightmare'],
    totalScore: 0,
    streak: 0,
    roundResults: [],
    // per-round state
    target: null,
    guesses: [],
    guessCount: 0,
    roundStartTime: null,
    low: null,
    high: null,
    difficulty: null,
  };
}

export function startRound(state, difficultyKey) {
  const diff = DIFFICULTIES[difficultyKey];
  const target = Math.floor(Math.random() * (diff.max - diff.min + 1)) + diff.min;
  state.currentRound++;
  state.target = target;
  state.guesses = [];
  state.guessCount = 0;
  state.roundStartTime = Date.now();
  state.low = diff.min;
  state.high = diff.max;
  state.difficulty = difficultyKey;
  return state;
}

export function makeGuess(state, guess) {
  const diff = DIFFICULTIES[state.difficulty];
  state.guesses.push(guess);
  state.guessCount++;

  if (guess === state.target) {
    // Calculate score
    const penalty = diff.baseScore / diff.maxGuesses;
    let roundScore = Math.max(1, Math.round(diff.baseScore - (state.guessCount - 1) * penalty));

    const bonuses = [];
    const elapsed = (Date.now() - state.roundStartTime) / 1000;

    // First try bonus
    if (state.guessCount === 1) {
      bonuses.push({ type: 'first_try', label: '💀 First Try!', value: 500 });
      roundScore += 500;
    }

    // Speed bonus
    if (elapsed < 10) {
      bonuses.push({ type: 'speed', label: '⚡ Speed Bonus', value: 100 });
      roundScore += 100;
    }

    // Streak
    state.streak++;
    if (state.streak >= 3) {
      const multiplier = 1.5;
      const streakBonus = Math.round(roundScore * (multiplier - 1));
      bonuses.push({ type: 'streak', label: `🔥 Streak x${state.streak}!`, value: streakBonus });
      roundScore = Math.round(roundScore * multiplier);
    }

    state.totalScore += roundScore;
    state.roundResults.push({
      difficulty: state.difficulty,
      guessCount: state.guessCount,
      time: elapsed,
      score: roundScore,
      bonuses,
      target: state.target,
    });

    return {
      result: 'correct',
      roundScore,
      bonuses,
      totalScore: state.totalScore,
      guessCount: state.guessCount,
      time: elapsed,
    };
  }

  if (guess < state.target) {
    state.low = Math.max(state.low, guess + 1);
    return {
      result: 'too_low',
      remaining: diff.maxGuesses - state.guessCount,
      low: state.low,
      high: state.high,
    };
  }

  state.high = Math.min(state.high, guess - 1);
  return {
    result: 'too_high',
    remaining: diff.maxGuesses - state.guessCount,
    low: state.low,
    high: state.high,
  };
}

export function isGameOver(state) {
  const diff = DIFFICULTIES[state.difficulty];
  return state.guessCount >= diff.maxGuesses;
}

export function getRoundFailed(state) {
  // Called when max guesses reached without correct answer
  state.streak = 0;
  state.roundResults.push({
    difficulty: state.difficulty,
    guessCount: state.guessCount,
    time: (Date.now() - state.roundStartTime) / 1000,
    score: 0,
    bonuses: [],
    target: state.target,
    failed: true,
  });
  return {
    result: 'failed',
    target: state.target,
    totalScore: state.totalScore,
  };
}

export function isLastRound(state) {
  return state.currentRound >= TOTAL_ROUNDS;
}
