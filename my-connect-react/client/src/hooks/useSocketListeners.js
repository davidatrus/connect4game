import { useEffect } from 'react';
import socket from '../socket';

export function useSocketListeners({
  gameMode,
  gameCode,
  board,
  setBoard,
  setCurrentPlayer,
  setWinner,
  setSpectators,
  setPlayerNames,
  setDisplayName,
  setOpponentName,
  setMyPlayerNumber,
  setMenuScreen,
  isSpectator,
  resetGame,
  applyMove,
  currentPlayerRef,
  setCountdownText,
  boardSyncedRef,
  boardRef,
  toast,
  victoryRef,
  countdownRef,
  defeatRef,
  disconnectRef,
  isSpectatorRef,
  setShowConfetti,
  setRecycleConfetti,
  setLastMove,
  setWinningCells,
  setRematchRequestModal,
  setGameMode,
  createBoard,
  hasSetDisplayNameRef,
  setMySocketId,
}) {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('🔌 Connected with socket ID:', socket.id);
      setMySocketId(socket.id);
    });
    // Room Updates
    socket.on('roomUpdate', (data) => {
      console.log('🟢 Room update:', data.message);
      if (data.opponentName) {
        setOpponentName(data.opponentName);
      }
    });

    socket.on('errorMessage', (msg) => {
      alert(`⚠️ ${msg}`);
    });

    socket.on('spectatorUpdate', (updatedSpectators) => {
      console.log('👥 Updated list of spectators:', updatedSpectators);
      setSpectators(updatedSpectators);
    });

    socket.on('currentTurnUpdate', (nextPlayer) => {
      console.log('🔄 Updating current turn to:', nextPlayer);
      currentPlayerRef.current = nextPlayer;
      setCurrentPlayer(nextPlayer);
    });

    socket.on('syncBoard', ({ board, currentPlayer }) => {
      console.log('🔄 Syncing board for new spectator:', { board, currentPlayer });
      setBoard(board);
      currentPlayerRef.current = currentPlayer;
      setCurrentPlayer(currentPlayer);
      setWinner(null);
    });

    socket.on('startRematch', () => {
      console.log("🎬 Received 'startRematch' from server!");
      setWinner(null);
    
      if (setCountdownText) {
        const steps = ['GAME STARTS IN: 3...', '2...', '1...', 'Start!!!'];
        let index = 0;
    
        setCountdownText(steps[index]); // ⬅️ Show first message immediately
    
        // ✅ Immediately play countdown sound for "3..."
        if (countdownRef.current) {
          countdownRef.current.currentTime = 0;
          countdownRef.current.play().catch(err => {
            console.warn("🔇 Could not play countdown sound:", err);
          });
        }
    
        const interval = setInterval(() => {
          index++;
    
          if (index === steps.length) {
            clearInterval(interval);
            setCountdownText(null);
            boardSyncedRef.current = false;
    
            const newBoard = Array(6).fill(null).map(() => Array(7).fill(null));
            setBoard(newBoard);
            setCurrentPlayer(1);
            currentPlayerRef.current = 1;
            setWinner(null);
            setShowConfetti(false);
            setRecycleConfetti(true);
            setLastMove(null);
            setWinningCells(null);
            boardRef.current = newBoard;
          } else {
            setCountdownText(steps[index]);
          }
        }, 1000);
      }
    });    
    

    socket.on('playerNumber', (num) => {
      console.log("🔢 Received playerNumber:", num);
      setMyPlayerNumber(num);

      if (num === 1) {
        currentPlayerRef.current = 1;
        setCurrentPlayer(1);
      }
    });

    socket.on('playerInfo', ({ host, guest }) => {
      console.log("🎮 Received playerInfo:", { host, guest });

      const isSameName = host.trim().toLowerCase() === guest.trim().toLowerCase();
      const labeledHost = isSameName ? `${host} (Host)` : host;
      const labeledGuest = isSameName ? `${guest} (Joiner)` : guest;

      setPlayerNames({ 1: labeledHost, 2: labeledGuest });
    });

    socket.on('roomClosed', () => {
      const isActiveGame = gameMode === 'ONLINE' || gameMode === 'SPECTATE';
      if (!isActiveGame) return;
    
      console.log("🏚 Room closed — resetting for everyone");
      toast.dismiss(); // Clear any leftover toasts
    
      toast.error("⚠️ Game ended. Returning to menu...");
    
      setTimeout(() => {
        resetGame({
          createBoard,
          setBoard,
          setCurrentPlayer,
          currentPlayerRef,
          setDisplayName,
          setOpponentName,
          setWinner,
          setGameMode,
          setShowConfetti,
          setRecycleConfetti,
          setLastMove,
          setMyPlayerNumber,
          setWinningCells,
          setSpectators,
          hasSetDisplayNameRef,
          setMenuScreen,
        });
      }, 2000);
    });
    

    socket.on('opponentMove', ({ col, player, nextPlayer }) => {
      console.log('📥 Received opponentMove');
      applyMove(col, player, nextPlayer);
    });

    socket.on('rematchRequest', () => {
      if (!isSpectatorRef.current){
        setRematchRequestModal(true);
      }
    });

    socket.on('rematchAccepted', () => {
      toast.success("✅ Opponent accepted the rematch!");
      socket.emit('startRematch', gameCode);
    });

    socket.on('rematchDeclined', () => {
      if (gameMode !== 'ONLINE') return;
        toast.dismiss();
        toast.error("❌ Opponent declined the rematch. Returning to main menu...");
        setTimeout(() => {
          resetGame({
            createBoard,
            setBoard,
            setCurrentPlayer,
            currentPlayerRef,
            setDisplayName,
            setOpponentName,
            setWinner,
            setGameMode,
            setShowConfetti,
            setRecycleConfetti,
            setLastMove,
            setMyPlayerNumber,
            setWinningCells,
            setSpectators,
            hasSetDisplayNameRef,
            setMenuScreen,
          });
        }, 2000);
      });
      

      socket.on('opponentLeft', () => {
        if (gameMode !== 'ONLINE') return;
        console.log("👋 Received 'opponentLeft' — opponent has left.");
        toast.dismiss();
      
        const performReset = () => {
          resetGame({
            createBoard,
            setBoard,
            setCurrentPlayer,
            currentPlayerRef,
            setDisplayName,
            setOpponentName,
            setWinner,
            setGameMode,
            setShowConfetti,
            setRecycleConfetti,
            setLastMove,
            setMyPlayerNumber,
            setWinningCells,
            setSpectators,
            hasSetDisplayNameRef,
          });
        };
      
        if (isSpectatorRef.current) {
          toast.error("⚠️ Game ended. Returning to menu...");
          setTimeout(performReset, 2000);
          return;
        }
      
        if (disconnectRef.current) {
          disconnectRef.current.currentTime = 0;
          disconnectRef.current.play();
        }
      
        toast.error("⚠️ Opponent has left the game. Returning to menu...");
        setTimeout(performReset, 2000);
      });
      

    return () => {
      socket.off('connect');
      socket.off('roomUpdate');
      socket.off('errorMessage');
      socket.off('spectatorUpdate');
      socket.off('currentTurnUpdate');
      socket.off('syncBoard');
      socket.off('startRematch');
      socket.off('playerNumber');
      socket.off('playerInfo');
      socket.off('roomClosed');
      socket.off('opponentMove');
      socket.off('rematchRequest');
      socket.off('rematchAccepted');
      socket.off('rematchDeclined');
      socket.off('opponentLeft');
    };
}, [
    board,
    gameCode,
    gameMode,
    resetGame,
    toast,
    setBoard,
    setWinner,
    setSpectators,
    setCurrentPlayer,
    setPlayerNames,
    setDisplayName,
    setOpponentName,
    setMyPlayerNumber,
    setMenuScreen,
    applyMove,
    currentPlayerRef,
    setCountdownText,
    boardSyncedRef,
    boardRef,
    victoryRef,
    countdownRef,
    defeatRef,
    disconnectRef,
    isSpectatorRef,
    setShowConfetti,
    setRecycleConfetti,
    setLastMove,
    setWinningCells,
    setRematchRequestModal,
    setGameMode,
    createBoard,
    hasSetDisplayNameRef,
    setMySocketId
  ]);  
}
