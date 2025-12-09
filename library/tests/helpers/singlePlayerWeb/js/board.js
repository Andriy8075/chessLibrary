import { resetSelection, setGameState } from './gameState.js';
import { handleSquareClick } from './gameLogic.js';

function createBoard(state) {
    const boardEl = document.getElementById('chessBoard');
    boardEl.innerHTML = '';
    resetSelection();
    setGameState(state);
    
    if (!state || !state.board) {
        console.error('Invalid game state');
        return;
    }
    
    const arrangement = Array.isArray(state.board) ? state.board : [];
    
    for (let displayRow = 0; displayRow < 8; displayRow++) {
        for (let displayCol = 0; displayCol < 8; displayCol++) {
            const boardRow = 7 - displayRow;
            const boardCol = displayCol;
            
            const square = document.createElement('div');
            const isLight = (displayRow + displayCol) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            
            square.dataset.boardRow = boardRow;
            square.dataset.boardCol = boardCol;
            
            const piece = arrangement[boardRow]?.[boardCol] || null;
            
            if (piece && piece.type && piece.color) {
                const img = document.createElement('img');
                const pieceType = piece.type.toLowerCase();
                const color = piece.color.toLowerCase();
                const pieceTypeCapitalized = pieceType.charAt(0).toUpperCase() + pieceType.slice(1);
                img.src = `images/${color}${pieceTypeCapitalized}.png`;
                img.alt = `${color} ${pieceType}`;
                square.appendChild(img);
            }
            
            square.addEventListener('click', function() {
                handleSquareClick(square, boardRow, boardCol, arrangement);
            });
            
            square.style.cursor = 'pointer';
            
            boardEl.appendChild(square);
        }
    }
}

export { createBoard };

