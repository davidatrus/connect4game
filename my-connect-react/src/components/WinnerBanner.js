import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const WinnerBanner = ({ winner, showConfetti, recycleConfetti }) => {
  const [width, height] = useWindowSize();

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} recycle={recycleConfetti} />
      )}
      <div className="winner-banner">
        🎉 Player {winner} Wins! 🎉
      </div>
    </>
  );
};

export default WinnerBanner;
