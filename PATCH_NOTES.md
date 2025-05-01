# 📜 Patch Notes Archive

All previous release notes for Connect 4: AI Showdown.

---

## 🛠 Patch Notes — April 29, 2025

✅ **New Features (v3.0.0)**  
- 🎥 Added Spectate Mode for public games
- 📋 Separate modal flows for Spectators vs. Players
- 🛠 Restored circle selection indicators in public/spectate lists
- 👁 Sorted spectators list with "(You)" always first
- 🔇 Removed stale toast messages across screens
- 🎵 Countdown sound effect now synced with visuals
- 🛡️ Defensive server-side socket cleanup and player state fixes
- 🧼 Resolved stale board state after rematches / name changes
- 🧭 New display name persistence logic for modal flow
- 🛰️ Socket ID tracking to differentiate spectators accurately
- 🛡️ Fixed "(You)" label bug when duplicate names exist
- 🧹 General Code cleanup
- 🎨 Highlights players winning moves 

---

## 🛠 Patch Notes — April 23, 2025

- ✨ Victory animation added with blinking glow effect
- 🎵 Lowered volume of victory/defeat sounds to improve user experience across devices.
- 🎨 Extended last-move highlight to support **both players** (not just AI).
- 🧠 Fixed "Impossible" AI bugs
- 🎶 Sound effect additions (victory, defeat, move clinks)
- 🔄 Fully implemented online rematch system with countdown
-  🧹 Fixed issue where public game rooms weren't being cleaned up when a host returned to the main menu.
- 🧹  Improved socket `leaveRoom` and `disconnect` logic for proper lobby list updates.
- 🔄 Removed manual "Refresh" button from the Public Game Lobby. Replaced with a dynamic “🟢 Auto-refreshing” status icon and pulsing dot to signal live updates.

---

## 🛠 Patch Notes — April 15, 2025
 **Changes:**
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
