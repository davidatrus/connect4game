import React from 'react';
import Cell from './Cell';

const Board = ({ board, handleClick, currentPlayer, gameMode, lastAIMove }) => (
    <div className="board">
        {board.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
                {row.map((cell, colIndex) => (
                    <Cell
                        key={colIndex}
                        value={cell}
                        isLastMove={lastAIMove?.row === rowIndex && lastAIMove?.col === colIndex}
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
