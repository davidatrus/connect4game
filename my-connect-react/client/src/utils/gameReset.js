import socket from '../socket';
export function resetGame({
    createBoard,
    setBoard,
    setCurrentPlayer,
    currentPlayerRef,
    setDisplayName,
    setOpponentName,
    setWinner,
    setGameMode,
    setShowConfetti,
    setRecycleConfetti,
    setLastMove,
    setMyPlayerNumber,
    setWinningCells,
    setSpectators,
    hasSetDisplayNameRef,
    setMenuScreen,
}) {
    console.log('🔁 Resetting game to menu...');
    setBoard(createBoard());
    setCurrentPlayer(1);
    currentPlayerRef.current = 1;
    setDisplayName('');
    setOpponentName('');
    setWinner(null);
    setGameMode(null); // Kicks back to menu
    setShowConfetti(false);
    setRecycleConfetti(true);
    setLastMove(null);
    setMyPlayerNumber(null);
    setWinningCells(null);
    setSpectators([]);
    hasSetDisplayNameRef.current = false;
    if (setMenuScreen) {
        setMenuScreen(null); 
    }
}

export function resetToMenu({
    gameMode,
    isSpectator,
    gameCode,
    resetGameFn,
    setMenuScreen, 
}) {
    if (gameMode === 'ONLINE') {
        const confirmLeave = window.confirm(
            "Are you sure you want to return to the menu? This will end your current game."
        );
        if (!confirmLeave) return;

        socket.emit('leaveRoom', gameCode);
    }

    if (isSpectator) {
        socket.emit('leaveRoom', gameCode);
    }

    resetGameFn();
    setMenuScreen(null); 
}