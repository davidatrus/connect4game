export const createBoard = (rows = 6, cols = 7) =>
    Array(rows).fill(null).map(() => Array(cols).fill(null));
  
  export const findAvailableRow = (board, col) => {
    for (let row = board.length - 1; row >= 0; row--) {
      if (board[row][col] === null) return row;
    }
    return -1;
  };
  
  export const checkWinner = (board) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    const rows = board.length;
    const cols = board[0].length;
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const player = board[row][col];
        if (!player) continue;
  
        for (let [dx, dy] of directions) {
          let count = 1;
          let r = row + dx, c = col + dy;
          while (
            r >= 0 && r < rows &&
            c >= 0 && c < cols &&
            board[r][c] === player
          ) {
            count++;
            if (count === 4) return player;
            r += dx;
            c += dy;
          }
        }
      }
    }
    return null;
  };
  