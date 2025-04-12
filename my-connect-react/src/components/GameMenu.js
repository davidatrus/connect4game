// GameMenu.js — fixed to wait for difficulty before starting
import React, { useState, useEffect} from 'react';

const GameMenu = ({ setGameMode, setAIDifficulty }) => {
  const [isAISelected, setIsAISelected] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [factIndex, setFactIndex] = useState(0);
  const facts = [
    "Connect 4 is a solved game — the first player can always win with perfect play.",
    "The game was first solved by James Dow Allen on October 1, 1988",
    "There are over 4 trillion possible game board combinations.",
    "Try to control the center column — it gives you the most winning paths.",
    "This app includes 4 AI levels, including a Minimax-based 'Impossible' mode.",
    "Always look for diagonal threats — many players miss them until it's too late!",
    "The longest possible game (without a win) has 42 moves — the board completely full.",
    "The 'Impossible' AI uses alpha-beta pruning to reduce search time while still playing optimally.",
    "The Hard AI uses a simplified version of Minimax — tough, but beatable!",
    "The Easy AI is great for beginners — it plays random valid moves.",
    "Originally this was my first project using react, a very basic project, now it's a full-featured game I’m proud of!",
    "All AI logic is written from scratch — no libraries used for decision-making.",
    "The confetti effect was added using the 'react-confetti' package — just for the win!",
    "Each game mode (Human vs. Human, vs. AI) is dynamically loaded and animated.",
    "Adding difficulty-based AI was a great way to learn the Minimax algorithm!",
    "A key development challenge was optimizing AI speed without sacrificing intelligence.",
    "The board highlights the last AI move — a small UX detail that improves playability.",
    "Connect 4 is a great intro to game theory, algorithms, and front-end design.",
    "Poppins font and animated tokens were added to give this project a polished, fun feel!",
    "Yes, I lost to my own AI. Yes, I’m okay with it. (No, I’m not).",
    "Pro tip: Rage-clicking the board won't help. I tried.",
    "Behind every AI move, there's a for-loop silently judging you.",
    "If this app breaks, just pretend it's a feature"
  ];
  const funFact = facts[factIndex];
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDifficultyChange = (e) => {
    const difficulty = e.target.value;
    setSelectedDifficulty(difficulty);
    setAIDifficulty(difficulty);
  };

  const handleStartAIGame = () => {
    setAIDifficulty(selectedDifficulty);
    setGameMode('AI');
  };

  return (
    <div className="menu-container">
  <div className="menu-card">
  <div className="icon-row">
  <span role="img" aria-label="Red" className="token">🔴</span>
  <span role="img" aria-label="Yellow" className="token">🟡</span>
</div>
    <h2 className="slide-title">Connect 4</h2>
    <p className="tagline"><em>Challenge a friend or face the smartest AI</em></p>
    <p className="tagline">Select a mode to start playing</p>
    <button onClick={() => setGameMode('HUMAN')}>Play vs Human</button>
    <button onClick={() => setIsAISelected(true)}>Play vs Computer</button>
    {isAISelected && (
      <div className="difficulty-select">
        <label htmlFor="difficulty">AI Difficulty:</label>
        <select id="difficulty" onChange={handleDifficultyChange} value={selectedDifficulty}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="impossible">Impossible</option>
        </select>
        <br />
        <button onClick={handleStartAIGame}>Start Game</button>
      </div>
        
    )}
  </div>
  <div className="fact-card" key={factIndex}>
        <p> {funFact} </p>
      </div>
</div>
  );
};

export default GameMenu;
