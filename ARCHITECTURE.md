# 🏗️ Architecture Document — Snakes & Ladders Grand Arena

An end-to-end architectural breakdown of the Snakes & Ladders Grand Arena system, covering system topology, state synchronization, component hierarchy, game engine design, and client-server communication.

---

## 🧭 System Overview

Snakes & Ladders Grand Arena is designed as a hybrid full-stack web application featuring:
1. **Frontend Presentation & Interaction Layer**: Built with **React 19**, **TypeScript**, and **Tailwind CSS 4**, delivering 60 FPS SVG board rendering, 3D CSS dice physics, dynamic shark predator animations, responsive board geometry, and synthesis-based Web Audio cues.
2. **Dual-Backend Capabilities**:
   - **Node.js / Express Server (`server.ts`)**: Handles local full-stack development, server-authoritative room state management, in-memory room pooling, and live session routing.
   - **Flask Python Game Engine (`app.py` & `game/`)**: Provides an object-oriented Python game engine implementing deterministic board logic, serpentine coordinate calculation, dice rolling algorithms, and snake/ladder resolution with full unit-test coverage.

---

## 🧩 High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|                                                                                   |
|  +------------------------+  +--------------------------+  +-------------------+  |
|  |     Landing Page       |  |     Game Board Arena     |  |   Remote Lobby    |  |
|  | (Mode/Player/Shark UI) |  |   (SVG Sharks & Rails)   |  | (Code/Link Share) |  |
|  +------------------------+  +--------------------------+  +-------------------+  |
|              |                             |                         |            |
|              v                             v                         v            |
|  +-----------------------------------------------------------------------------+  |
|  |                             App State (React)                               |  |
|  |   • players[]         • rules (sharkTheme, sharkLayout, speed, sound)       |  |
|  |   • currentPlayer     • moveLogs[]        • winner / podium                 |  |
|  +-----------------------------------------------------------------------------+  |
|         |                                    |                        |           |
|         v                                    v                        v           |
|  +--------------------+             +------------------+     +-----------------+  |
|  | 3D Dice Controller |             | Web Audio Synth  |     |  API Client     |  |
|  | (CSS 3D Transforms)|             | (Chomp, Gliss.)  |     |  (REST Polling) |  |
|  +--------------------+             +------------------+     +-----------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                                         | HTTP JSON REST API
                                         v
+-----------------------------------------------------------------------------------+
|                             BACKEND REST SERVICES                                 |
|                                                                                   |
|  +------------------------------------+   +------------------------------------+  |
|  |      Express Engine (server.ts)    |   |     Flask Engine (app.py, game/)   |  |
|  |  • Room lifecycle & matchmaking    |   |  • GameEngine object model         |  |
|  |  • Shark Layout map resolution     |   |  • Board & Serpentine mapping      |  |
|  |  • In-memory session store         |   |  • Turn sequence & win validation  |  |
|  +------------------------------------+   +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 🎨 Frontend Architecture & Component Hierarchy

The frontend is structured modularly with clear separation of concerns:

- `src/main.tsx`: Entry point mounting the React root.
- `src/App.tsx`: Central coordinator managing match lifecycle, turn automation, bot timers, and modals.
- `src/components/GameBoard.tsx`: 10x10 serpentine grid layout with responsive tile coordinate calculation and player token clustering.
- `src/components/SharkSvgLayer.tsx`: High-performance SVG overlay rendering predatory shark geometry (jaws, teeth, dorsal fins, gills) and themed ladder tracks.
- `src/components/SharkThemeModal.tsx`: Interactive palette preview modal for switching visual shark skins and board hazard presets.
- `src/components/Dice3D.tsx`: 3D animated cube utilizing hardware-accelerated CSS 3D transforms (`rotateX`, `rotateY`).
- `src/components/LandingPage.tsx`: Game setup portal with mode selection (PvC, Pass & Play, Online), player customization, and live hero board.
- `src/components/AnimatedBoardHero.tsx`: Dynamic animated hero board displaying AI tokens traversing the board in real time.
- `src/components/RemoteRoomLobby.tsx`: Online room matchmaking lobby with 1-click clipboard link sharing and player readiness status.
- `src/components/SettingsModal.tsx`: Gameplay customization for animation speed, exact-100 win toggle, extra turns on six, and sound toggles.
- `src/components/RulesModal.tsx`: Visual rule guide explaining movement, shark bite hazards, ladder ascents, and dice mechanics.
- `src/components/VictoryModal.tsx`: Post-game championship screen with confetti particles and podium standings.
- `src/components/MoveLogDrawer.tsx`: Collapsible ledger tracking roll history, shark bites, ladder climbs, and player turns.

---

## 🦈 Shark Board Layout Architecture

The Shark Board System is split into two orthogonal layers:

1. **Visual Theme Layer (`sharkThemes.ts`)**:
   - `great-white`: Classic deep-ocean navy and sapphire tones with Great White conical snouts and razor teeth.
   - `hammerhead`: Tropical coral reef turquoise with wide cephalofoil heads and lateral eye stalks.
   - `megalodon`: Abyssal volcanic black and crimson magma with giant serrated prehistoric jaws.
   - `cyber-shark`: Neon synthwave purple/cyan matrix with laser fins and holographic ladder rungs.
   - `pirate-shark`: Shipwreck atoll tones with plundered gold accents and weathered bone ladders.
   - `classic-snake`: Traditional emerald and jade serpent textures for classic tabletop enthusiasts.

2. **Hazard Layout Presets (`boardPresets.ts`)**:
   - `reef-patrol`: Standard balanced distribution (10 sharks, 9 ladders).
   - `shark-frenzy`: High-risk predator feeding ground with 12 sharks clustered near upper rows.
   - `treasure-dive`: High-speed ascent layout with 11 ladders including deep-to-surface boosts.
   - `megalodon-gauntlet`: Extreme survival gauntlet featuring 13 sharks and a deadly 99 -> 10 penalty.

---

## 🔄 Turn State Machine & Data Flow

1. **Player Turn Initialization**:
   - App checks whether active player is human or AI.
   - If AI: trigger randomized thinking delay (400ms - 900ms) and automatic roll.
   - If Human: unlock 3D dice button and enable spacebar roll trigger.

2. **Dice Roll & Physics**:
   - 3D cube triggers rotation sequence (3 to 5 full revolutions).
   - Web Audio triggers synthetic dice rattle clicks.
   - Result integer (1 to 6) is resolved either locally or via the server API.

3. **Step-by-Step Movement**:
   - Token steps through each tile sequentially with audio tick cues.
   - Tile coordinates calculated dynamically using 10x10 serpentine alternating math:
     - Row: `9 - floor((pos - 1) / 10)`
     - Column: Even rows move left-to-right (`(pos - 1) % 10`), odd rows move right-to-left (`9 - (pos - 1) % 10`).

4. **Hazard & Boost Resolution**:
   - **Shark Head**: Triggers shark bite animation, screen shake, audio chomp, and slide down to tail tile.
   - **Ladder Base**: Triggers ascension chime, golden highlight, and upward climb to top tile.
   - **Exact 100 Rule**: If roll overshoots 100 with `exact100=true`, player bounces back or stays put.

5. **Turn Transition / Extra Turn**:
   - If player rolled 6 and `extraTurnOnSix=true`, player retains the turn.
   - Otherwise, advance turn to `(currentPlayer + 1) % totalPlayers`.
