import { getGameState, setGameState, setPendingPromotionMove, getPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';
import { createBoard } from './board.js';
import { updateStatus } from './uiHelpers.js';
import { sendMoveRequest } from './moveHandler.js';

const API_BASE_URL = 'http://localhost:3001';

// Load initial game state
async function loadGameState() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/game-state`);
        const data = await response.json();
        
        if (data.success && data.state) {
            setGameState(data.state);
            createBoard(data.state);
            updateStatus(`Game loaded. Current turn: ${data.state.currentTurn}`);
        } else {
            updateStatus('Failed to load game state');
        }
    } catch (error) {
        updateStatus(`Error loading game: ${error.message}`);
    }
}

function handleGameResponse(data) {
    if (!data) {
        console.error('Invalid game response data');
        return;
    }
    
    // Update game state if provided
    if (data.state) {
        setGameState(data.state);
        createBoard(data.state);
        
        // Handle promotion required state
        if (data.state.promotionRequired === true) {
            console.log('Promotion required');
            // Store the pending move if we don't already have it
            if (!getPendingPromotionMove()) {
                setPendingPromotionMove('not_pending');
            }
            showPromotionButtons();
        } else {
            hidePromotionButtons();
            clearPendingPromotionMove();
        }
    }
    
    // Handle response status
    if (data.success) {
        const statusMessages = [];
        
        // Status handler functions
        const gameEndsStatusHandlers = {
            'checkmate': () => {
                statusMessages.push('Checkmate!');
                if (data.state && data.state.winner) {
                    statusMessages.push(`${data.state.winner} wins!`);
                }
            },
            'stalemate': () => {
                statusMessages.push('Stalemate! Game is a draw.');
            },
            'insufficientMaterial': () => {
                statusMessages.push('Insufficient material! Game is a draw.');
            },
            'threefoldRepetition': () => {
                statusMessages.push('Threefold repetition! Game is a draw.');
            },
            'fiftyMoveRule': () => {
                statusMessages.push('Fifty move rule! Game is a draw.');
            },
            'check': () => {
                statusMessages.push('Check!');
            },
            'resigned': () => {
                statusMessages.push('Game ended by resignation');
            },
            'drawByAgreement': () => {
                statusMessages.push('Draw by agreement!');
            }
        };
        
        const gameEndFunction = gameEndsStatusHandlers[data.state.gameStatus];
        if (gameEndFunction) {
            gameEndFunction();
        } else {
            statusMessages.push('Move successful');
        }
        
        if (data.state.gameStatus === 'active') {
            statusMessages.push(`${data.state.currentTurn}'s turn`);
        }
        
        updateStatus(statusMessages.join(' - '));
    }
    else if (data.state && data.state.promotionRequired) {
        showPromotionButtons();
    } else if (data.error) {
        updateStatus(`Move failed: ${data.error}`);
    } else {
        updateStatus('Received game response');
    }
}

function showPromotionButtons() {
    const promotionContainer = document.getElementById('promotionContainer');
    if (promotionContainer) {
        promotionContainer.classList.add('visible');
    }
}

function hidePromotionButtons() {
    const promotionContainer = document.getElementById('promotionContainer');
    if (promotionContainer) {
        promotionContainer.classList.remove('visible');
    }
}

function setupPromotionButtons() {
    const promotionContainer = document.getElementById('promotionContainer');
    if (!promotionContainer) return;
    
    const buttons = promotionContainer.querySelectorAll('.promotion-button');
    buttons.forEach(button => {
        button.addEventListener('click', async function() {
            const piece = this.dataset.piece;
            const pendingMove = getPendingPromotionMove();
            
            if (pendingMove && pendingMove !== 'not_pending') {
                // Send the move with the selected promotion piece
                await sendMoveRequest(pendingMove.from, pendingMove.to, piece);
                hidePromotionButtons();
                clearPendingPromotionMove();
            }
        });
    });
}

async function saveGame() {
    const testCaseNameInput = document.getElementById('testCaseNameInput');
    const testCaseName = testCaseNameInput.value.trim();
    
    if (!testCaseName) {
        updateStatus('Please enter a test case name');
        return;
    }
    
    try {
        updateStatus('Saving game...');
        const response = await fetch(`${API_BASE_URL}/api/save-game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ testCaseName })
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateStatus(result.message);
            testCaseNameInput.value = '';
        } else {
            updateStatus(`Save failed: ${result.error}`);
        }
    } catch (error) {
        updateStatus(`Error saving game: ${error.message}`);
    }
}

async function resetGame() {
    try {
        updateStatus('Resetting game...');
        const response = await fetch(`${API_BASE_URL}/api/reset-game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.state) {
            setGameState(result.state);
            createBoard(result.state);
            updateStatus('Game reset. White to move.');
        } else {
            updateStatus('Failed to reset game');
        }
    } catch (error) {
        updateStatus(`Error resetting game: ${error.message}`);
    }
}

function setupSaveGameButton() {
    const saveGameBtn = document.getElementById('saveGameBtn');
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', saveGame);
    }
    
    const resetGameBtn = document.getElementById('resetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', resetGame);
    }
    
    // Allow Enter key to save
    const testCaseNameInput = document.getElementById('testCaseNameInput');
    if (testCaseNameInput) {
        testCaseNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveGame();
            }
        });
    }
}

// Export for use in app.js
export { loadGameState, handleGameResponse, setupSaveGameButton, setupPromotionButtons };

