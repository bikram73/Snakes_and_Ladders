# 🦈 Snakes & Ladders Grand Arena — Shark Board Edition 🎲

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

**A modern, high-octane 3D board game experience featuring dynamic predatory Shark themes, serpentine SVG coordinates, realistic 3D rolling dice physics, AI bots, local pass & play, online multiplayer rooms, and zero-dependency Web Audio.**

</div>

---

# 📑 Table of Contents

<div align="center">

| **<div align="center">📖 Description</div>**                                                                                 | **<div align="center">🚀 Section</div>**                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <div align="center">**Discover the game features, gameplay modes, and interactive capabilities.** 👉</div>                   | <div align="center"><a href="#features"><img src="https://img.shields.io/badge/✨%20Features-4F46E5?style=for-the-badge" /></a></div>                                                       |
| <div align="center">**Learn about the technologies, frameworks, and programming languages used.** 👉</div>                   | <div align="center"><a href="#tech-stack"><img src="https://img.shields.io/badge/🛠️%20Tech%20Stack-0891B2?style=for-the-badge" /></a></div>                                               |
| <div align="center">**Explore the project folders, modules, and file organization.** 👉</div>                                | <div align="center"><a href="#file-structure"><img src="https://img.shields.io/badge/📂%20File%20Structure-10B981?style=for-the-badge" /></a></div>                                        |
| <div align="center">**Follow the installation instructions and launch the game locally.** 👉</div>                           | <div align="center"><a href="#installation"><img src="https://img.shields.io/badge/🚀%20Installation-F97316?style=for-the-badge" /></a></div>                                              |
| <div align="center">**Understand the game rules, dice mechanics, snakes, ladders, and winning conditions.** 👉</div>         | <div align="center"><a href="#game-rules"><img src="https://img.shields.io/badge/🎲%20Game%20Rules-7C3AED?style=for-the-badge" /></a></div>                                                |
| <div align="center">**Explore the available game modes, player turns, and computer opponent.** 👉</div>                      | <div align="center"><a href="#game-modes"><img src="https://img.shields.io/badge/🎮%20Game%20Modes-DB2777?style=for-the-badge" /></a></div>                                                |
| <div align="center">**Understand the application architecture, backend logic, frontend components, and data flow.** 👉</div> | <div align="center"><a href="./ARCHITECTURE.md"><img src="https://img.shields.io/badge/🏗️%20Architecture%20Document-DC2626?style=for-the-badge" /></a></div>                              |
| <div align="center">**Review the Flask REST API endpoints, request formats, responses, and error handling.** 👉</div>        | <div align="center"><a href="#api-documentation"><img src="https://img.shields.io/badge/🌐%20API%20Documentation-0EA5E9?style=for-the-badge" /></a></div>                                  |
| <div align="center">**Learn how game state, player movement, turn management, and board logic are implemented.** 👉</div>    | <div align="center"><a href="./TECHNICAL_REPORT.md"><img src="https://img.shields.io/badge/📊%20Technical%20Report-2563EB?style=for-the-badge" /></a></div>                                |
| <div align="center">**Review automated tests, gameplay validation, API checks, and quality assurance.** 👉</div>             | <div align="center"><a href="#testing-and-quality-assurance"><img src="https://img.shields.io/badge/🧪%20Testing%20%26%20QA-059669?style=for-the-badge" /></a></div>                       |
| <div align="center">**Explore responsiveness, animation efficiency, loading speed, and gameplay performance.** 👉</div>      | <div align="center"><a href="#performance"><img src="https://img.shields.io/badge/⚡%20Performance-F59E0B?style=for-the-badge" /></a></div>                                                 |
| <div align="center">**Understand temporary game sessions, data handling, validation, and security considerations.** 👉</div> | <div align="center"><a href="#privacy-and-security"><img src="https://img.shields.io/badge/🔒%20Privacy%20%26%20Security-475569?style=for-the-badge" /></a></div>                          |
| <div align="center">**Review known limitations, supported functionality, and possible future enhancements.** 👉</div>        | <div align="center"><a href="#limitations-and-future-enhancements"><img src="https://img.shields.io/badge/🚧%20Limitations%20%26%20Future%20Scope-EF4444?style=for-the-badge" /></a></div> |
| <div align="center">**Learn how to contribute, report issues, and improve the project.** 👉</div>                            | <div align="center"><a href="#contributing"><img src="https://img.shields.io/badge/🤝%20Contributing-0D9488?style=for-the-badge" /></a></div>                                              |
| <div align="center">**Review licensing information and acknowledgements.** 👉</div>                                          | <div align="center"><a href="#license"><img src="https://img.shields.io/badge/📜%20License-64748B?style=for-the-badge" /></a></div>                                                        |

</div>

---

<a id="features"></a>
## ✨ Features

### 🦈 1. Shark Board Layout & Theming System
- **6 Thematic Visual Skins**:
  - 🦈 **Great White Hunt**: Oceanic deep navy and azure hues, conical Great White predator snouts, razor teeth, counter-shaded bellies, and industrial marine ladders.
  - 🔨 **Hammerhead Reef**: Tropical coral lagoon palette with emerald waters, distinctive T-shaped cephalofoil heads, lateral eye stalks, and bamboo reef ladders.
  - 🦖 **Megalodon Abyss**: Volcanic abyssal trench styling with obsidian-to-magma gradients, glowing bioluminescent hazard tiles, ancient giant serrated jaws, and volcanic anchor chains.
  - 🤖 **Cyber Shark 2099**: Futuristic cyberpunk neon grid with glowing violet/cyan circuitry, cybernetic fins, mechanized laser jaws, and glowing holographic ladder rungs.
  - 🏴‍☠️ **Pirate Shark Cove**: Plundered galleon shipwreck aesthetic with parchment-aged board tiles, bone-and-skull shark heads, treasure chests, and nautical rope ladders.
  - 🐍 **Classic Emerald Serpent**: Traditional vintage Snake & Ladder theme with serpentine scales, ruby-eyed cobra heads, and golden polished ladder rails.
- **4 Hazard Layout Presets**:
  - 🌊 **Reef Patrol (Balanced)**: 10 Sharks & 9 Ladders distributed across all board quartiles for classic competitive pacing.
  - ⚡ **Shark Frenzy (High Danger)**: 12 Sharks & 7 Ladders, featuring deadly clusters near the endgame tiles (99, 95, 93, 89) for intense comeback drama.
  - 💎 **Treasure Dive (Rapid Ascent)**: 8 Sharks & 11 Ladders, including deep-to-surface boosts (e.g. tile 8 to 84) for fast, dynamic matches.
  - 🌋 **Megalodon Gauntlet (Hardcore)**: 13 Sharks & 6 Ladders, featuring the notorious Tile 99 ➔ 10 abyssal plunge that punishes overeager contenders.
- **Dynamic In-Game Switching**: Switch themes on the fly via the board header palette icon (`🎨`), the settings modal, or directly on the Landing Page.

### 🎲 2. Realistic 3D Rolling Dice
- **Hardware-Accelerated CSS 3D Cube**: Six distinct textured faces with accurate dot pips.
- **Dynamic Physics Animation**: Dynamic tumble rotations (3 to 5 full spins) with random tumble trajectories.
- **Multiple Input Triggers**: Roll by clicking the 3D dice button or by hitting the **Spacebar** on your keyboard.

### 🎮 3. Complete Game Modes
- **Player vs Computer (PvC)**: Challenge 1, 2, or 3 autonomous AI bots (`C2`, `C3`, `C4`) featuring simulated thinking latency and automatic turn execution.
- **Local Pass & Play**: Local offline multiplayer for 2, 3, or 4 players on a single shared device with custom player names and distinct pawn colors.
- **Remote Online Multiplayer**: Host a private room with custom player capacity (2, 3, or 4 players), share a 5-letter room code or 1-click clipboard invite link (`?room=CODE`), and play synchronously with remote friends.

### 🗺️ 4. Dynamic Board & Pawn Movement
- **Serpentine 10x10 Coordinate Engine**: Flawless math converting tiles 1 to 100 into alternating zigzag screen coordinates.
- **Tile-by-Tile Step Animation**: Pawns hop through each tile individually with sequential audio ticks.
- **Smart Pawn Clustering**: Up to 4 pawns on the same tile automatically rearrange in a 2x2 offset grid to prevent overlapping.
- **Position 0 Start Bench**: Dedicated starting paddock outside the board for pawns before their initial roll.

### ⚙️ 5. House Rules & Settings
- **Exact 100 to Win**: Toggle between strict bounce-back rules or casual finish line crossing.
- **Extra Turn on Rolling a 6**: Standard tournament rule rewarding maximum rolls with an immediate extra turn.
- **Pawn Animation Speed**: Choose between Slow (250ms), Normal (140ms), or Fast (80ms) per-tile step animation.
- **Move Ledger Drawer**: Slide-out live activity log detailing every dice roll, shark bite, ladder climb, and turn outcome.

### 🔊 6. Zero-Dependency Web Audio Synthesis
- Pure Web Audio API synthesis generating synthetic sound effects on-the-fly without downloading any external MP3/WAV assets:
  - 🦈 Shark Chomp & Slide (jaw snap with exponential pitch dive)
  - 🐍 Snake Hiss & Rattling Slide
  - 🪜 Ladder Climbing Chimes (arpeggiated pentatonic tones)
  - 🎲 Dice Rattle & Clatter
  - 🏆 Grand Victory Fanfare & Confetti

---

<a id="tech-stack"></a>
## 🛠️ Tech Stack & Languages

<div align="center">

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Component-driven UI, hooks (`useMemo`, `useCallback`, `useState`, `useEffect`) |
| **Language (Client)** | **TypeScript 5.x** | Strict static typing, custom game domain interfaces, and build safety |
| **Styling & Design** | **Tailwind CSS v4** | Utility-first responsive styling, glassmorphism, glowing gradients |
| **Build Tool & Bundler** | **Vite 8.x** | Lightning-fast HMR and optimized production bundles |
| **3D & Vector Graphics** | **CSS 3D Transforms + SVG** | Hardware-accelerated 3D dice cube + procedural SVG predator vectors |
| **Audio Engine** | **Web Audio API** | Pure browser audio synthesis (no external MP3/WAV file downloads) |
| **Animations & FX** | **Canvas-Confetti + Motion** | Victory particle effects and fluid tile-step transitions |
| **Backend (Node.js)** | **Express 4.x + TSX** | Full-stack development server with in-memory room store & REST API |
| **Backend (Python)** | **Python 3.10+ & Flask 3.x** | Object-oriented game engine (`game/`), coordinate logic, and REST API |
| **Testing** | **Python `unittest` + `tsc`** | 12 automated Python unit tests + TypeScript typechecking (`npm run lint`) |
| **Deployment** | **Netlify** | Configured with `netlify.toml` for zero-configuration 1-click deploys |

</div>

### 💻 Languages Breakdown
- **TypeScript / JavaScript**: Core frontend application, SVG geometry algorithms, Express server.
- **Python**: Modular game logic engine, board model, player tracking, and Flask endpoints.
- **HTML5 & CSS3**: Responsive viewport layout, CSS 3D perspective grids, and custom keyframe animations.

---

<a id="file-structure"></a>
## 📂 File Structure

```
snakes-and-ladders/
├── .env.example                  # Environment variable reference template
├── .gitignore                    # Git ignore file for node_modules, build artifacts, etc.
├── ARCHITECTURE.md               # In-depth architectural specification and system topology
├── TECHNICAL_REPORT.md           # Mathematical model, coordinate algorithms & turn logic
├── README.md                     # Comprehensive project documentation
├── app.py                        # Python Flask backend server and REST API routes
├── requirements.txt              # Python pip dependencies (Flask)
├── server.ts                     # Full-stack Node.js Express server & REST API
├── package.json                  # Node.js project manifest, scripts & dependencies
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build and development configuration
├── netlify.toml                  # 1-Click Netlify deployment build instructions
├── index.html                    # Application HTML entry point with metadata
├── metadata.json                 # AI Studio workspace configuration and permissions
├── game/                         # Object-Oriented Python Game Engine
│   ├── __init__.py               # Python package initialization
│   ├── board.py                  # 10x10 Serpentine Board representation and hazard mappings
│   ├── game_engine.py            # Turn state machine, win validation, and dice evaluation
│   └── player.py                 # Player state model (positions, colors, AI flags)
├── tests/                        # Automated Test Suites
│   ├── test_board.py             # Board coordinates, snake/ladder validity tests
│   └── test_game.py              # Turn sequence, dice movement, exact finish, and overshoot tests
└── src/                          # Modern React 19 + TypeScript Source Code
    ├── App.tsx                   # Central game coordinator, turn cycle, state management
    ├── main.tsx                  # React DOM rendering root
    ├── index.css                 # Global styles and Tailwind CSS v4 directives
    ├── components/               # Modular UI Components
    │   ├── AnimatedBoardHero.tsx # Interactive landing page hero board with AI bots
    │   ├── Dice3D.tsx            # CSS 3D Cube with realistic roll physics and spacebar trigger
    │   ├── GameBoard.tsx         # Responsive 10x10 board with player clustering and overlays
    │   ├── LandingPage.tsx       # Game mode portal, player configuration & theme selector
    │   ├── MoveLogDrawer.tsx     # Slide-out history ledger tracking rolls and hazards
    │   ├── NewGameConfirmModal.tsx# Confirmation modal for match restart
    │   ├── RemoteRoomLobby.tsx   # Online multiplayer lobby with 1-click clipboard link sharing
    │   ├── RulesModal.tsx        # Comprehensive interactive rules and gameplay guide
    │   ├── SettingsModal.tsx     # Customization modal for themes, layouts, speed, audio
    │   ├── SharkSvgLayer.tsx     # High-performance SVG predator vectors & themed ladders
    │   ├── SharkThemeModal.tsx   # Visual palette modal for previewing all 6 shark themes
    │   └── VictoryModal.tsx      # Grand victory podium celebration with confetti
    ├── types/
    │   └── game.ts               # Core TypeScript definitions (Player, Rules, Themes, Api)
    └── utils/
        ├── apiClient.ts          # Unified REST API client with local offline fallback
        ├── audio.ts              # Synthesis-based Web Audio engine (chomps, slides, clatters)
        ├── boardPresets.ts       # Hazard presets (Reef Patrol, Frenzy, Treasure, Gauntlet)
        ├── geometry.ts           # Math for serpentine coordinates and Bezier curves
        └── sharkThemes.ts        # Thematic visual configurations for all 6 shark skins
```

---

<a id="installation"></a>
## 🚀 Installation & Local Setup

### Option A: Node.js & TypeScript (Full-Stack React App)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/snakes-and-ladders-shark-arena.git
   cd snakes-and-ladders-shark-arena
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build production bundle**:
   ```bash
   npm run build
   ```

5. **Typecheck & Lint codebase**:
   ```bash
   npm run lint
   ```

---

### Option B: Python & Flask Engine

If you wish to run the backend using Python and Flask:

1. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute automated unit tests**:
   ```bash
   python3 -m unittest discover tests
   ```

4. **Start the Flask server**:
   ```bash
   python app.py
   ```

---

### Option C: 1-Click Netlify Deployment

This project includes a native `netlify.toml` file ready for instant deployment:

1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to [Netlify](https://app.netlify.com/) and choose **"Add new site"** ➔ **"Import an existing project"**.
3. Select your repository. Netlify detects the settings automatically:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Click **"Deploy Site"** and your game is live!

---

<a id="game-rules"></a>
## 🎲 Game Rules & Mechanics

```
   [100 WIN] <--- 99 <--- 98 <--- 97 <--- 96 <--- 95 <--- 94 <--- 93 <--- 92 <--- 91
      |
      +---> 81 ---> 82 ---> 83 ---> 84 ---> 85 ---> 86 ---> 87 ---> 88 ---> 89 ---> 90
...
      +--->  1 --->  2 --->  3 --->  4 --->  5 --->  6 --->  7 --->  8 --->  9 ---> 10
      ^
 [START BENCH: 0]
```

### 1. Board Traversal
- The board contains 100 tiles numbered in a serpentine zigzag path from Tile 1 (bottom-left) to Tile 100 (top-left).
- All players begin at the **Position 0 Start Bench** outside the board.
- On each turn, the player rolls a 6-sided die and advances their pawn forward by the number rolled.

### 2. 🦈 Shark Predator Hazards (Snakes)
- Landing exactly on a tile containing a **Shark Head** triggers a predatory attack!
- The shark chomps the player's token and pulls them downward along its body to its **Tail tile**.
- In the *Megalodon Gauntlet*, Tile 99 contains an abyssal megalodon that drags unsuspecting players all the way down to Tile 10!

### 3. 🪜 Ladders & Marine Boosts
- Landing on the bottom tile of a **Ladder** triggers an upward climb!
- The player immediately scales the ladder to the top destination tile, gaining a massive shortcut over the competition.

### 4. 🎯 Winning Condition & Exact 100 Rule
- **Standard (Exact 100 Enabled)**: To win, a player must land **exactly** on Tile 100.
  - If a player is on Tile 97 and rolls a 5 (total 102), they overshoot Tile 100. Under tournament rules, they forfeit their movement for that turn and remain at Tile 97.
- **Casual (Exact 100 Disabled)**: Any roll equal to or exceeding the remaining distance to Tile 100 triggers an immediate victory.

### 5. 🎲 Roll of 6 Bonus Turn
- When enabled in House Rules, rolling a **6** grants the player an immediate extra roll on the same turn.

---

<a id="game-modes"></a>
## 🎮 Game Modes

### 🤖 1. Player vs Computer (PvC)
- **Contenders**: 1 Human Player vs 1, 2, or 3 Autonomous AI Bots (`C2`, `C3`, `C4`).
- **Autonomous Play**: AI bots analyze turn state, pause briefly with visual "thinking" status indicators, and roll their dice automatically.
- **Customizable Names**: Personalize the human player's name and bot codenames prior to launch.

### 👥 2. Local Pass & Play Multiplayer
- **Contenders**: 2, 3, or 4 Human Players on the same physical device or screen.
- **Turn Flow**: The game displays clear turn banners (e.g., *"Player 2 (Blue)'s Turn"*), allowing players to pass the device or take turns rolling the 3D dice.
- **Distinct Pawn Colors**: Red (`#EF4444`), Blue (`#06B6D4`), Green (`#10B981`), and Yellow (`#F59E0B`).

### 🌐 3. Remote Online Multiplayer
- **Host Room**: Create a private room with a selected player capacity (2, 3, or 4 players).
- **Shareable 5-Letter Code & Invite Link**: Host receives an alphanumeric code (e.g. `7KF9A`) and can copy the direct URL (`?room=7KF9A`) with a single click.
- **Synchronous Lobby**: Guests enter the code or click the invite link to join. When the room reaches capacity, the host launches the match for all connected contenders.

---

<a id="api-documentation"></a>
## 🌐 API Documentation

The project includes REST API endpoints implemented both in Node.js (`server.ts`) and Flask (`app.py`).

### 1. Initialize New Game
- **Endpoint**: `POST /api/game/new`
- **Description**: Initializes a fresh match with designated players and rules.
- **Request Body**:
  ```json
  {
    "mode": "pvc",
    "players": [
      { "name": "Captain Alex", "is_computer": false, "color": "red" },
      { "name": "Reef Bot", "is_computer": true, "color": "blue" }
    ],
    "exact_finish": true,
    "extra_turn_on_six": true,
    "shark_theme": "great-white",
    "shark_layout": "reef-patrol"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "game_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "current_player": 0,
    "state": {
      "game_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "players": [
        { "id": 0, "name": "Captain Alex", "position": 0, "is_computer": false, "color": "red" },
        { "id": 1, "name": "Reef Bot", "position": 0, "is_computer": true, "color": "blue" }
      ],
      "current_player": 0,
      "game_over": false,
      "winner": null
    }
  }
  ```

### 2. Roll Dice & Execute Turn
- **Endpoint**: `POST /api/game/roll`
- **Description**: Rolls the dice, resolves movement, checks hazards, and determines the next turn.
- **Request Body**:
  ```json
  {
    "game_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "player_id": 0,
    "fixed_dice": null
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "dice_roll": 4,
    "player_id": 0,
    "start_position": 24,
    "landing_position": 28,
    "final_position": 76,
    "event": "ladder",
    "hazard_description": "Climbed Coral Ladder from 28 to 76!",
    "next_player": 1,
    "extra_turn": false,
    "game_over": false,
    "winner": null
  }
  ```

### 3. Remote Room Matchmaking
- **Create Room**: `POST /api/room/create`
  - Body: `{ "max_players": 3, "host_name": "Sarah" }`
  - Returns: `{ "success": true, "room_code": "8M4KP", "player_id": 0 }`
- **Join Room**: `POST /api/room/join`
  - Body: `{ "room_code": "8M4KP", "player_name": "Leo" }`
  - Returns: `{ "success": true, "player_id": 1, "room": { ... } }`
- **Fetch Room Status**: `GET /api/room/status?code=8M4KP`
  - Returns: Current room state, joined contenders, and game launch status.

---

<a id="testing-and-quality-assurance"></a>
## 🧪 Testing & Quality Assurance

The project enforces quality through automated unit testing, TypeScript compilation, and manual gameplay verification.

### Automated Python Unit Tests
The Python test suite (`tests/`) validates board coordinate math, hazard detection, overshoot rules, and turn progression:
```bash
python3 -m unittest discover tests -v
```
**Test Coverage Includes:**
- `test_initial_state`: Confirms players start at Position 0 with `game_over=False`.
- `test_normal_movement`: Validates linear movement across non-hazard tiles.
- `test_ladder_climb`: Verifies automatic advancement from ladder base to ladder apex.
- `test_snake_slide`: Validates demotion from shark head to shark tail.
- `test_exact_winner`: Confirms victory when hitting exactly Tile 100.
- `test_overshoot_rule`: Ensures players remain in place when rolling beyond 100 with `exact_finish=True`.
- `test_six_roll_extra_turn`: Verifies continuation when rolling a 6 with `extra_turn_on_six=True`.
- `test_board_bounds`: Validates that no snake or ladder lands on invalid coordinates ($< 1$ or $> 100$).

### TypeScript Static Validation
Verify zero type discrepancies across the entire React codebase:
```bash
npm run lint
```

---

<a id="performance"></a>
## ⚡ Performance

- **Sustained 60 FPS Animations**: All board SVG layers and 3D dice physics use hardware-accelerated CSS transforms (`transform: translate3d(...)`, `will-change`) to ensure silky 60 FPS transitions on mobile and desktop.
- **Zero Asset Network Overhead**: Sound effects are generated mathematically using the Web Audio API without downloading external audio files.
- **Optimized SVG Path Math**: Shark body Bezier curves are pre-computed once using React `useMemo` hooks and re-rendered only when the layout preset changes.
- **Responsive Layout Engine**: Dynamic SVG viewboxes (`0 0 1000 1000`) scale proportionally across smartphones, tablets, and 4K desktop screens without pixelation or clipping.

---

<a id="privacy-and-security"></a>
## 🔒 Privacy & Security

- **Ephemeral Sessions**: Remote room tokens and game states are stored exclusively in volatile memory and automatically expire after periods of inactivity.
- **No Third-Party Trackers**: Zero telemetry, zero analytics scripts, and zero advertising trackers are included in the bundle.
- **Client-Side Sanitization**: Player names and room input strings are sanitized, truncated to 14 characters, and escaped against script injection attacks.
- **No Secrets in Frontend**: Zero API keys or secrets are exposed in client-side code.

---

<a id="limitations-and-future-enhancements"></a>
## 🚧 Limitations & Future Scope

### Known Limitations
- Remote multiplayer currently uses HTTP REST polling; network latency above 1500ms may cause slight delays in remote pawn synchronization.
- Python Flask backend and Node.js Express backend operate independently based on the runtime environment chosen.

### Future Roadmap
- [ ] **WebSocket Real-Time Engine**: Migrate remote rooms from REST polling to native WebSockets (`Socket.IO` / `ws`) for sub-50ms synchronization.
- [ ] **Interactive Custom Board Creator**: Drag-and-drop tool allowing players to place custom sharks and ladders anywhere on the board.
- [ ] **AI Bot Difficulty Levels**: Introduce "Aggressive", "Cautious", and "Chaos" bot personalities.
- [ ] **Tournament Bracket Mode**: Single-elimination championship brackets for up to 16 players.
- [ ] **Offline PWA Support**: Installable Progressive Web App with offline service worker caching.

---

<a id="contributing"></a>
## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork the Repository**: Click the `Fork` button on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/megalodon-audio-fx
   ```
3. **Commit Your Changes**:
   ```bash
   git commit -m "feat: add abyssal rumble sound to Megalodon Abyss theme"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/megalodon-audio-fx
   ```
5. **Open a Pull Request**: Submit your pull request with a descriptive title and summary of changes.

---

<a id="license"></a>
## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, distribute, and build upon this code for personal or commercial projects.

---

<div align="center">

**Created with ❤️ for board game enthusiasts worldwide.**  
*May the dice roll high and the sharks keep their distance!* 🦈🎲

</div>
