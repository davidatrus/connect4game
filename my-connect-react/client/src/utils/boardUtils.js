export const NUM_ROWS = 6;
export const NUM_COLS = 7;

export function createBoard() {
  return Array(NUM_ROWS).fill(null).map(() => Array(NUM_COLS).fill(null));
}
