// Updated App.js with game mode selection and AI difficulty
import React, { useState, useEffect } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import GameMenu from './components/GameMenu';
import WinnerBanner from './components/WinnerBanner';
import Board from './components/Board';
import { checkWinner, findAvailableRow } from './utils/gameLogic';
import { makeAIMoveEasy, makeAIMoveMedium, makeAIMoveHard, makeAIMoveImpossible} from './hooks/useAI';


const NUM_ROWS = 6;
const NUM_COLS = 7;

function App() {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null); // 'HUMAN' or 'AI'
  const [aiDifficulty, setAIDifficulty] = useState('easy');
  const [width, height] = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [lastAIMove, setLastAIMove] = useState(null); // { row, col }


  function createBoard() {
    return Array(NUM_ROWS).fill(null).map(() => Array(NUM_COLS).fill(null));
  }

  const handleClick = (col) => {
    if (winner || board[0][col] !== null) return;

    const row = findAvailableRow(board, col);
    if (row === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      setShowConfetti(true);
      setRecycleConfetti(true);
    } else {
      setCurrentPlayer(prev => prev === 1 ? 2 : 1);
    }
    if (gameMode === 'AI' && currentPlayer === 1) {
        setLastAIMove(null); // remove AI highlight once player moves
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

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setGameMode(null);
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastAIMove(false);
  };

  if (!gameMode) {
    return <GameMenu setGameMode={setGameMode} setAIDifficulty={setAIDifficulty} />;
  }

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} recycle={recycleConfetti} />
      )}
      <div className="App">
        <h1>Connect 4</h1>
        {winner ? (
          <WinnerBanner winner={winner} />
        ) : (
          <p className="turn-indicator">Current Turn: {currentPlayer === 1 ? 'Player 1' : (gameMode === 'AI' ? `${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} AI` : 'Player 2')}</p>
        )}
        <Board
          board={board}
          handleClick={handleClick}
          gameMode={gameMode}
          currentPlayer={currentPlayer}
          lastAIMove={lastAIMove}
        />
        <button className="reset-button" onClick={resetGame}>Restart</button>
      </div>
    </>
  );
}

export default App;
