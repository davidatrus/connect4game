# Connect 4: AI Showdown 🎯

🚀 **Want to try it out?**  
Play the game live here 👉 [https://connect4game.onrender.com](https://connect4game.onrender.com)  
_(Previously on Netlify — now hosted on Render with a full backend server)_

---

🧠 **Connect 4: AI Showdown** — Full Feature Summary

---

### 🌐 0. NEW: Spectate Online Public Games 👁️
-  Browse and spectate active public games in real time
- Watch games live without participating or disrupting play

✅ **Changes:**
- Added full **Spectator Mode** for online public games:
  - Dedicated Spectator UI showing Players and Spectators
  - Smooth transition between spectating and playing
  - New modals for "Spectate Another Game" and "Play Your Own Game"
  - Smart handling of spectator disconnections and room closures
  - Fixed '(You)' label bugs  and name collision issues
  - Improved display name persistence and state cleanup for spectators

📌 **Files Affected:**
- `App.js`
- `GameMenu.js`
- `OnlineMenu.js`
- `server.js`
- `useSocketListeners.js`
- `EnterNameScreen.js`
- `gameReset.js`

💡 **Why:**  
To make online play more dynamic and engaging. Even if you aren't competing, you can still watch the action live!

---


### 🌐 1. Online Multiplayer Mode 🎮
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
To turn the game into a social, real-time experience. Challenge your friends or random opponents online!

---

### 🧠 2. Game Modes Feature
✅ **Changes:**
- Added a game mode menu with three options:
  - 🧑‍🤝‍🧑 Local Play vs Human
  - 🤖 Play vs AI
  - 🌐 Play Online

---

### 🤖 3. AI Difficulty Options
✅ **Changes:**
- Four levels: Easy, Medium, Hard, Impossible
- Logic scales from random to perfect Minimax + Alpha-Beta play

📌 **Files Affected:**
- `App.js`, `GameMenu.js`, `useAI.js`

💡 **Why:**
To showcase AI design and make the game engaging at all skill levels.

---

### ✨ 4. Winner UI & Confetti
✅ **Changes:**
- `WinnerBanner.js`
- Confetti triggered only when a player wins (using `react-confetti`)


---

### 🎨 5. Visual and Audio Polish
- 🎨 Clean, responsive UI
- 🔊 Sound effects: victory, defeat, move clinks
- 🎆 Confetti win animation
- 🕹️ Player labels and real-time game state

---

### 🚀 6. Impossible AI (Perfect Play Mode)
✅ Uses full Minimax + Alpha-Beta pruning with dynamic depth and evaluation scoring

---


### 🔊 7. Sound Effects Integration
✅ **Changes:**
- Added custom audio to enhance feedback and immersion:
  - ✅ Victory & Defeat chimes
  - ✅ Click sound for dropping a token
  - ✅ Countdown ticking sound before rematch
  - ✅ Disconnect alert sound when opponent leaves

---

### 🗂 Folder Structure (Simplified)
```
/client         ← React frontend (builds to /client/build)
/server.js      ← Express + Socket.IO backend
/components     ← UI pieces (Board, Menu, WinnerBanner,OnlineMenu,EnterNameScreen)
/hooks          ← Custom hooks (AI logic,FunFacts,SocketListeners)
/utils          ← Utility functions (checkWinner, gameReset, gameLogic, etc)
```

---

### 📌 Current Version: `v3.0.0`  
- `v1.x`: AI-focused single-player release  
- `v2.x`: Online Multiplayer + Render Hosting  
- `v3.0`: Spectate Mode for Public Online Games 🎥

---

### 🛠Latest Patch — April 29, 2025 - Spectator Mode Now Live

> 📄 Full changelog in [`/PATCH_NOTES.md`](./PATCH_NOTES.md)

✅ Highlights:
- Spectator Mode
- Countdown sound fix
- Highlight Winning Moves
- New Game board legend for player and spectator
- Name modal refinements
- Room cleanup improvements
- ESLint and UI bugs fixed

---