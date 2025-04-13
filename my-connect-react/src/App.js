// Updated App.js with game mode selection and AI difficulty
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import GameMenu from './components/GameMenu';
import WinnerBanner from './components/WinnerBanner';
import Board from './components/Board';
import { checkWinner, findAvailableRow } from './utils/gameLogic';
import { makeAIMoveEasy, makeAIMoveMedium, makeAIMoveHard, makeAIMoveImpossible} from './hooks/useAI';
import { socket } from './socket';
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
  const [width, height] = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [lastAIMove, setLastAIMove] = useState(null); // { row, col }
  //const [isOnline, setIsOnline] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [opponentName, setOpponentName] = useState('');
  const [myPlayerNumber, setMyPlayerNumber] = useState(null);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [showRematchPrompt, setShowRematchPrompt] = useState(false);
  const [countdown, setCountdown] = useState(null);




  function createBoard() {
    return Array(NUM_ROWS).fill(null).map(() => Array(NUM_COLS).fill(null));
  }
  // --- Above handleClick ---
  const applyMove = (col, player, forceNextPlayer = null) => {
    console.log('⚙️ applyMove called with:', { col, player, forceNextPlayer });
    const row = findAvailableRow(board, col);
    if (row === -1) return;
  
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;
    setBoard(newBoard);
    console.log(`Applied move: Player ${player} → Column ${col}`);
  
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      console.log('🏆 Winner found:', newWinner);
      setWinner(newWinner);
      setShowConfetti(true);
      setRecycleConfetti(true);
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
  
    if (gameMode === 'AI' && player === 1) {
      setLastAIMove(null);
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

      console.log('📤 Emitting makeMove with:', {
      roomCode: gameCode,
      move: { col, player: current },
      nextPlayer
      });
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

  const makeAIMove = () => {
    if (aiDifficulty === 'impossible') {
        makeAIMoveImpossible(board, (col) => {
            const row = findAvailableRow(board, col);
            setLastAIMove({ row, col });
            handleClick(col);
              });
    } else if (aiDifficulty === 'hard') {
        makeAIMoveHard(board, (col) => {
        const row = findAvailableRow(board, col);
        setLastAIMove({ row, col });
        handleClick(col);
    });
    } else if (aiDifficulty === 'medium') {
        makeAIMoveMedium(board, (col) => {
        const row = findAvailableRow(board, col);
        setLastAIMove({ row, col });
        handleClick(col);
    });
    } else {
        makeAIMoveEasy(board, (col) => {
        const row = findAvailableRow(board, col);
        setLastAIMove({ row, col });
        handleClick(col);
    });
    }
  };

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
  useEffect(() => {
    socket.on('playerInfo', ({ myName, opponentName, playerNumber }) => {
      console.log("🎮 Received playerInfo:", { myName, opponentName, playerNumber });
      setDisplayName(myName);
      setOpponentName(opponentName);
      setMyPlayerNumber(playerNumber); // use the number sent from the server directly

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
    console.log('🔄 Received rematch request from opponent');
    setBoard(createBoard());
    setCurrentPlayer(1);
    currentPlayerRef.current = 1;
    setWinner(null);
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastAIMove(null);

    toast.info('🔁 Opponent started a rematch!');
  });

  return () => {
    socket.off('opponentMove');
    socket.off('rematchRequest')
  };
}, [gameMode, board]);


  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    currentPlayerRef.current = 1;
    setWinner(null);
    setGameMode(null); // This kicks back to the menu
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastAIMove(null);
    setMyPlayerNumber(null);

  };
  const handleRematch = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    currentPlayerRef.current = 1;
    setWinner(null);
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastAIMove(null);
    toast.success('🎮 New rematch started!');
    
    if (gameMode === 'ONLINE') {
      socket.emit('rematchRequest', gameCode);
    }

  };
  const resetToMenu = () => {
    resetGame(); // reuse the existing one
  };

  if (!gameMode) {
    return <GameMenu setGameMode={setGameMode} setAIDifficulty={setAIDifficulty} setDisplayName={setDisplayName}
    setGameCode={setGameCode}
    setIsHost={setIsHost} />;
  }

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} recycle={recycleConfetti} />
      )}
      <div className="App">
        <h1>Connect 4</h1>
        {winner ? (
          <WinnerBanner
  winnerName={
    gameMode === 'ONLINE'
      ? winner === myPlayerNumber
        ? displayName
        : opponentName
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
          lastAIMove={lastAIMove}
        />
        <div className="button-group">
        <button className="reset-button" onClick={handleRematch}>Rematch</button>
        <button className="reset-button" onClick={resetToMenu}>Back to Menu</button>
        </div>
      </div>
    
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={true}
      closeOnClick
      pauseOnHover={false}
      draggable={false}
    />
    </>
  );
}

export default App;
