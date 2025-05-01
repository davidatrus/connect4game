// src/components/OnlineMenu.js
import React, { useState, useEffect } from 'react';
import socket from '../socket';

const OnlineMenu = ({
  displayName,
  setDisplayName,
  setMenuScreen,
  menuScreen,
  setGameMode,
  setGameCode,
  setIsHost,
  setIsOnlineModeChosen,
  parentHandleBack,
  clearPreRoomState
}) => {
  const [publicGames, setPublicGames] = useState([]);
  const [selectedGameCode, setSelectedGameCode] = useState(null);
  const [gameCodeInput, setGameCodeInput] = useState('');
  const [localGameCode, setLocalGameCode] = useState('');
  const [isHostingPublic, setIsHostingPublic] = useState(null);

  useEffect(() => {
    if (menuScreen === 'publicList') {
      socket.emit('getPublicGames', 'join');
    } else if (menuScreen === 'spectateList') {
      socket.emit('getPublicGames', 'spectate');
    }
  }, [menuScreen]);

  useEffect(() => {
    if (menuScreen !== 'spectateList') return;
    const interval = setInterval(() => {
      socket.emit('getPublicGames', 'spectate');
    }, 5000);
    return () => clearInterval(interval);
  }, [menuScreen]);

  useEffect(() => {
    const handleGamesList = (games) => {
      setPublicGames(games);
    };
    socket.on('publicGamesList', handleGamesList);
    return () => socket.off('publicGamesList', handleGamesList);
  }, []);

  const generateGameCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const startOnlineGame = ({ isHost, code, isPublic = false }) => {
    clearPreRoomState();
    socket.emit(isHost ? 'createRoom' : 'joinRoom', {
      roomCode: code,
      name: displayName,
      isPublic,
    });
    setDisplayName(displayName);
    setGameCode(code);
    setIsHost(isHost);
    setGameMode('ONLINE');
  };
  //   const handleBack = () => {
  //     if (menuScreen === 'hostPublicOrPrivate' || menuScreen === 'joinPublicOrPrivate' || menuScreen === 'spectateList') {
  //       setMenuScreen('hostjoin');
  //     } else if (menuScreen === 'host' || menuScreen === 'publicList' || menuScreen === 'join') {
  //       if (menuScreen === 'host') {
  //         setMenuScreen('hostPublicOrPrivate');
  //       } else {
  //         setMenuScreen('joinPublicOrPrivate');
  //       }
  //     } else {
  //       setMenuScreen('localOrOnline');
  //     }
  //     setSelectedGameCode(null);
  //   };

  return (
    <>
      {/* 🔙 Back button (floating top-left, outside card) */}
      <button className="back-button" onClick={parentHandleBack}>
        ⬅ Back
      </button>

      {/* 🃏 Actual menu contents wrapped inside a card */}
      {menuScreen === 'hostjoin' && (
        <>
          <button onClick={() => setMenuScreen('hostPublicOrPrivate')}>
            Host Game
          </button>
          <button onClick={() => setMenuScreen('joinPublicOrPrivate')}>
            Join Game
          </button>
          <button onClick={() => setMenuScreen('spectateList')}>
            Spectate a Game
          </button>
        </>
      )}

      {menuScreen === 'hostPublicOrPrivate' && (
        <>
          <p>Would you like to host a public or private game?</p>
          <button onClick={() => {
            setIsHostingPublic(true);
            setLocalGameCode(generateGameCode());
            setMenuScreen('host');
          }}>
            Public Game
          </button>
          <button onClick={() => {
            setIsHostingPublic(false);
            setLocalGameCode(generateGameCode());
            setMenuScreen('host');
          }}>
            Private Game
          </button>
        </>
      )}

      {menuScreen === 'host' && (
        <>
          {isHostingPublic === false && (
            <>
              <p>🎉 Share this code with a friend:</p>
              <h3>{localGameCode}</h3>
            </>
          )}
          <button onClick={() => startOnlineGame({ isHost: true, code: localGameCode, isPublic: isHostingPublic })}>
            Start Game
          </button>
        </>
      )}

      {menuScreen === 'joinPublicOrPrivate' && (
        <>
          <p>How would you like to join a game?</p>
          <button onClick={() => setMenuScreen('publicList')}>
            Find Public Game
          </button>
          <button onClick={() => setMenuScreen('join')}>
            Enter Game Code
          </button>
        </>
      )}

      {menuScreen === 'join' && (
        <>
          <input
            type="text"
            placeholder="Enter Game Code"
            value={gameCodeInput}
            onChange={(e) => setGameCodeInput(e.target.value.toUpperCase())}
            maxLength={6}
            className="input-game-code"
          />
          <button
            onClick={() => {
              if (gameCodeInput.trim().length === 6) {
                clearPreRoomState();
                startOnlineGame({ isHost: false, code: gameCodeInput });
              } else {
                alert('Please enter a valid 6-character game code.');
              }
            }}
          >
            Join Game
          </button>
        </>
      )}

      {menuScreen === 'publicList' && (
        <>
          <h3>Select a Public Game:</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <div className="auto-refresh-indicator" title="Public game list updates in real-time.">
              <div className="dot" /> Auto-refreshing
            </div>
          </div>
          <ul className="public-game-list">
            {publicGames.length === 0 ? (
              <li className="public-game-item empty">No public games available.</li>
            ) : (
              publicGames.map((game) => (
                <li
                  key={game.roomCode}
                  className={`public-game-item ${selectedGameCode === game.roomCode ? 'selected' : ''}`}
                  onClick={() => setSelectedGameCode(game.roomCode)}
                >
                  <span className="custom-radio">
                    <span className="inner-dot" />
                  </span>
                  <span className="game-label">{game.hostName}'s Public Game</span>

                </li>
              ))
            )}
          </ul>
          <button
            disabled={!selectedGameCode}
            onClick={() => {
              clearPreRoomState();
              startOnlineGame({ isHost: false, code: selectedGameCode });
            }}
          >
            Join Selected Game
          </button>
        </>
      )}

      {menuScreen === 'spectateList' && (
        <>
          <h3>Select a Game to Spectate:</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <div className="auto-refresh-indicator" title="Public game list updates in real-time.">
              <div className="dot" /> Auto-refreshing
            </div>
          </div>
          <ul className="public-game-list">
            {publicGames.length === 0 ? (
              <li className="public-game-item empty">No public games available.</li>
            ) : (
              publicGames.map((game) => (
                <li
                  key={game.roomCode}
                  className={`public-game-item ${selectedGameCode === game.roomCode ? 'selected' : ''}`}
                  onClick={() => setSelectedGameCode(game.roomCode)}
                >
                  <span className="custom-radio">
                    <span className="inner-dot" />
                  </span>
                  <span className="game-label">{game.hostName}'s Game</span>
                </li>
              ))
            )}
          </ul>
          <button
            disabled={!selectedGameCode}
            onClick={() => {
              clearPreRoomState();
              socket.emit('joinAsSpectator', selectedGameCode, displayName || 'Unknown');
              setDisplayName(displayName);
              setGameCode(selectedGameCode);
              setGameMode('SPECTATE');
            }}
          >
            Spectate Selected Game
          </button>
        </>
      )}
    </>
  );
};

export default OnlineMenu;
