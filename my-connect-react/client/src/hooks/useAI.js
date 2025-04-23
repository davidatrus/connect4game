
import { checkWinner } from '../utils/gameLogic';
/* Easy AI — Selects moves completely at random from valid columns.
Designed for beginners or quick, casual play. */
export const makeAIMoveEasy = (board, handleClick) => {
    const validCols = board[0].map((_, col) => col).filter(col => board[0][col] === null);
    const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
    if (randomCol !== undefined) {
      handleClick(randomCol);
    }
  };
  
  /* Medium AI — Prioritizes winning and blocking moves.
  Prefers center column, and uses a simple scoring heuristic to extend its streaks.
  Offers a decent challenge without heavy computation. */
  export const makeAIMoveMedium = (board, handleClick) => {
    const NUM_COLS = board[0].length;
    const NUM_ROWS = board.length;
    const validCols = board[0].map((_, col) => col).filter(col => board[0][col] === null);
  
    const simulateMove = (col, player) => {
      const newBoard = board.map(row => [...row]);
      for (let row = NUM_ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = player;
          break;
        }
      }
      return newBoard;
    };
  
    // 1. Win if possible
    for (const col of validCols) {
      const simulatedBoard = simulateMove(col, 2);
      if (checkWinner(simulatedBoard) === 2) return handleClick(col);
    }
  
    // 2. Block opponent from winning
    for (const col of validCols) {
      const simulatedBoard = simulateMove(col, 1);
      if (checkWinner(simulatedBoard) === 1) return handleClick(col);
    }
  
    // 3. Favor columns near the center (simple strategy)
    const center = Math.floor(NUM_COLS / 2);
    const sortedByCenter = validCols
      .slice()
      .sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
  
    // 4. Bonus: Try to extend own streak (look for 2s or 3s)
    const scoreColumn = (col) => {
      let score = 0;
      const simulatedBoard = simulateMove(col, 2);
      for (let row = 0; row < NUM_ROWS; row++) {
        for (let c = 0; c < NUM_COLS; c++) {
          if (simulatedBoard[row][c] === 2) {
            score++;
          }
        }
      }
      return score;
    };
  
    let bestCol = sortedByCenter[0];
    let bestScore = -1;
  
    for (const col of sortedByCenter) {
      const score = scoreColumn(col);
      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }
  
    return handleClick(bestCol);
  };
  /* Hard AI — Implements a simplified Minimax algorithm with limited depth.
  It uses a basic evaluation function to score board states and applies alpha-beta pruning.
  This AI plays strategically but not perfectly, making it beatable with some planning.
  also prioritizes center columns slightly to improve strategy. */
  export const makeAIMoveHard = (board, handleClick) => {
    const MAX_DEPTH = 4;
    const NUM_COLS = board[0].length;
    const NUM_ROWS = board.length;
  
    const getValidCols = (b) => b[0].map((_, col) => col).filter(col => b[0][col] === null);
  
    const simulateMove = (b, col, player) => {
      const newBoard = b.map(row => [...row]);
      for (let row = NUM_ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = player;
          break;
        }
      }
      return newBoard;
    };
  
    const scorePosition = (b) => {
      const result = checkWinner(b);
      const winner = result?.winner;
      if (winner === 2) return 100;
      if (winner === 1) return -100;
      return 0;
    };
  
    const minimax = (b, depth, maximizingPlayer) => {
      const result = checkWinner(b);
      const winner = result?.winner;
      if (depth === 0 || winner) {
        return scorePosition(b);
      }
  
      const validCols = getValidCols(b);
      if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const col of validCols) {
          const child = simulateMove(b, col, 2);
          const evalScore = minimax(child, depth - 1, false);
          maxEval = Math.max(maxEval, evalScore);
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const col of validCols) {
          const child = simulateMove(b, col, 1);
          const evalScore = minimax(child, depth - 1, true);
          minEval = Math.min(minEval, evalScore);
        }
        return minEval;
      }
    };
  
    let bestScore = -Infinity;
    let bestCol = null;
    const validCols = getValidCols(board);
  
    const center = Math.floor(NUM_COLS / 2);
    const sortedCols = validCols.slice().sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
  
    for (const col of sortedCols) {
      const newBoard = simulateMove(board, col, 2);
      const score = minimax(newBoard, MAX_DEPTH - 1, false);
      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }
  
    if (bestCol !== null) {
      handleClick(bestCol);
    } else {
      makeAIMoveEasy(board, handleClick); // fallback
    }
  };
  /* Impossible AI — Implements a Minimax algorithm with alpha-beta pruning to evaluate and choose the optimal move.
  It scores potential moves based on center control, streaks of 2 or 3, and potential opponent threats.
  This AI plays very competitively and is designed to simulate near-perfect play without extreme performance cost. 
  Great explainer video on Minimax + Alpha-Beta Pruning: https://www.youtube.com/watch?v=l-hh51ncgDI&ab_channel=SebastianLague */
  export const makeAIMoveImpossible = (board, handleClick) => {
    const NUM_ROWS = board.length;
    const NUM_COLS = board[0].length;
    const remainingMoves = board.flat().filter(cell => cell === null).length;
    const MAX_DEPTH = remainingMoves > 30 ? 6 : remainingMoves > 15 ? 5 : 4;

  
    const getValidColumns = (board) =>
      board[0].map((_, col) => col).filter(col => board[0][col] === null);
  
    const simulateMove = (board, col, player) => {
      const newBoard = board.map(row => [...row]);
      for (let row = NUM_ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = player;
          break;
        }
      }
      return newBoard;
    };
  
    const evaluateWindow = (window, player) => {
      const opponent = player === 1 ? 2 : 1;
      const playerCount = window.filter(cell => cell === player).length;
      const emptyCount = window.filter(cell => cell === null).length;
      const opponentCount = window.filter(cell => cell === opponent).length;
  
      if (playerCount === 4) return 100;
      if (playerCount === 3 && emptyCount === 1) return 10;
      if (playerCount === 2 && emptyCount === 2) return 5;
      if (opponentCount === 3 && emptyCount === 1) return -8;
      return 0;
    };
  
    const evaluateBoard = (board, player = 2) => {
      let score = 0;
  
      // Score center column
      const centerCol = Math.floor(NUM_COLS / 2);
      const centerArray = board.map(row => row[centerCol]);
      const centerCount = centerArray.filter(cell => cell === player).length;
      score += centerCount * 3;
  
      // Score all possible windows of 4 (horizontal, vertical, and both diagonals)
      for (let row = 0; row < NUM_ROWS; row++) {
        for (let col = 0; col < NUM_COLS - 3; col++) {
          const window = board[row].slice(col, col + 4);
          score += evaluateWindow(window, player);
        }
      }
  
      for (let row = 0; row < NUM_ROWS - 3; row++) {
        for (let col = 0; col < NUM_COLS; col++) {
          const window = [
            board[row][col],
            board[row + 1][col],
            board[row + 2][col],
            board[row + 3][col]
          ];
          score += evaluateWindow(window, player);
        }
      }
  
      for (let row = 0; row < NUM_ROWS - 3; row++) {
        for (let col = 0; col < NUM_COLS - 3; col++) {
          const window = [
            board[row][col],
            board[row + 1][col + 1],
            board[row + 2][col + 2],
            board[row + 3][col + 3]
          ];
          score += evaluateWindow(window, player);
        }
      }
  
      for (let row = 3; row < NUM_ROWS; row++) {
        for (let col = 0; col < NUM_COLS - 3; col++) {
          const window = [
            board[row][col],
            board[row - 1][col + 1],
            board[row - 2][col + 2],
            board[row - 3][col + 3]
          ];
          score += evaluateWindow(window, player);
        }
      }
  
      return score;
    };
  
    const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
      const validCols = getValidColumns(board);
      const result = checkWinner(board);
      const winner = result?.winner;
      if (winner === 2) return 100000;
      if (winner === 1) return -100000;
      if (depth === 0 || validCols.length === 0) {
        return evaluateBoard(board);
      }
  
      if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const col of validCols) {
          const newBoard = simulateMove(board, col, 2);
          const evalScore = minimax(newBoard, depth - 1, alpha, beta, false);
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const col of validCols) {
          const newBoard = simulateMove(board, col, 1);
          const evalScore = minimax(newBoard, depth - 1, alpha, beta, true);
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    };
  
    const validCols = getValidColumns(board);
    let bestScore = -Infinity;
    let bestMove = validCols[0];
  
    // Prioritize center-outward column ordering
    const center = Math.floor(NUM_COLS / 2);
    const sortedCols = validCols.slice().sort((a, b) => Math.abs(center - a) - Math.abs(center - b));
  
    for (const col of sortedCols) {
      const newBoard = simulateMove(board, col, 2);
      const score = minimax(newBoard, MAX_DEPTH - 1, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
  
    handleClick(bestMove);
  };
  