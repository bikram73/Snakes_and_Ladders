# 🐍 Snake & Ladder — Interactive Full-Stack Board Game

Modern, responsive and visually engaging Snake & Ladder game built using Python, Flask, HTML5, CSS3, and JavaScript / React with REST APIs and animated 3D dice.

## Features

- **Player vs Computer (PvC)**: Intelligent rule-based computer bot with turn deliberation.
- **Two Players Mode**: Local pass-and-play multiplayer on the same device.
- **Four Players Mode**: 4-player multiplayer on a single 100-cell board.
- **Animated 3D Dice**: Interactive rolling cube with faces ⚀ to ⚅, spacebar and click triggers.
- **Dynamic Board Mechanics**:
  - 10×10 traditional serpentine numbered board (1 to 100).
  - 10 Snakes with curved SVG bodies, fangs, and slide-down animations (98→78, 95→75, 92→88, 89→68, 74→53, 64→44, 62→22, 49→11, 47→26, 16→6).
  - 9 Ladders with 3D perspective rungs and climbing chimes (3→22, 8→30, 15→44, 21→42, 28→76, 36→57, 51→67, 71→92, 80→99).
  - Clustered non-overlapping token positioning.
  - Position 0 Start bench outside the board.
- **Rules & Options**:
  - Exact 100 finish rule with overshoot feedback.
  - Optional Extra turn on 6.
  - Animation speed controls (Slow / Normal / Fast).
  - Synthesized sound effects with mute toggle.
- **Game Status & History**: Live turn announcements, dice roll feedback, and recent move log panel.
- **Winner Celebration**: Grand champion podium with confetti cannon fireworks.

## Tech Stack

- **Backend**: Python 3.10+, Flask, REST API
- **Frontend**: HTML5, CSS3, TypeScript / React, Tailwind CSS
- **Testing**: Python unittest / pytest

## Run Locally

```bash
# Python Backend
pip install -r requirements.txt
python app.py

# Run Unit Tests
python3 -m unittest discover tests

# Full-Stack Web App
npm install
npm run dev
```
