// server.js
console.log("🟡 Starting backend...");

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
});

const roomPlayers = {}; // 🔐 Maps roomCode → { host, guest }

function findAvailableRow(board, col) {
  for (let row = board.length - 1; row >= 0; row--) {
    if (!board[row][col]) return row;
  }
  return -1;
}

io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  function broadcastUpdatedPublicGames() {
    const publicGames = Object.entries(roomPlayers)
      .filter(([code, data]) => {
        const roomExists = io.sockets.adapter.rooms.has(code);
        return data.isPublic && !data.guest && roomExists;
      })
      .map(([code, data]) => ({
        roomCode: code,
        hostName: data.host
      }));

    io.emit('publicGamesList', publicGames);
  }

  socket.on('createRoom', ({ roomCode, name, isPublic }) => {
    socket.roomCode = roomCode;
    socket.join(roomCode);
    socket.isSpectator = false;

    roomPlayers[roomCode] = {
      host: name,
      hostSocket: socket.id,
      isPublic,
      spectators: [],
      board: Array(6).fill(null).map(() => Array(7).fill(null)),
      currentPlayer: 1
    };

    console.log(`🏠 ${name} is hosting ${isPublic ? 'a public' : 'a private'} room: ${roomCode}`);
    io.to(roomCode).emit('roomUpdate', { message: `${name} created room.` });

    broadcastUpdatedPublicGames();
  });

  socket.on('getPublicGames', (mode = 'join') => {
    const publicGames = Object.entries(roomPlayers)
      .filter(([_, data]) => {
        if (!data.isPublic) return false;
        if (mode === 'join') return !data.guest;
        return true;
      })
      .map(([code, data]) => ({ roomCode: code, hostName: data.host }));

    socket.emit('publicGamesList', publicGames);
  });

  socket.on('joinAsSpectator', (roomCode, name) => {
    const room = roomPlayers[roomCode];
    if (!room || !io.sockets.adapter.rooms.get(roomCode)) {
      socket.emit('errorMessage', 'Game not found.');
      return;
    }

    if (!room.spectators) room.spectators = [];
    if (room.spectators.length >= 10) {
      socket.emit('errorMessage', 'Room has reached max spectators.');
      return;
    }

    socket.roomCode = roomCode;
    socket.isSpectator = true;
    socket.spectatorName = name;
    socket.join(roomCode);
    room.spectators.push({ id: socket.id, name: name || 'Unknown' });

    if (room.host && room.guest) {
      socket.emit('playerInfo', {
        host: room.host,
        guest: room.guest,
        playerNumber: 0
      });
    }

    console.log(`👁️ ${name} is now spectating room ${roomCode}`);
    io.to(roomCode).emit('spectatorUpdate', room.spectators);

    socket.emit('syncBoard', {
      board: room.board,
      currentPlayer: room.currentPlayer || 1
    });
  });

  socket.on('joinRoom', ({ roomCode, name }) => {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const players = roomPlayers[roomCode];

    if (!room || !players || players.guest) {
      socket.emit('errorMessage', 'Room is full or does not exist.');
      return;
    }

    socket.roomCode = roomCode;
    socket.join(roomCode);
    console.log(`🙋‍♂️ ${name} joined room ${roomCode}`);

    players.guest = name;
    socket.isSpectator = false; 

    io.to(roomCode).emit('roomUpdate', { message: `${name} joined the game!` });

    const socketsInRoom = [...room];
    const playerSockets = socketsInRoom.filter(
      id => !io.sockets.sockets.get(id)?.isSpectator
    );

    if (playerSockets.length === 2) {
      const { host, guest } = players;
      io.to(roomCode).emit('playerInfo', {
        host,
        guest
      });

      io.to(playerSockets[0]).emit('playerNumber', 1);
      io.to(playerSockets[1]).emit('playerNumber', 2);
      broadcastUpdatedPublicGames();
    }

    io.to(roomCode).emit('spectatorUpdate', players.spectators || []);
     // ✅ Defensive fallback in case playerSockets.length !== 2 but both names are set
  if (players.host && players.guest) {
    io.to(roomCode).emit('playerInfo', {
      host: players.host,
      guest: players.guest
    });
  }
  });

  socket.on('makeMove', ({ roomCode, move }) => {
    const room = roomPlayers[roomCode];
    if (!room) return;

    const nextPlayer = move.player === 1 ? 2 : 1;
    if (!room.board) {
      room.board = Array(6).fill(null).map(() => Array(7).fill(null));
    }
    const row = findAvailableRow(room.board, move.col);
    if (row !== -1) {
      room.board[row][move.col] = move.player;
    }

    room.currentPlayer = nextPlayer;

    console.log(`📤 Broadcasting move to ALL in room ${roomCode}:`, move);

    io.to(roomCode).emit('opponentMove', {
      col: move.col,
      player: move.player,
      nextPlayer
    });
  });

  socket.on('rematchRequest', (roomCode) => {
    console.log(`🔁 Rematch requested in room ${roomCode}`);
    socket.to(roomCode).emit('rematchRequest');
  });

  socket.on('startRematch', (roomCode) => {
    console.log(`🎬 Starting rematch in room ${roomCode}`);
    const room = roomPlayers[roomCode];
    if (!room) return;

    // ✅ Clear board immediately on server
    room.board = Array(6).fill(null).map(() => Array(7).fill(null));
    room.currentPlayer = 1;

    io.to(roomCode).emit('startRematch');

    if (room?.spectators) {
      io.to(roomCode).emit('spectatorUpdate', room.spectators);
    }
  });

  socket.on('rematchAccepted', (roomCode) => {
    console.log(`✅ Rematch accepted in room ${roomCode}`);
    io.to(roomCode).emit('startRematch');
  });

  socket.on('rematchDeclined', (roomCode) => {
    console.log(`❌ Rematch declined in room ${roomCode}`);
    io.to(roomCode).emit('rematchDeclined');
    delete roomPlayers[roomCode];
    io.to(roomCode).emit('roomClosed');
    broadcastUpdatedPublicGames();
  });
  socket.on('boardReadyForSync', ({ roomCode, board, currentPlayer }) => {
    const room = roomPlayers[roomCode];
    if (!room) return;
  
    // Save new board and currentPlayer
    room.board = board;
    room.currentPlayer = currentPlayer;
  
    // Sync this new board to any new spectators that join
    console.log(`🛰️ Server received fresh boardReadyForSync in ${roomCode}`);
  });

  socket.on('leaveRoom', (roomCode) => {
    console.log(`🚪 Player is leaving room ${roomCode}`);
    const room = roomPlayers[roomCode];
    if (!room) return;

    if (socket.isSpectator) {
      room.spectators = room.spectators.filter(s => s.id !== socket.id);
      socket.leave(roomCode);
      io.to(roomCode).emit('spectatorUpdate', room.spectators);
      console.log(`👁️ Spectator ${socket.spectatorName} left room ${roomCode}`);
      return;
    }

    io.to(roomCode).emit('opponentLeft');
    io.to(roomCode).emit('roomClosed');
    delete roomPlayers[roomCode];
    socket.leave(roomCode);
    console.log(`🧹 Room ${roomCode} deleted on player leave`);

    broadcastUpdatedPublicGames();
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);

    const roomCode = socket.roomCode;
    const roomData = roomPlayers[roomCode];
    if (!roomCode || !roomData) return;

    if (socket.isSpectator && roomData.spectators) {
      roomData.spectators = roomData.spectators.filter(s => s.id !== socket.id);
      io.to(roomCode).emit('spectatorUpdate', roomData.spectators);
      console.log(`👁️ Spectator ${socket.spectatorName} left ${roomCode}`);
      socket.leave(roomCode);
      return;
    }

    io.to(roomCode).emit('opponentLeft');
    delete roomPlayers[roomCode];
    io.to(roomCode).emit('roomClosed');
    socket.leave(roomCode);
    console.log(`🧹 Room ${roomCode} deleted after player disconnect`);

    broadcastUpdatedPublicGames();
  });
});

// Serve frontend static files in production
const path = require('path');
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
