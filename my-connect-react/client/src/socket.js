// src/socket.js
import { io } from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:4000'
);

export default socket;
