import { getGameState, setGameState, setPendingPromotionMove, getPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';
import { createBoard } from './board.js';
import { updateStatus } from './uiHelpers.js';
import { sendMoveRequest, sendResignRequest, sendProposeDrawRequest, sendAcceptDrawRequest } from './moveHandler.js';

const API_BASE_URL = 'http://localhost:3001';

async function loadGameState() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/game-state`);
        const data = await response.json();
        
        if (data.success && data.state) {
            setGameState(data.state);
            createBoard(data.state);
            updateDrawButtons(data.state);
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
    
    const isPromotionRequired = data.state && data.state.promotionRequired === true;
    
    if (isPromotionRequired) {
        if (data.state) {
            setGameState(data.state);
            createBoard(data.state);
        }
        showPromotionButtons();
        updateStatus('Promotion required - choose a piece');
        return;
    }
    
    if (data.success) {
        if (data.state) {
        setGameState(data.state);
        createBoard(data.state);
        
        hidePromotionButtons();
        clearPendingPromotionMove();
        }
        
        // Update draw buttons based on game state
        if (data.state) {
            updateDrawButtons(data.state);
        }
        
        const statusMessages = [];
        
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
                const { winner } = data.state;
                const loser = winner === 'white' ? 'black' : 'white';
                statusMessages.push(`${loser} resigned. ${winner} wins!`);
            },
            'drawByAgreement': () => {
                statusMessages.push('Draw by agreement!');
            }
        };
        
        // Handle draw proposal success
        if (data.state && data.state.gameStatus === 'active' && data.state.pendingDrawProposal) {
            statusMessages.push('Draw proposal sent');
        }
        
        const gameEndFunction = gameEndsStatusHandlers[data.state.gameStatus];
        if (gameEndFunction) {
            gameEndFunction();
            hideDrawButtons();
        } else {
            // Only show "Move successful" if it's not a draw proposal/acceptance
            if (data.state.gameStatus === 'active' && !data.state.pendingDrawProposal) {
                statusMessages.push('Move successful');
            }
        }
        
        if (data.state.gameStatus === 'active') {
            statusMessages.push(`${data.state.currentTurn}'s turn`);
        }
        
        updateStatus(statusMessages.join(' - '));
    }
    else {
        if (data.error) {
            updateStatus(`Move failed: ${data.error}`);
        } else {
            updateStatus('Move failed: Unknown error');
        }
        clearPendingPromotionMove();
        hidePromotionButtons();
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
            updateDrawButtons(result.state);
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
    
    const testCaseNameInput = document.getElementById('testCaseNameInput');
    if (testCaseNameInput) {
        testCaseNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveGame();
            }
        });
    }
}

function setupGameActionButtons() {
    // White buttons
    const whiteResignBtn = document.getElementById('whiteResignBtn');
    if (whiteResignBtn) {
        whiteResignBtn.addEventListener('click', async function() {
            if (confirm('Are you sure White wants to resign?')) {
                await sendResignRequest('white');
            }
        });
    }
    
    const whiteProposeDrawBtn = document.getElementById('whiteProposeDrawBtn');
    if (whiteProposeDrawBtn) {
        whiteProposeDrawBtn.addEventListener('click', async function() {
            if (confirm('Propose a draw as White?')) {
                await sendProposeDrawRequest('white');
            }
        });
    }
    
    const whiteAcceptDrawBtn = document.getElementById('whiteAcceptDrawBtn');
    if (whiteAcceptDrawBtn) {
        whiteAcceptDrawBtn.addEventListener('click', async function() {
            if (confirm('Accept the draw proposal as White?')) {
                await sendAcceptDrawRequest('white');
            }
        });
    }
    
    // Black buttons
    const blackResignBtn = document.getElementById('blackResignBtn');
    if (blackResignBtn) {
        blackResignBtn.addEventListener('click', async function() {
            if (confirm('Are you sure Black wants to resign?')) {
                await sendResignRequest('black');
            }
        });
    }
    
    const blackProposeDrawBtn = document.getElementById('blackProposeDrawBtn');
    if (blackProposeDrawBtn) {
        blackProposeDrawBtn.addEventListener('click', async function() {
            if (confirm('Propose a draw as Black?')) {
                await sendProposeDrawRequest('black');
            }
        });
    }
    
    const blackAcceptDrawBtn = document.getElementById('blackAcceptDrawBtn');
    if (blackAcceptDrawBtn) {
        blackAcceptDrawBtn.addEventListener('click', async function() {
            if (confirm('Accept the draw proposal as Black?')) {
                await sendAcceptDrawRequest('black');
            }
        });
    }
}

function updateDrawButtons(gameState) {
    if (!gameState || gameState.gameStatus !== 'active') {
        hideDrawButtons();
        return;
    }
    
    const pendingDrawProposal = gameState.pendingDrawProposal;
    
    // White buttons
    const whiteProposeDrawBtn = document.getElementById('whiteProposeDrawBtn');
    const whiteAcceptDrawBtn = document.getElementById('whiteAcceptDrawBtn');
    
    // Black buttons
    const blackProposeDrawBtn = document.getElementById('blackProposeDrawBtn');
    const blackAcceptDrawBtn = document.getElementById('blackAcceptDrawBtn');
    
    if (pendingDrawProposal === null) {
        // No pending proposal - show propose buttons, hide accept buttons
        if (whiteProposeDrawBtn) whiteProposeDrawBtn.style.display = 'inline-block';
        if (whiteAcceptDrawBtn) whiteAcceptDrawBtn.style.display = 'none';
        if (blackProposeDrawBtn) blackProposeDrawBtn.style.display = 'inline-block';
        if (blackAcceptDrawBtn) blackAcceptDrawBtn.style.display = 'none';
    } else if (pendingDrawProposal === 'white') {
        // White proposed - hide white propose, show black accept
        if (whiteProposeDrawBtn) whiteProposeDrawBtn.style.display = 'none';
        if (whiteAcceptDrawBtn) whiteAcceptDrawBtn.style.display = 'none';
        if (blackProposeDrawBtn) blackProposeDrawBtn.style.display = 'none';
        if (blackAcceptDrawBtn) blackAcceptDrawBtn.style.display = 'inline-block';
    } else if (pendingDrawProposal === 'black') {
        // Black proposed - hide black propose, show white accept
        if (whiteProposeDrawBtn) whiteProposeDrawBtn.style.display = 'none';
        if (whiteAcceptDrawBtn) whiteAcceptDrawBtn.style.display = 'inline-block';
        if (blackProposeDrawBtn) blackProposeDrawBtn.style.display = 'none';
        if (blackAcceptDrawBtn) blackAcceptDrawBtn.style.display = 'none';
    }
}

function hideDrawButtons() {
    // Only hide draw buttons when game ends, resign buttons stay visible
    const whiteProposeDrawBtn = document.getElementById('whiteProposeDrawBtn');
    const whiteAcceptDrawBtn = document.getElementById('whiteAcceptDrawBtn');
    const blackProposeDrawBtn = document.getElementById('blackProposeDrawBtn');
    const blackAcceptDrawBtn = document.getElementById('blackAcceptDrawBtn');
    
    if (whiteProposeDrawBtn) whiteProposeDrawBtn.style.display = 'none';
    if (whiteAcceptDrawBtn) whiteAcceptDrawBtn.style.display = 'none';
    if (blackProposeDrawBtn) blackProposeDrawBtn.style.display = 'none';
    if (blackAcceptDrawBtn) blackAcceptDrawBtn.style.display = 'none';
}

export { loadGameState, handleGameResponse, setupSaveGameButton, setupPromotionButtons, setupGameActionButtons };

