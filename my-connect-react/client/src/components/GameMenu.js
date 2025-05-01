// src/components/GameMenu.js
import React, { useState, useEffect } from 'react';
import EnterNameScreen from './EnterNameScreen';
import OnlineMenu from './OnlineMenu';
import { useFunFacts } from '../hooks/useFunFacts';

const GameMenu = ({
  setGameMode,
  setAIDifficulty,
  setDisplayName,
  displayName,
  setGameCode,
  setIsHost,
  menuScreen,
  setMenuScreen,
  clearPreRoomState,
  hasSetDisplayNameRef,
}) => {
  const [isAISelected, setIsAISelected] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [isHumanModeChosen, setIsHumanModeChosen] = useState(false);
  const [isOnlineModeChosen, setIsOnlineModeChosen] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [nextMenuAfterModal, setNextMenuAfterModal] = useState(null);



  const funFact = useFunFacts();

  const shouldShowTagline = (
    (menuScreen === null) || 
    (menuScreen === 'localOrOnline') || 
    (menuScreen === 'hostjoin')
  );
  const showBackButton = (
    (isHumanModeChosen && !isOnlineModeChosen && menuScreen === 'localOrOnline') ||
    (isAISelected && menuScreen === null)
  );

  const handleBack = () => {
    console.log('📦 handleBack triggered');
    console.log('Before Back — menuScreen:', menuScreen);
  
    if (menuScreen === 'hostjoin') {
      console.log('🛑 Showing Change Name Modal');
      setShowChangeNameModal(true);
      setNextMenuAfterModal(null); // Will send user to Main Menu if they click "No"
    } else if (menuScreen === 'hostPublicOrPrivate') {
      console.log('🔙 Going back from Host Public/Private to Host/Join/Spectate');
      setMenuScreen('hostjoin');
    } else if (menuScreen === 'joinPublicOrPrivate') {
      console.log('🔙 Going back from Join Public/Private to Host/Join/Spectate');
      setMenuScreen('hostjoin');
    } else if (menuScreen === 'spectateList') {
      console.log('🔙 Going back from Spectate List to Host/Join/Spectate');
      setMenuScreen('hostjoin');
    } else if (menuScreen === 'host') {
      console.log('🔙 Going back from Host to Host Public/Private');
      setMenuScreen('hostPublicOrPrivate');
    } else if (menuScreen === 'join' || menuScreen === 'publicList') {
      console.log('🔙 Going back from Join to Join Public/Private');
      setMenuScreen('joinPublicOrPrivate');
    } else if (isAISelected && menuScreen === null) {
      console.log('🧠 AI mode: back to AI difficulty select');
      setIsAISelected(false);
    } else if (menuScreen === 'localOrOnline') {
      console.log('🔙 Going back to Top-Level Main Menu');
      setMenuScreen(null);
      setIsHumanModeChosen(false);
      setIsOnlineModeChosen(false);
    } else {
      console.log('❓ Unexpected Back — fallback to Main Menu');
      setMenuScreen(null);
      setIsHumanModeChosen(false);
      setIsOnlineModeChosen(false);
    }    
  };
  


  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
    setAIDifficulty(e.target.value);
  };

  const handleStartAIGame = () => {
    setAIDifficulty(selectedDifficulty);
    setGameMode('AI');
  };

  useEffect(() => {
    console.log('🔥 menuScreen changed:', menuScreen);

    if (menuScreen === 'hostjoin' || menuScreen === 'spectateList' || menuScreen === 'hostPublicOrPrivate' || menuScreen === 'joinPublicOrPrivate') {
      setIsHumanModeChosen(true);
      setIsOnlineModeChosen(true);
    } else if (menuScreen === 'resetName') {
      setIsHumanModeChosen(true);
      setIsOnlineModeChosen(true);
    } else if (menuScreen === 'localOrOnline') {
      setIsHumanModeChosen(true);
      setIsOnlineModeChosen(false);
    } else if (menuScreen === null) {
      setIsHumanModeChosen(false);
      setIsOnlineModeChosen(false);
    }
  }, [menuScreen]);

  if (isOnlineModeChosen && menuScreen === 'resetName') {
    return (
      <EnterNameScreen
        setDisplayName={setDisplayName}
        setMenuScreen={setMenuScreen}
        setIsOnlineModeChosen={setIsOnlineModeChosen}
        setIsHumanModeChosen={setIsHumanModeChosen}
        hasSetDisplayNameRef={hasSetDisplayNameRef}
      />
    );
  }

  return (
    <div className="menu-container">
      <div className="menu-card">
        <div className="icon-row">
          <span role="img" aria-label="Red" className="token">🔴</span>
          <span role="img" aria-label="Yellow" className="token">🟡</span>
        </div>
        <h2 className="slide-title">Connect 4</h2>

        {showBackButton && (
          <button
            className="back-button"
            onClick={() => {
              // Special intercept
              if (menuScreen === 'hostjoin') {
                console.log('📦 Intercepted Back from HostJoin -> showing Change Name Modal');
                setShowChangeNameModal(true);
                setNextMenuAfterModal('localOrOnline');
              } else {
                console.log('📦 NORMAL handleBack triggered');
                handleBack();
              }
            }}
          >
            ⬅ Back
          </button>
        )}




        {shouldShowTagline && (
          <>
            <p className="tagline"><em>Challenge a friend or face the smartest AI</em></p>
            <p className="tagline">Select a mode to start playing</p>
          </>
        )}

        {/* PLAY VS HUMAN / AI SELECTION */}
        {!isHumanModeChosen && !isOnlineModeChosen && !isAISelected && (
          <>
            <button onClick={() => {
              setIsHumanModeChosen(true);
              setMenuScreen('localOrOnline');
              console.log('👤 Clicked Play vs Human — showing Local/Online screen.');
            }}>
              Play vs Human
            </button>
            <button onClick={() => setIsAISelected(true)}>
              Play vs Computer
            </button>
          </>
        )}

        {/* LOCAL / ONLINE SELECTION */}
        {menuScreen === 'localOrOnline' && (
          <>
            <button onClick={() => {
              setGameMode('HUMAN');
            }}>
              Play Locally
            </button>
            <button onClick={() => {
              console.log('🌐 Play Online selected');
              setMenuScreen('resetName');
            }}>
              Play Online
            </button>
          </>
        )}


        {/* 👥 HOST / JOIN / SPECTATE */}
        {!showChangeNameModal && (menuScreen === 'hostjoin' || menuScreen === 'hostPublicOrPrivate' || menuScreen === 'joinPublicOrPrivate' || menuScreen === 'host' || menuScreen === 'join' || menuScreen === 'spectateList' || menuScreen === 'publicList') && (
          <OnlineMenu
            displayName={displayName}
            setDisplayName={setDisplayName}
            setGameMode={setGameMode}
            setGameCode={setGameCode}
            setIsHost={setIsHost}
            setMenuScreen={setMenuScreen}
            menuScreen={menuScreen}
            parentHandleBack={handleBack}
            clearPreRoomState={clearPreRoomState} 
          />
        )}


        {/* AI Difficulty Selection */}
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
      {showChangeNameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Would you like to update your display name?</h3>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setMenuScreen('resetName');
                  setShowChangeNameModal(false);
                }}
              >
                Yes, Update Name
              </button>
              <button
                onClick={() => {
                  // Send them all the way back to Main Menu
                  setMenuScreen(null);
                  setIsHumanModeChosen(false);
                  setIsOnlineModeChosen(false);
                  setShowChangeNameModal(false);
                }}
              >
                No, Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}



      <div className="fact-card">
        <p>{funFact}</p>
      </div>
    </div>
  );
};

export default GameMenu;
