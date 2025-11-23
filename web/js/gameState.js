// Game state management
let gameState = null;
let playerColor = null;
let selectedSquare = null;
let selectedPiecePosition = null;

function getGameState() {
    return gameState;
}

function setGameState(state) {
    gameState = state;
}

function getPlayerColor() {
    return playerColor;
}

function setPlayerColor(color) {
    playerColor = color;
}

function getSelectedSquare() {
    return selectedSquare;
}

function setSelectedSquare(square) {
    selectedSquare = square;
}

function clearSelection() {
    if (selectedSquare) {
        selectedSquare.classList.remove('selected');
    }
    selectedSquare = null;
    selectedPiecePosition = null;
}

function getSelectedPiecePosition() {
    return selectedPiecePosition;
}

function setSelectedPiecePosition(position) {
    selectedPiecePosition = position;
}

function resetSelection() {
    selectedSquare = null;
    selectedPiecePosition = null;
}

export {
    getGameState,
    setGameState,
    getPlayerColor,
    setPlayerColor,
    getSelectedSquare,
    setSelectedSquare,
    clearSelection,
    getSelectedPiecePosition,
    setSelectedPiecePosition,
    resetSelection
};

