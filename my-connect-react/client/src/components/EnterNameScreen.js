// src/components/EnterNameScreen.js
import React, { useState, useEffect } from 'react';

const EnterNameScreen = ({
  setDisplayName,
  setMenuScreen,
  setIsOnlineModeChosen,
  setIsHumanModeChosen,
  hasSetDisplayNameRef, 
}) => {
  const [inputName, setInputName] = useState('');

  useEffect(() => {
    setInputName(''); // Reset cleanly when screen is mounted
  }, []);

  const handleContinue = () => {
    const trimmed = inputName.trim();
    if (!trimmed) {
      alert('Please enter a valid display name.');
      return;
    }
    console.log('🎯 Continuing with name:', trimmed);
    setDisplayName(trimmed);
    hasSetDisplayNameRef.current = true;
    setIsHumanModeChosen(true);
    setIsOnlineModeChosen(true);
    setMenuScreen('hostjoin');
  };

  const handleBack = () => {
    console.log('🔙 Going back to Local/Online screen');
    setMenuScreen('localOrOnline');
    setIsOnlineModeChosen(false);
  };

  return (
    <div className="fullscreen-center">
      <button
        className="back-button"
        onClick={handleBack}
      >
        ⬅ Back
      </button>

      <div className="menu-card">
        <h2>Enter Display Name</h2>
        <input
          type="text"
          placeholder="Your name"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleContinue();
            }
          }}
          className="input-display-name"
        />
        <button onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
};

export default EnterNameScreen;
