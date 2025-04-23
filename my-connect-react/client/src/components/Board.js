import React from 'react';
import Cell from './Cell';

const Board = ({ board, handleClick, currentPlayer, gameMode, winner ,lastMove, winningCells }) => (
    <div className="board">
        {board.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
                {row.map((cell, colIndex) => (
                    <Cell
                        key={colIndex}
                        value={cell}
                        isLastMove={!winner && (lastMove?.row === rowIndex && lastMove?.col === colIndex)}
                        isWinningCell={winningCells?.some(([r, c]) => r === rowIndex && c === colIndex)}
                        onClick={() => {
                            console.log("✅ Cell clicked at column:", colIndex);
                            handleClick(colIndex)
                        }}
                    />
                ))}
            </div>
        ))}
    </div>
);

export default Board;
