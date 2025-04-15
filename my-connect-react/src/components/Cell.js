import React from 'react';

const Cell = ({ value, onClick, isLastMove }) => (
  <div
    className={`cell player${value} ${isLastMove ? 'last-move' : ''}`}
    onClick={onClick}
  />
);

export default Cell;
