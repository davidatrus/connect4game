# Connect 4: AI Showdown 🎯

🚀 **Want to try it out?**  
Play the game live here 👉 [https://connect4game.onrender.com](https://connect4game.onrender.com)  
_(Previously on Netlify — now hosted on Render with a full backend server)_

---

🧠 **Connect 4: AI Showdown** — Full Feature Summary

---

### 🌐 0. NEW: Online Multiplayer Mode 🎮
✅ **Changes:**
- Added full **online multiplayer support**:
  - Create or join a private room via code
  - Host public rooms and join via browserable lobby
  - Real-time gameplay with Socket.IO
  - Synced rematches with countdowns
  - Player name display and disconnection handling

📌 **Files Affected:**
- `App.js`
- `GameMenu.js`
- `socket.js`
- `server.js` (backend logic)

💡 **Why:**
To turn the game into a social, real-time experience — challenge your friends or random opponents online!

---

### 🧠 1. Game Modes Feature
✅ **Changes:**
- Added a game mode menu with three options:
  - 🧑‍🤝‍🧑 Local Play vs Human
  - 🤖 Play vs AI
  - 🌐 Play Online

📌 **Files Affected:**
- `App.js`
- `GameMenu.js`

💡 **Why:**
To support every kind of player — solo, local, and online.

---

### 🤖 2. AI Difficulty Options
✅ **Changes:**
- Four levels: Easy, Medium, Hard, Impossible
- Logic scales from random to perfect Minimax + Alpha-Beta play

📌 **Files Affected:**
- `App.js`, `GameMenu.js`, `useAI.js`

💡 **Why:**
To showcase AI design and make the game engaging at all skill levels.

---

### ✨ 3. Winner UI & Confetti
✅ **Changes:**
- `WinnerBanner.js`
- Confetti triggered only when a player wins (using `react-confetti`)


---

### 🎨 4. UI/UX Polish
✅ Animated tokens, glowing title, button hovers, `Poppins` font, polished layout, and mobile support.

---

### 🧼 5. Refactor & Modularization
✅ Organized the codebase into `/components`, `/hooks`, `/utils`

---

### 🐛 6. Bug Fixes
✅ **Changes:**
- Resolved a number of key multiplayer bugs:
  - Fixed bug where both online players had the same name
  - Fixed room state not cleaning up properly after host/guest disconnection
  - Fixed bug where name from previous match would persist incorrectly
  - Fixed rematch bugs across all modes (AI, Local, Online)
- AI Rematch Flow:
  - Added prompt to allow player to **keep the same AI difficulty** or **change to a different one** on rematch
  - Disabled selecting the same level again during difficulty selection
- General:
  - Prevented confetti from appearing on load
  - Correctly highlighted last move for AI
  - Resolved casing mismatches and React hook dependency warnings

---

### 🚀 7. Impossible AI (Perfect Play Mode)
✅ Uses full Minimax + Alpha-Beta pruning with dynamic depth and evaluation scoring

---

### 💡 8. Fun Facts + Developer Touches
✅ Rotating trivia card, subtle transitions, and little touches throughout

---

### 🔧 9. Deployment & Hosting (NEW)
✅ Switched from Netlify (frontend-only) to **Render** for full backend support:
- Socket.IO server now lives in the same Render service as the React frontend
- Simplified environment, no CORS hacks or proxies
- Single deploy pipeline

💡 **Why the switch?**
To support real-time multiplayer, you need a persistent Node.js server — Render made full-stack deployment seamless.

---

### 🔊 10. Sound Effects Integration
✅ **Changes:**
- Added custom audio to enhance feedback and immersion:
  - ✅ Victory & Defeat chimes
  - ✅ Click sound for dropping a token
  - ✅ Countdown ticking sound before rematch
  - ✅ Disconnect alert sound when opponent leaves

📌 **Files Affected:**
- `App.js`, `WinnerBanner.js`, and sound utility logic

---

### 🗂 Folder Structure (Simplified)
```
/client         ← React frontend (builds to /client/build)
/server.js      ← Express + Socket.IO backend
/components     ← UI pieces (Board, Menu, WinnerBanner)
/hooks          ← Custom hooks (AI logic)
/utils          ← Utility functions (checkWinner, etc.)
```

---

### 📌 Current Version: `v2.0.0`  
- `v1.x`: AI-focused single-player release  
- `v2.0`: Online Multiplayer + Render Hosting