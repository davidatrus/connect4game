import React from 'react';

const Cell = ({ value, onClick, isLastMove, isWinningCell }) => {
  return (
    <div
      className={`cell player${value || ''} ${isWinningCell ? 'winning-cell' : ''} ${isLastMove ? 'last-move' : ''}`}
      onClick={onClick}
    />
  );
};

export default Cell;
