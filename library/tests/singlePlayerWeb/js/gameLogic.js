import { getGameState, getSelectedSquare, setSelectedSquare, clearSelection, getSelectedPiecePosition, setSelectedPiecePosition } from './gameState.js';
import { sendMoveRequest } from './moveHandler.js';

function handleSquareClick(square, boardRow, boardCol, arrangement) {
    const gameState = getGameState();
    
    // Check if game is active
    if (!gameState || gameState.gameStatus !== 'active') {
        return;
    }
    
    const piece = arrangement[boardRow]?.[boardCol] || null;
    const selectedSquare = getSelectedSquare();
    
    // If clicking on the already selected square, deselect it
    if (selectedSquare === square) {
        square.classList.remove('selected');
        clearSelection();
        return;
    }
    
    // If clicking on own piece (any piece since single player), select it
    if (piece && piece.color === gameState.currentTurn) {
        // Remove highlight from previously selected square
        clearSelection();
        
        // Add highlight to clicked square
        square.classList.add('selected');
        setSelectedSquare(square);
        // Store position in 1-based coordinates (as expected by the server)
        setSelectedPiecePosition({ row: boardRow + 1, col: boardCol + 1 });
    } else {
        // Clicking on opponent's piece or empty cell
        const selectedPiecePosition = getSelectedPiecePosition();
        if (selectedSquare && selectedPiecePosition) {
            // Send move request
            const cellTo = { row: boardRow + 1, col: boardCol + 1 };
            sendMoveRequest(selectedPiecePosition, cellTo);
            
            // Clear selection
            clearSelection();
        } else {
            // No piece selected, just clear any selection
            clearSelection();
        }
    }
}

export { handleSquareClick };

