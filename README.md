# Connect 4: AI Showdown 🎯

🚀 **Want to try it out?**  
Play the game live here 👉 [https://inspiring-fox-28c024.netlify.app](https://inspiring-fox-28c024.netlify.app)

---

🧠 **Connect 4: AI Showdown** — Full Feature Summary

---

### 🧠 1. Game Modes Feature
✅ **Change:**
- Added a game mode menu with two options:
  - 🧑‍🤝‍🧑 Play vs Human
  - 🤖 Play vs Computer

📌 **Files Affected:**
- `App.js`
- `GameMenu.js` (new component)

💡 **Why:**
To allow players to choose between local multiplayer and a single-player experience against AI.

---

### 🤖 2. AI Difficulty Options
✅ **Change:**
- Added four AI difficulty levels:
  - **Easy**: Random valid moves
  - **Medium**:
    - Tries to win if possible
    - Blocks opponent’s winning moves
    - Favors center column
    - Extends its own streaks
  - **Hard**: Uses Minimax with limited depth and basic evaluation
  - **Impossible**: Uses Minimax + Alpha-Beta pruning with evaluation and adaptive depth

📌 **Files Affected:**
- `App.js`
- `GameMenu.js`
- `useAI.js` (new in `/hooks`)

💡 **Why:**
To support scalable difficulty for players of different skill levels and showcase AI logic development.

---

### ✨ 3. Winner UI & Visual Effects
✅ **Change:**
- Added `WinnerBanner.js`
- Confetti animation using `react-confetti`:
  - Starts only on win
  - Stops generating after 5 seconds
  - Falls naturally (via `recycle=false`)

📌 **Files Affected:**
- `App.js`
- `WinnerBanner.js` (new)
- Installed: `react-confetti`, `@react-hook/window-size`

💡 **Why:**
To add visual flair and reinforce satisfying game outcomes.

---

### 🎨 4. UI/UX Polish
✅ **Change:**
- Full visual overhaul:
  - Animated bouncing tokens
  - Title slide-in + glow effect
  - Polished button hover states
  - Font updated to **Poppins**
  - Menu redesigned as a centered card
  - Game board improved with shadows and highlights

📌 **Files Affected:**
- `App.css`
- `App.js`
- `GameMenu.js`

💡 **Why:**
To make the app visually appealing, modern, and portfolio-worthy.

---

### 🧼 5. Codebase Refactor & Modularization
✅ **Change:**
- Modularized major logic components:
  - `Board.js` – board display and cell interaction
  - `WinnerBanner.js` – winner display
  - `GameMenu.js` – mode and difficulty selector
  - `useAI.js` – all AI logic
  - `gameLogic.js` – utility logic (win detection, row finding)

📌 **Files Added:**
- `/components/Board.js`
- `/components/GameMenu.js`
- `/components/WinnerBanner.js`
- `/hooks/useAI.js`
- `/utils/gameLogic.js`

💡 **Why:**
To improve readability, reusability, and maintenance as the game grows.

---

### 🧩 6. Bug Fixes
✅ **Change:**
- Fixed casing mismatch in imports (important on macOS)
- Prevented confetti from appearing at game start
- Fixed `checkWinner` undefined in `useAI.js`
- Resolved missing React hook dependency warning
- Highlighted last AI move correctly

📌 **Files Affected:**
- `App.js`
- `useAI.js`
- General file/folder organization

💡 **Why:**
To ensure stability and correct game behavior.

---

### 🚀 7. Impossible AI (Perfect Play Mode)
✅ **Change:**
- Implemented `makeAIMoveImpossible()` using Minimax + Alpha-Beta Pruning
- Added adaptive depth depending on remaining moves for performance
- Includes a full evaluation heuristic:
  - Center control
  - Streaks of 2–4
  - Blocking opponent threats

📌 **Files Affected:**
- `useAI.js`
- `App.js`
- `GameMenu.js`

💡 **Why:**
To simulate near-perfect play. This is the ultimate test for skilled players.

🔐 **Fun Fact:** Connect 4 is a solved game — first player can always win with perfect play!

---

### 💡 8. Fun Facts + Developer Touches
✅ **Change:**
- Added a cycling `fun-fact` card to the main menu
- Displays trivia, strategy tips, and dev notes
- Subtle animations for transitions

📌 **Files Affected:**
- `GameMenu.js`
- `App.css`

💡 **Why:**
To add character, polish, and personality.

---

### 🌟 Final Touches
- Updated favicon and webpage title to **"Connect 4: AI Showdown"**
- Improved button styles, shadows, animations
- Cleaned and optimized CSS
- Game is mobile-friendly and visually consistent across screen sizes

---

