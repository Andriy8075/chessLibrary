import { getGameState, getPlayerColor, getSelectedSquare, setSelectedSquare, clearSelection, getSelectedPiecePosition, setSelectedPiecePosition } from './gameState.js';
import { sendMoveRequest } from './moveHandler.js';

function handleSquareClick(square, boardRow, boardCol, arrangement) {
    const gameState = getGameState();
    const playerColor = getPlayerColor();
    
    if (!gameState || gameState.currentTurn !== playerColor) {
        return;
    }
    
    const piece = arrangement[boardRow]?.[boardCol] || null;
    const selectedSquare = getSelectedSquare();
    
    if (selectedSquare === square) {
        square.classList.remove('selected');
        clearSelection();
        return;
    }
    
    if (piece && piece.color === playerColor) {
        clearSelection();
        
        square.classList.add('selected');
        setSelectedSquare(square);
        setSelectedPiecePosition({ row: boardRow + 1, col: boardCol + 1 });
    } else {
        const selectedPiecePosition = getSelectedPiecePosition();
        if (selectedSquare && selectedPiecePosition) {
            const cellTo = { row: boardRow + 1, col: boardCol + 1 };
            sendMoveRequest(selectedPiecePosition, cellTo);
            
            clearSelection();
        } else {
            clearSelection();
        }
    }
}

export { handleSquareClick };

