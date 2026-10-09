# 📊 Technical Report — Game Logic & State Management

A rigorous technical breakdown of the mathematical algorithms, coordinate transforms, state management patterns, and network protocols powering the Snakes & Ladders Grand Arena.

---

## 🧮 1. Mathematical Model & Coordinate System

### 1.1 Serpentine Board Coordinate Transformation

A standard 10x10 Snake & Ladder board numbers tiles from 1 at the bottom-left to 100 at the top-left in an alternating serpentine pattern:

```
Row 9 (top):     100  99  98  97  96  95  94  93  92  91  (left-to-right)
Row 8:            81  82  83  84  85  86  87  88  89  90  (right-to-left)
...
Row 1:            20  19  18  17  16  15  14  13  12  11  (right-to-left)
Row 0 (bottom):    1   2   3   4   5   6   7   8   9  10  (left-to-right)
```

Given any tile position $P \in [1, 100]$:
- Zero-indexed rank: $i = P - 1$
- Vertical row from bottom: $r = \lfloor i / 10 \rfloor$
- Inverted row index (SVG Y-axis, 0 at top): $row = 9 - r$
- Horizontal column $c$:
  $$\text{col} = \begin{cases} i \pmod{10} & \text{if } r \text{ is even} \\ 9 - (i \pmod{10}) & \text{if } r \text{ is odd} \end{cases}$$

### 1.2 SVG Screen Space Mapping
In a normalized $1000 \times 1000$ SVG canvas with tile width $W = 100$:
$$\text{Tile Center } X = \text{col} \times 100 + 50$$
$$\text{Tile Center } Y = \text{row} \times 100 + 50$$

---

## 🦈 2. Shark Hazard Geometry & Bezier Curves

Unlike simple straight lines, the predatory sharks use cubic Bezier splines $B(t)$ with perpendicular normal offsets to produce realistic curving predator bodies:

Given Head tile center $(x_1, y_1)$ and Tail tile center $(x_2, y_2)$:
1. Vector: $\vec{D} = (x_2 - x_1, y_2 - y_1)$
2. Length: $L = \|\vec{D}\|$
3. Perpendicular normal: $\vec{N} = (-D_y / L, D_x / L)$
4. Control points with lateral curvature offset $\delta$:
   $$C_1 = (x_1 + 0.33 D_x + \delta N_x, y_1 + 0.33 D_y + \delta N_y)$$
   $$C_2 = (x_1 + 0.66 D_x - \delta N_x, y_1 + 0.66 D_y - \delta N_y)$$
5. Spline:
   $$B(t) = (1-t)^3 P_1 + 3(1-t)^2 t C_1 + 3(1-t) t^2 C_2 + t^3 P_2 \quad (t \in [0, 1])$$

At $t=0$, the angle of trajectory $\theta = \operatorname{atan2}(C_1.y - y_1, C_1.x - x_1)$ is used to rotate the shark skull SVG template, aligning open jaws directly with the landing tile.

---

## 🎲 3. Turn Progression & House Rules Engine

### 3.1 Overshoot & Exact 100 Rule
When a player at position $P$ rolls dice value $D$:
- Target position $T = P + D$
- If $T > 100$:
  - When `exact100 == true`: $T_{\text{resolved}} = P$ (turn forfeits movement or bounces).
  - When `exact100 == false`: $T_{\text{resolved}} = 100$ (player reaches finish).

### 3.2 Hazard & Boost Map Evaluation
After step animation reaches target $T_{\text{resolved}}$:
1. Lookup in `snakes[T_{\text{resolved}}]`:
   - If match found: player position slides down to `snakes[T_{\text{resolved}}]`.
   - Event logged as `shark` / `snake`.
2. Lookup in `ladders[T_{\text{resolved}}]`:
   - If match found: player position climbs to `ladders[T_{\text{resolved}}]`.
   - Event logged as `ladder`.
3. If $P_{\text{final}} == 100$: match concludes, `game_over = true`, winner logged.

### 3.3 Six-Roll Continuation
If dice value $D == 6$ and `extraTurnOnSix == true` and match is not over:
- Player retains turn index.
- Else: $\text{currentPlayer} = (\text{currentPlayer} + 1) \bmod N_{\text{players}}$.

---

## 🔊 4. Zero-Dependency Web Audio Synthesis

Audio cues are generated on-the-fly using the HTML5 `AudioContext` without external sound asset dependencies:
- **Dice Rattle**: Random frequency white-noise bursts passed through a high-pass biquad filter.
- **Shark Chomp**: Exponential downward pitch sweep ($240\text{ Hz} \to 45\text{ Hz}$) with high gain distortion shaping, paired with a sub-bass percussion thump.
- **Ladder Ascent**: Arpeggiated pentatonic sine-wave chord progression with linear decay envelopes.
- **Victory Fanfare**: Multi-voice harmonic brass synthesis ($C_5 - E_5 - G_5 - C_6$).

---

## 🌐 5. REST Network Protocol & Synchronization

Both Express and Flask implement synchronous REST interfaces with atomic transactions:
- `POST /api/game/new`: Initializes a fresh session and seeds player states.
- `POST /api/game/roll`: Atomically computes roll, step trajectory, hazard triggers, and next player turn.
- `GET /api/game/state`: Retrieves full board state for spectator or reconnect scenarios.
- `POST /api/room/create` & `POST /api/room/join`: Session room pairing with 5-character alphanumeric room tokens.
