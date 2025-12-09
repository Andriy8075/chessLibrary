let gameState = null;
let selectedSquare = null;
let selectedPiecePosition = null;
let pendingPromotionMove = null;

function getGameState() {
    return gameState;
}

function setGameState(state) {
    gameState = state;
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

function getPendingPromotionMove() {
    return pendingPromotionMove;
}

function setPendingPromotionMove(move) {
    pendingPromotionMove = move;
}

function clearPendingPromotionMove() {
    pendingPromotionMove = null;
}

export {
    getGameState,
    setGameState,
    getSelectedSquare,
    setSelectedSquare,
    clearSelection,
    getSelectedPiecePosition,
    setSelectedPiecePosition,
    resetSelection,
    getPendingPromotionMove,
    setPendingPromotionMove,
    clearPendingPromotionMove
};

