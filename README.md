# 🎯 NumHunt — The Ultimate Number Guessing Game

A sleek, cyberpunk-themed number guessing game with multiple difficulty levels, bonus scoring, and a global leaderboard powered by Supabase.

## ✨ Features

- **4 Difficulty Levels** — Easy (1–50), Medium (1–200), Hard (1–500), Nightmare (1–1000)
- **Progressive Rounds** — Play through all 4 difficulties in a single session
- **Smart Scoring** — Earn points based on fewer guesses, with bonus rewards:
  - 💀 **First Try Bonus** (+500 pts)
  - ⚡ **Speed Bonus** (guess within 10s for +100 pts)
  - 🔥 **Streak Multiplier** (1.5x after 3+ consecutive wins)
- **Global Leaderboard** — Compete with players worldwide (Supabase-powered)
- **Cyberpunk UI** — Particle effects, glow animations, Space Grotesk typography
- **Sound Effects** — Audio feedback for game interactions

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Supabase](https://supabase.com/) project (for leaderboard)

### Installation

```bash
git clone https://github.com/JPNM24/numhunt.git
cd numhunt
npm install
```

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com/)
2. Run the SQL in `supabase_setup.sql` in the Supabase SQL Editor to create the leaderboard table
3. Update the Supabase URL and anon key in `src/leaderboard.js`

### Run Locally

```bash
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

## 🛠️ Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Frontend   | Vanilla JS + HTML + CSS  |
| Bundler    | Vite                     |
| Database   | Supabase (PostgreSQL)    |
| Hosting    | Vercel                   |
| Font       | Space Grotesk            |

## 📂 Project Structure

```
numhunt/
├── index.html              # Entry point
├── src/
│   ├── main.js             # App initialization & routing
│   ├── engine.js           # Game logic, scoring & state
│   ├── leaderboard.js      # Supabase leaderboard integration
│   ├── particles.js        # Particle animation effects
│   ├── sounds.js           # Sound effects manager
│   ├── style.css           # Full cyberpunk theme styles
│   └── screens/
│       ├── landing.js      # Home / username entry screen
│       ├── difficulty.js   # Difficulty selection screen
│       ├── game.js         # Main gameplay screen
│       ├── result.js       # Round result screen
│       ├── gameover.js     # Final score & game over screen
│       └── leaderboard.js  # Global leaderboard screen
├── supabase_setup.sql      # Database schema for leaderboard
├── vercel.json             # Vercel deployment config
└── package.json
```

## 🎮 How to Play

1. Enter your username on the landing screen
2. Play through 4 rounds — **Easy → Medium → Hard → Nightmare**
3. Each round gives you **10 guesses** to find the secret number
4. Earn score based on how few guesses you use
5. Rack up bonuses for speed, first-try wins, and streaks
6. If you fail a round (use all 10 guesses), the game ends
7. Submit your score to the global leaderboard!

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
