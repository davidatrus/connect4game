// Updated App.js with game mode selection and AI difficulty
import React, { useState, useEffect, useRef } from 'react';
import { useCallback } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import GameMenu from './components/GameMenu';
import WinnerBanner from './components/WinnerBanner';
import Board from './components/Board';
import { checkWinner, findAvailableRow } from './utils/gameLogic';
import { makeAIMoveEasy, makeAIMoveMedium, makeAIMoveHard, makeAIMoveImpossible} from './hooks/useAI';
import socket  from './socket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NUM_ROWS = 6;
const NUM_COLS = 7;

function App() {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const currentPlayerRef = useRef(1);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null); // 'HUMAN' or 'AI'
  const [aiDifficulty, setAIDifficulty] = useState('easy');
  const [showAIDifficultyPrompt, setShowAIDifficultyPrompt] = useState(false);
  const [aiRematchOptionsVisible, setAIRematchOptionsVisible] = useState(false);
  const [width, height] = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [lastMove, setLastMove] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [opponentName, setOpponentName] = useState('');
  const [myPlayerNumber, setMyPlayerNumber] = useState(null);
  const [countdownText, setCountdownText] = useState(null);
  const countdownRef = useRef(null);
  const victoryRef = useRef(null);
  const defeatRef = useRef(null);
  const disconnectRef = useRef(null);
  const moveClinkRef = useRef(null);

  function createBoard() {
    return Array(NUM_ROWS).fill(null).map(() => Array(NUM_COLS).fill(null));
  }
  const startNewGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    currentPlayerRef.current = 1;
    setWinner(null);
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastMove(null);
    setWinningCells(null);
  };
  const handleRematch = () => {
    if (gameMode === 'ONLINE') {
      socket.emit('rematchRequest', gameCode);
      toast.info('⌛ Rematch request sent. Waiting for opponent...');
    } else if (gameMode === 'AI') {
        setShowAIDifficultyPrompt(true);
    } else {
      toast.success('🔄 New game started!');
      startNewGame();
    }
  };

  const handleClick = (col) => {
    console.log("🔥 handleClick ENTRY for col:", col);
    console.log('🟡 handleClick fired');
    console.log('💡 currentPlayerRef:', currentPlayerRef.current, 'vs currentPlayer:', currentPlayer);
    console.log('Clicked column:', col);
    console.log('Current player:', currentPlayer);
    console.log('My player number:', myPlayerNumber);
    console.log('Display name:', displayName);
    console.log('Is host?', isHost);
    console.log('Game mode:', gameMode);

    if (winner) {
      console.log('⛔ Game has a winner — move blocked');
      return;
    }
    if (board[0][col] !== null) {
      console.log('⛔ Column is full — move blocked');
      return;
    }

    const row = findAvailableRow(board, col);
    if (row === -1) return;

    if (gameMode === 'ONLINE') {
      // Only emit if it's your turn
      const isMyTurn = currentPlayerRef.current === myPlayerNumber;
      console.log('🧠 Turn Check → My Player:', myPlayerNumber, 'Current Turn:', currentPlayerRef.current);
      console.log('🧠 Is it my turn?', isMyTurn);
      if (!isMyTurn) return;
      
      const current = currentPlayerRef.current;
      const nextPlayer = current === 1 ? 2 : 1;

     /* console.log('📤 Emitting makeMove with:', {
      roomCode: gameCode,
      move: { col, player: current },
      nextPlayer
      }); */
      socket.emit('makeMove', {
        roomCode: gameCode,
        move: { col, player: current },
        nextPlayer
      });
      applyMove(col, current, nextPlayer);
    } else {
      applyMove(col, currentPlayer)
    }
  };
  const applyMove = (col, player, forceNextPlayer = null) => {
    console.log('⚙️ applyMove called with:', { col, player, forceNextPlayer });
    const row = findAvailableRow(board, col);
    if (row === -1) return;
  
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;
    setBoard(newBoard);
    setLastMove({ row, col });

    if (moveClinkRef.current) {
      moveClinkRef.current.currentTime = 0; // rewind if needed
      moveClinkRef.current.play();
    }

    console.log(`Applied move: Player ${player} → Column ${col}`);

    const result = checkWinner(newBoard);
    if (result) {
      console.log('🏆 Winner found:', result);
      setWinner(result.winner);
      setWinningCells(result.cells);
      setShowConfetti(true);
      setRecycleConfetti(true);
      if (gameMode === 'AI') {
        // User is always player 1 in AI mode
        if (result.winner === 1 && victoryRef.current) {
          victoryRef.current.volume = 0.1;
          victoryRef.current.currentTime = 0;
          victoryRef.current.play();
        } else if (result.winner === 2 && defeatRef.current) {
          defeatRef.current.volume= 0.3;
          defeatRef.current.currentTime = 0;
          defeatRef.current.play();
        }
      } else if (gameMode === 'ONLINE') {
        // result.winner === myPlayerNumber means I won
        if (result.winner === myPlayerNumber && victoryRef.current) {
          victoryRef.current.volume = 0.1;
          victoryRef.current.currentTime = 0;
          victoryRef.current.play();
        } else if (result.winner !== myPlayerNumber && defeatRef.current) {
          defeatRef.current.volume= 0.3;
          defeatRef.current.currentTime = 0;
          defeatRef.current.play();
        }
      } else {
        // LOCAL play (Human vs Human on same device)
        if (victoryRef.current) {
          victoryRef.current.volume = 0.1;
          victoryRef.current.currentTime = 0;
          victoryRef.current.play();
        }
      }    
    } else {
      console.log('🔄 Setting currentPlayer to:', forceNextPlayer !== null ? forceNextPlayer : 'other player');
      if (forceNextPlayer !== null) {
        currentPlayerRef.current = forceNextPlayer;
        setCurrentPlayer(forceNextPlayer);
      } else {
        const next = player === 1 ? 2 : 1;
        currentPlayerRef.current = next;
        setCurrentPlayer(next);
      }
    }
  };  

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeAIMove = useCallback(() => {
    const AI = {
      easy: makeAIMoveEasy,
      medium: makeAIMoveMedium,
      hard: makeAIMoveHard,
      impossible: makeAIMoveImpossible
    };
  
    AI[aiDifficulty](board, (col) => {
      //const row = findAvailableRow(board, col);
      handleClick(col);
    });
  }, [aiDifficulty, board]);
     
  useEffect(() => {
    if (gameMode === 'AI' && currentPlayer === 2 && !winner) {
      const aiTimeout = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(aiTimeout);
    }
  }, [board, currentPlayer, winner, gameMode, aiDifficulty, makeAIMove]);

  useEffect(() => {
    if (showConfetti) {
      const stopRecycling = setTimeout(() => {
        setRecycleConfetti(false);
      }, 5000);
      return () => clearTimeout(stopRecycling);
    }
  }, [showConfetti]);
  //handling in event of unexpected disconnections
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameMode === 'ONLINE') {
        socket.emit('leaveRoom', gameCode);
      }
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameMode, gameCode]);
  useEffect(() => {
  socket.on('startRematch', () => {
    console.log("🎬 Received 'startRematch' from server!");
    setWinner(null);
    if (countdownRef.current) {
      countdownRef.current.currentTime = 0;
      countdownRef.current.play();
    }
  
    let steps = ['GAME STARTS IN: 3...', '2...', '1...', 'Start!!!'];
    let index = 0;
    setCountdownText(steps[index]);
    const interval = setInterval(() => {
      index++;
      if (index === steps.length) {
        clearInterval(interval);
        setCountdownText(null);
        startNewGame();
      } else {
        setCountdownText(steps[index]);
      }
    }, 1000);
  });  return () => socket.off('startRematch');
}, []);

useEffect(() => {
  socket.on('playerInfo', ({ myName, opponentName, playerNumber }) => {
    console.log("🎮 Received playerInfo:", { myName, opponentName, playerNumber });

    const isSameName = myName.trim().toLowerCase() === opponentName.trim().toLowerCase();

    const resolvedMyName = isSameName
      ? playerNumber === 1
        ? `${myName} (Host)`
        : `${myName} (Joiner)`
      : myName;

    const resolvedOpponentName = isSameName
      ? playerNumber === 1
        ? `${opponentName} (Joiner)`
        : `${opponentName} (Host)`
      : opponentName;

    setDisplayName(resolvedMyName);
    setOpponentName(resolvedOpponentName);
    setMyPlayerNumber(playerNumber);

    if (playerNumber === 1) {
      currentPlayerRef.current = 1;
      setCurrentPlayer(1);
    }
  });

  return () => {
    socket.off('playerInfo');
  };
}, []);
  
  
  // Socket listener setup
useEffect(() => {
  socket.on('roomUpdate', (data) => {
    console.log('🟢 Room update:', data.message);
    if (data.opponentName) {
      setOpponentName(data.opponentName);
    }
  });

  socket.on('errorMessage', (msg) => {
    alert(`⚠️ ${msg}`);
  });

  return () => {
    socket.off('roomUpdate');
    socket.off('errorMessage');
  };
}, []);
useEffect(() => {
  if (gameMode !== 'ONLINE') return;

  socket.on('opponentMove', ({ col, player, nextPlayer }) => {
    console.log('📥 Received opponentMove');
    //console.log('Column:', col, 'Player:', player, 'Next:', nextPlayer);
    //console.log(`🟡 Opponent moved in column ${col}`);
    //console.log('✅ Calling applyMove from opponentMove...');
    applyMove(col, player, nextPlayer);
  });
  socket.on('rematchRequest', () => {
    const confirmed = window.confirm("Your opponent wants a rematch. Accept?");
    if (confirmed) {
      socket.emit('rematchAccepted', gameCode);
    } else {
      socket.emit('rematchDeclined', gameCode);
      resetGame();
    }
  });
  socket.on('rematchAccepted', () => {
    toast.success("✅ Opponent accepted the rematch!");
    socket.emit('startRematch', gameCode); // Trigger rematch for both players
  });
  socket.on('rematchDeclined', () => {
    toast.error("❌ Opponent declined the rematch. Returning to main menu...");
    setTimeout(() => resetGame(), 2000);
  });
  socket.on('opponentLeft', () => {
    console.log("👋 Received 'opponentLeft' — opponent has left.");
    if (disconnectRef.current) {
      disconnectRef.current.currentTime = 0;
      disconnectRef.current.play();
    }
    toast.error("⚠️ Opponent has left the game. Returning to menu...");
     // Give toast time to show
  setTimeout(() => {
    resetGame();
  }, 2000);
  });
  
  

  return () => {
    socket.off('opponentMove');
    socket.off('rematchRequest')
    socket.off('rematchAccepted');
    socket.off('rematchDeclined');
    socket.off('opponentLeft')
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [gameMode, board, gameCode]);


  const resetGame = () => {
    console.log('🔁 Resetting game to menu...');
    setBoard(createBoard());
    setCurrentPlayer(1);
    currentPlayerRef.current = 1;
    setDisplayName('');
    setOpponentName('');
    setWinner(null);
    setGameMode(null); // This kicks back to the menu
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastMove(null);
    setMyPlayerNumber(null);
    setWinningCells(null);
  };
  const resetToMenu = () => { 
    if (gameMode === 'ONLINE') {
      const confirmLeave = window.confirm("Are you sure you want to return to the menu? This will end your current game.");
      if (!confirmLeave) return;
  
      // Let the opponent know someone is leaving
      socket.emit('leaveRoom', gameCode);
    }
    resetGame();
  };
  if (!gameMode) {
    return <GameMenu setGameMode={setGameMode} setAIDifficulty={setAIDifficulty} setDisplayName={setDisplayName}
    setGameCode={setGameCode}
    setIsHost={setIsHost} />;
  }

  return (
    <>
      {showConfetti && (<Confetti width={width} height={height} recycle={recycleConfetti} />)}
      <div className="App">
        {/* ⏳ COUNTDOWN OVERLAY */}
      {countdownText && (
        <div className="countdown-overlay fade-text">
          <h2 style={{ color: 'black' }} >{countdownText}</h2>
        </div>
      )}
        <h1>Connect 4</h1>
        {winner ? (
          <WinnerBanner
  winnerName={
   gameMode === 'ONLINE'
        ? winner === myPlayerNumber
          ? displayName
          : opponentName
        : gameMode === 'AI'
          ? winner === 1
            ? 'You'
            : `${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} AI`
          : `Player ${winner}`
    }
  />
        ) : (
          <p className="turn-indicator">
          {gameMode === 'ONLINE'
  ? `Current Turn: ${currentPlayer === myPlayerNumber ? displayName : opponentName}`
    : `Current Turn: ${
        currentPlayer === 1
          ? 'Player 1'
          : (gameMode === 'AI'
              ? `${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} AI`
              : 'Player 2')}`}
</p>
        )}
        <Board
          board={board}
          handleClick={handleClick}
          gameMode={gameMode}
          currentPlayer={currentPlayer}
          lastMove={lastMove}
          winningCells={winningCells}
          winner={winner} 
        />
        <div className="button-group">
        <button className="reset-button" onClick={handleRematch} disabled={!winner} title={!winner ? "Can only rematch once there's a winner!" : ""}>Rematch</button>
        <button className="reset-button" onClick={resetToMenu}>Back to Menu</button>
        </div>
         {/* Adding the AI Rematch Modal  */}
         {showAIDifficultyPrompt && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Change AI difficulty?</h3>
      <div className="modal-buttons">
        <button onClick={() => setAIRematchOptionsVisible(true)}>Yes</button>
        <button
          onClick={() => {
            setShowAIDifficultyPrompt(false);
            startNewGame();
          }}
        >
          No
        </button>
      </div>

      {aiRematchOptionsVisible && (
        <select
          onChange={(e) => {
            setAIDifficulty(e.target.value);
            setShowAIDifficultyPrompt(false);
            setAIRematchOptionsVisible(false);
            startNewGame();
          }}
          defaultValue=""
        >
          <option value="" disabled>Select difficulty</option>
          {['easy', 'medium', 'hard', 'impossible']
            .filter(diff => diff !== aiDifficulty)
            .map(diff => (
              <option key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
          ))}
        </select>
      )}
    </div>
  </div>
)}

      </div>
    
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={true}
      closeOnClick
      pauseOnHover={false}
      draggable={false}/>
      {/*rendering auido tags  */}
      <audio ref={victoryRef} src="/sounds/victory.mp3" />
      <audio ref={defeatRef} src="/sounds/defeat.mp3" />
      <audio ref={disconnectRef} src="/sounds/disconnect.mp3" />
      <audio ref={countdownRef} src="/sounds/countdown.wav" />
      <audio ref={moveClinkRef} src="/sounds/move-clink.mp3" />


    </>
  );
}

export default App;
