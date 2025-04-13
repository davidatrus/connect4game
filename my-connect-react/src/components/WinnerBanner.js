import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const WinnerBanner = ({ winnerName, showConfetti, recycleConfetti }) => {
  const [width, height] = useWindowSize();

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} recycle={recycleConfetti} />
      )}
      <div className="winner-banner">
       <h2> 🎉 {winnerName} Wins! 🎉 </h2>
      </div>
    </>
  );
};

export default WinnerBanner;
