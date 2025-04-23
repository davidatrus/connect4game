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

io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);
  function broadcastUpdatedPublicGames() {
    const publicGames = Object.entries(roomPlayers)
      .filter(([_, data]) => data.isPublic && !data.guest)
      .map(([code, data]) => ({ roomCode: code, hostName: data.host }));
  
    io.emit('publicGamesList', publicGames);
  }

  socket.on('createRoom', ({ roomCode, name, isPublic }) => {
    socket.roomCode = roomCode; // ✅ Track roomCode for this socket
    socket.join(roomCode);
    roomPlayers[roomCode] = { host: name, isPublic };
    console.log(`🏠 ${name} is hosting ${isPublic ? 'a public' : 'a private'} room: ${roomCode}`);
    io.to(roomCode).emit('roomUpdate', { message: `${name} created room.` });

    broadcastUpdatedPublicGames();
  });
  socket.on('getPublicGames', () => {
    const publicGames = Object.entries(roomPlayers)
      .filter(([_, data]) => data.isPublic && !data.guest)
      .map(([code, data]) => ({ roomCode: code, hostName: data.host }));
    socket.emit('publicGamesList', publicGames);
  });

  socket.on('joinRoom', ({ roomCode, name }) => {
    const room = io.sockets.adapter.rooms.get(roomCode);

    if (room && room.size === 1) {
      socket.roomCode = roomCode; // ✅ Track roomCode for this socket
      socket.join(roomCode);
      console.log(`🙋‍♂️ ${name} joined room ${roomCode}`);

      if (!roomPlayers[roomCode]) {
        roomPlayers[roomCode] = {};
      }

      roomPlayers[roomCode].guest = name;
      broadcastUpdatedPublicGames();

      io.to(roomCode).emit('roomUpdate', { message: `${name} joined the game!` });

      const { host, guest } = roomPlayers[roomCode];
      const sockets = [...room];

      if (sockets.length === 2) {
        io.to(sockets[0]).emit('playerInfo', {
          myName: host,
          opponentName: guest,
          playerNumber: 1
        });

        io.to(sockets[1]).emit('playerInfo', {
          myName: guest,
          opponentName: host,
          playerNumber: 2
        });
      }
    } else {
      socket.emit('errorMessage', 'Room is full or does not exist.');
    }
  });

  socket.on('makeMove', ({ roomCode, move, nextPlayer }) => {
    console.log(`📥 Received move for room ${roomCode}`);
    console.log('Move details:', move);
    console.log('Next player should be:', nextPlayer);
    console.log(`📤 Relaying move to opponent in room ${roomCode}`);
    socket.to(roomCode).emit('opponentMove', { ...move, nextPlayer });
  });

  socket.on('rematchRequest', (roomCode) => {
    console.log(`🔁 Rematch requested in room ${roomCode}`);
    socket.to(roomCode).emit('rematchRequest');
  });

  socket.on('startRematch', (roomCode) => {
    console.log(`🎬 Starting rematch in room ${roomCode}`);
    io.to(roomCode).emit('startRematch');
  });

  socket.on('rematchAccepted', (roomCode) => {
    console.log(`✅ Rematch accepted in room ${roomCode}`);
    io.to(roomCode).emit('startRematch');
  });

  socket.on('rematchDeclined', (roomCode) => {
    console.log(`❌ Rematch declined in room ${roomCode}`);
    io.to(roomCode).emit('rematchDeclined');
  });

  socket.on('leaveRoom', (roomCode) => {
    console.log(`🚪 Player is leaving room ${roomCode}`);
  
    if (!roomPlayers[roomCode]) return;
  
    io.to(roomCode).emit('opponentLeft');
    delete roomPlayers[roomCode];
    socket.leave(roomCode);
  
    console.log(`🧹 Room ${roomCode} deleted on leave`);
    broadcastUpdatedPublicGames();
  });
  
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  
    const roomCode = socket.roomCode;
    if (!roomCode || !roomPlayers[roomCode]) return;
  
    io.to(roomCode).emit('opponentLeft');
    delete roomPlayers[roomCode];
    socket.leave(roomCode);
  
    console.log(`🧹 Room ${roomCode} deleted on disconnect`);
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