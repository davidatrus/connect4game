import { useCallback } from 'react';
import { makeAIMoveEasy, makeAIMoveMedium, makeAIMoveHard, makeAIMoveImpossible } from './useAI';

export function useAIMove(board, handleClick) {
  const makeAIMove = useCallback((aiDifficulty) => {
    const AI = {
      easy: makeAIMoveEasy,
      medium: makeAIMoveMedium,
      hard: makeAIMoveHard,
      impossible: makeAIMoveImpossible,
    };

    if (AI[aiDifficulty]) {
      AI[aiDifficulty](board, (col) => {
        handleClick(col);
      });
    }
  }, [board, handleClick]);

  return { makeAIMove };
}
