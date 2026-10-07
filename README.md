# 🐍 Snake & Ladder — Interactive Board Game

Modern, responsive and visually engaging Snake & Ladder game built with React, TypeScript, Tailwind CSS, animated 3D dice, and full Netlify deployment support.

## 🚀 Netlify Deployment

This repository is pre-configured for **1-click Netlify deployment**!

### Method 1: Deploy with Netlify Git Integration (Recommended)
1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **"Add new site"** ➔ **"Import an existing project"**.
4. Select your repository.
5. Netlify will automatically detect `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**!

### Method 2: Manual Netlify Drag & Drop
1. Run `npm run build` locally to generate the `dist` folder.
2. Drag and drop the `dist/` folder into the Netlify Dashboard Deploy section.

---

## 🎮 Features

- **Player vs Computer (PvC)**: Choose 1, 2, or 3 smart computer bots (C2, C3, C4) with automated turns.
- **Local Multiplayer**: Pass & Play on the same device for 2, 3, or 4 players.
- **Remote Online Multiplayer**: Host creates a room with custom capacity (2, 3, or 4 players) and shares a 5-letter room code or link (`?room=CODE`). Guests join in real time.
- **Interactive 3D Rolling Dice**: Realistic CSS 3D cube with keyboard spacebar & click triggers.
- **Dynamic Board Mechanics**:
  - 10×10 serpentine numbered board (1 to 100).
  - 10 Snakes with smooth curved SVG bodies and slide-down animations.
  - 9 Ladders with climbing chimes.
  - Clustered non-overlapping token positioning.
  - Position 0 Start bench outside the board.
- **House Rules & Settings**:
  - Exact 100 to win toggle.
  - Extra turn on rolling a 6.
  - Pawn animation speed (Slow / Normal / Fast).
  - Web Audio sound effects with mute toggle.
- **Victory Celebration**: Grand champion podium with fireworks and fanfare.

---

## 🛠️ Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
