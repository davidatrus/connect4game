    export const findAvailableRow = (board, col) => {
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col] === null) return row;
    }
    return -1;
  };
  
  export const checkWinner = (board) => {
    const directions = [
      [0, 1],   // horizontal →
      [1, 0],   // vertical ↓
      [1, 1],   // diagonal ↘
      [1, -1]   // diagonal ↙
    ];
    const rows = board.length;
    const cols = board[0].length;
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const player = board[row][col];
        if (!player) continue;
  
        for (let [dx, dy] of directions) {
          const cells = [[row, col]];
  
          for (let i = 1; i < 4; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
  
            if (
              r < 0 || r >= rows ||
              c < 0 || c >= cols ||
              board[r][c] !== player
            ) {
              break;
            }
  
            cells.push([r, c]);
          }
  
          if (cells.length === 4) {
            return { winner: player, cells };
          }
        }
      }
    }
  
    return null;
  };
  