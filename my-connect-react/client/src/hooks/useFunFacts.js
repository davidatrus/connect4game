import { useState, useEffect } from 'react';
export function useFunFacts() {
    const facts = [
      "Connect 4 is a solved game — the first player can always win with perfect play.",
      "The game was first solved by James Dow Allen on October 1, 1988.",
      "There are over 4 trillion possible game board combinations.",
      "Try to control the center column — it gives you the most winning paths.",
      "This app includes 4 AI levels, including a Minimax-based 'Impossible' mode.",
      "Always look for diagonal threats — many players miss them until it's too late!",
      "The longest possible game (without a win) has 42 moves — the board completely full.",
      "The 'Impossible' AI uses alpha-beta pruning to reduce search time while still playing optimally.",
      "Adding difficulty-based AI was a great way to learn the Minimax algorithm!",
      "Behind every AI move, there's a for-loop silently judging you.",
      "If this app breaks, just pretend it's a feature."
    ];
  
    const [factIndex, setFactIndex] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setFactIndex((prev) => (prev + 1) % facts.length);
      }, 4000);
  
      return () => clearInterval(interval);
    }, [facts.length]);
  
    return facts[factIndex];
  }