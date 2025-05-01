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
import { useSocketListeners } from './hooks/useSocketListeners';
import { resetGame, resetToMenu } from './utils/gameReset';
import { createBoard, NUM_ROWS, NUM_COLS } from './utils/boardUtils';
import { useAIMove } from './hooks/useAIHelpers';


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
  const [spectators, setSpectators] = useState([]); // List of current spectators
  const [isSpectator, setIsSpectator] = useState(false); // Whether this client is spectating
  const [playerNames, setPlayerNames] = useState({ 1: 'Player 1', 2: 'Player 2' });
  const [rematchRequestModal, setRematchRequestModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isSpectatorRef = useRef(false);
  const hasSetDisplayNameRef = useRef(false);
  const boardSyncedRef = useRef(false);
  const boardRef = useRef(null);
  const [menuScreen, setMenuScreen] = useState(null);
  const [showSpectatorChangeNameModal, setShowSpectatorChangeNameModal] = useState(false);
  const [spectatorNextScreenAfterModal, setSpectatorNextScreenAfterModal] = useState(null);
  const [showPlayerChangeNameModal, setShowPlayerChangeNameModal] = useState(false);
const [playerNextScreenAfterModal, setPlayerNextScreenAfterModal] = useState(null);
const [mySocketId, setMySocketId] = useState(null);





  const handleClick = (col) => {
    console.log("🔥 handleClick ENTRY:", { col, currentPlayer: currentPlayerRef.current });
  
    if (isSpectator) {
      console.log("👁️ Spectator mode — clicks disabled");
      return;
    }
  
    if (winner) {
      console.log('⛔ Game already has a winner');
      return;
    }
  
    if (board[0][col] !== null) {
      console.log('⛔ Column full');
      return;
    }
  
    const row = findAvailableRow(board, col);
    if (row === -1) {
      console.log('⛔ No available row');
      return;
    }
  
    if (gameMode === 'ONLINE') {
      const isMyTurn = currentPlayerRef.current === myPlayerNumber;
      if (!isMyTurn) {
        console.log('⛔ Not your turn');
        return;
      }
  
      socket.emit('makeMove', {
        roomCode: gameCode,
        move: { col, player: currentPlayerRef.current },
      });
    } else {
      applyMove(col, currentPlayer);
    }
  };

  const { makeAIMove } = useAIMove(board, handleClick);

  const applyMove = (col, player, forceNextPlayer = null) => {
    const row = findAvailableRow(board, col);
    if (row === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;
    setBoard(newBoard);

    if ((gameMode === 'ONLINE' || gameMode === 'SPECTATE') && !boardSyncedRef.current) {
      boardSyncedRef.current = true;
      socket.emit('boardReadyForSync', {
        roomCode: gameCode,
        board: newBoard,
        currentPlayer: player === 1 ? 2 : 1
      });
    }

    setLastMove({ row, col });

    if (moveClinkRef.current) {
      moveClinkRef.current.currentTime = 0;
      moveClinkRef.current.play();
    }

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningCells(result.cells);
      setShowConfetti(true);
      setRecycleConfetti(true);

      const isWin = result.winner === myPlayerNumber;
      const winAudio = isWin || gameMode !== 'ONLINE' ? victoryRef : defeatRef;
      if (winAudio.current) {
        winAudio.current.volume = isWin ? 0.1 : 0.3;
        winAudio.current.currentTime = 0;
        winAudio.current.play();
      }
    } else {
      const next = forceNextPlayer ?? (player === 1 ? 2 : 1);
      currentPlayerRef.current = next;
      setCurrentPlayer(next);
    }
  };

  useSocketListeners({
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
  });
  const clearPreRoomState = () => {
    setPlayerNames({ 1: 'Player 1', 2: 'Player 2' });
    setSpectators([]);
    setOpponentName('');
    setMyPlayerNumber(null);
    setGameCode('');
    setWinner(null);
    setBoard(createBoard());
    setLastMove(null);
    setWinningCells([]);
    setShowConfetti(false);
    setRecycleConfetti(true);
    boardSyncedRef.current = false;
    setDisplayName('');
    hasSetDisplayNameRef.current = false;
  };
  const clearRoomButKeepName = () => {
    setGameCode('');
    setMyPlayerNumber(null);
    setOpponentName('');
    setWinner(null);
    setBoard(createBoard());
    setLastMove(null);
    setWinningCells([]);
    setShowConfetti(false);
    setRecycleConfetti(true);
    boardSyncedRef.current = false;
  };
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
       
  useEffect(() => {
    if (gameMode === 'AI' && currentPlayer === 2 && !winner) {
      const aiTimeout = setTimeout(() => {
        makeAIMove(aiDifficulty);
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
    if (gameMode === 'SPECTATE') {
      setIsSpectator(true);
      isSpectatorRef.current = true;
    } else {
      setIsSpectator(false);
      isSpectatorRef.current = false;
    }
  }, [gameMode]);
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

    
  const handleResetGame = () => {
    resetGame({
      createBoard,
      setBoard,
      setCurrentPlayer,
      currentPlayerRef,
      setDisplayName,
      setOpponentName,
      setMenuScreen,
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
  
  const handleResetToMenu = () => {
    resetToMenu({
      gameMode,
      isSpectator,
      gameCode,
      resetGameFn: handleResetGame,
      setMenuScreen,
    });
  };
  
  if (!gameMode) {
    return <GameMenu setGameMode={setGameMode} 
    setAIDifficulty={setAIDifficulty} 
    setDisplayName={setDisplayName} 
    displayName={displayName}
    setGameCode={setGameCode}
    setIsHost={setIsHost} 
    menuScreen={menuScreen}
    setMenuScreen={setMenuScreen}
    hasSetDisplayNameRef={hasSetDisplayNameRef}
    clearPreRoomState={clearPreRoomState}
    />;
  }
  console.log('Current displayName:', displayName);
  console.log('Spectators list:', spectators);

  const sortedSpectators = isSpectator
  ? [
      ...spectators.filter(s => s.id === mySocketId),
      ...spectators.filter(s => s.id !== mySocketId)
    ]
  : spectators;

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
   gameMode === 'ONLINE' || gameMode === 'SPECTATE'
        ? playerNames[winner] || `Player ${winner}`
        : gameMode === 'AI'
          ? winner === 1
            ? 'You'
            : `${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} AI`
          : `Player ${winner}`
    }
  />
        ) : (
          <p className="turn-indicator">
  {gameMode === 'ONLINE' || gameMode === 'SPECTATE'
     ? `Current Turn: ${playerNames[currentPlayer] || ''}`
    : `Current Turn: ${
        currentPlayer === 1
          ? 'Player 1'
          : (gameMode === 'AI'
              ? `${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} AI`
              : 'Player 2')}`}
</p>
        )}
    {(gameMode === 'ONLINE' || gameMode === 'SPECTATE') && playerNames[1] && playerNames[2] && (
  <div className="player-container">
    <div className="player-title">
      <span className="gamepad-icon">🎮</span>Players:</div>
    <div className="player-pill-container">
      <div className="player-pill red-pill">
        {playerNames[1]} (Host)
      </div>
      <div className="player-pill yellow-pill">
        {playerNames[2]} (Joiner)
      </div>
    </div>
  </div>
)}

{(gameMode === 'ONLINE' || gameMode === 'SPECTATE') && spectators.length > 0 && (
  <div className="spectator-container">
    <div className="spectator-title">
      <span className="eye-icon">👁</span> 
      Spectators ({spectators.length})
      <span className="pulse-dot" />
    </div>
    <div className="spectator-pill-container">
    {sortedSpectators.map((s, idx) => (
  <div className="spectator-pill" key={s.id}>
    {isSpectator && s.id === mySocketId ? `${s.name} (You)` : s.name}
  </div>
))}
    </div>
  </div>
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
       {isSpectator ? (
  <>
    <button
      className="reset-button"
      onClick={() => {
        socket.emit('leaveRoom', gameCode); // 🧼 Leave previous room
        setSpectatorNextScreenAfterModal('spectateList');
        setShowSpectatorChangeNameModal(true);
        // setMenuScreen('spectateList')               // Clear local list
        // setGameMode(null);            // Go back to Spectate Game list
      }}
    >
      Spectate Another Game
    </button>

    <button
      className="reset-button"
      onClick={() => {
        socket.emit('leaveRoom', gameCode);
        setPlayerNextScreenAfterModal('hostjoin');
        setShowPlayerChangeNameModal(true);
        //setMenuScreen('hostjoin');           
        //setGameMode(null);                
        //setIsSpectator(false);  
      }}
    >
      Play Your Own Game
    </button>

    <button className="reset-button" onClick={handleResetToMenu}>
  Return to Menu
</button>

  </>
) : (
    <>
      <button
        className="reset-button"
        onClick={handleRematch}
        disabled={!winner}
        title={!winner ? "Can only rematch once there's a winner!" : ""}
      >
        Rematch
      </button>
      <button className="reset-button" onClick={handleResetToMenu}>
  Back to Menu
</button>
    </>
  )}
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
{rematchRequestModal && !isSpectator && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Your opponent has requested a rematch.</h3>
      <div className="modal-buttons">
        <button
          onClick={() => {
            socket.emit('rematchAccepted', gameCode);
            setRematchRequestModal(false);
          }}
        >
          Accept
        </button>
        <button
          onClick={() => {
            socket.emit('rematchDeclined', gameCode);
            setRematchRequestModal(false);
          }}
        >
          Decline
        </button>
      </div>
    </div>
  </div>
)}
{showSpectatorChangeNameModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Would you like to change your display name before continuing?</h3>
      <div className="modal-buttons">
        <button
          onClick={() => {
            setMenuScreen('resetName');
            setGameMode(null);
            setShowSpectatorChangeNameModal(false);
          }}
        >
          Yes, Change My Name
        </button>
        <button
          onClick={() => {
            clearRoomButKeepName();
            setMenuScreen(spectatorNextScreenAfterModal);
            setGameMode(null);
            setShowSpectatorChangeNameModal(false);
          }}
        >
          No, Keep Current Name
        </button>
      </div>
    </div>
  </div>
)}
{showPlayerChangeNameModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Would you like to update your display name before playing?</h3>
      <div className="modal-buttons">
        <button
          onClick={() => {
            setMenuScreen('resetName');
            setGameMode(null);
            setShowPlayerChangeNameModal(false);
          }}
        >
          Yes, Change Name
        </button>
        <button
          onClick={() => {
            clearRoomButKeepName(); 
            setMenuScreen(playerNextScreenAfterModal);
            setGameMode(null);
            setShowPlayerChangeNameModal(false);
          }}
        >
          No, Keep Current Name
        </button>
      </div>
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
