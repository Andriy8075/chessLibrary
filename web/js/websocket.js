import { setGameState, setPlayerColor, resetSelection, getPlayerColor, setPendingPromotionMove, getPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';
import { createBoard } from './board.js';
import { updateStatus } from './uiHelpers.js';
import { sendMoveRequest } from './moveHandler.js';

let socket = null;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    socket = new WebSocket(wsUrl);
    
    setupSocketHandlers();
}

function setupSocketHandlers() {
    socket.onopen = function(event) {
        console.log('Connected to WebSocket server');
        updateStatus('Connected');
    };

    socket.addEventListener('message', function(event) {
        try {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        } catch (e) {
            console.error('Failed to parse message:', e);
        }
    });

    socket.onclose = function(event) {
        console.log('WebSocket connection closed');
        updateStatus('Disconnected');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
        updateStatus('Connection error');
    };
}

function handleServerMessage(message) {
    switch (message.type) {
        case 'waitingForOpponent':
            updateStatus('Waiting for opponent...');
            break;
        case 'gameFound':
            setGameState(message.data.gameState);
            setPlayerColor(message.data.color);
            updateStatus(`Game found! You are playing as ${message.data.color}`);
            createBoard(message.data.gameState);
            hidePromotionButtons();
            clearPendingPromotionMove();
            break;
        case 'gameResponse':
            handleGameResponse(message.data);
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
}

function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        return true;
    }
    return false;
}

function handleGameResponse(data) {
    if (!data) {
        console.error('Invalid game response data');
        return;
    }
    
    if (data.state) {
        let gameState = data.state;
        
        if (!Array.isArray(gameState.board)) {
            console.warn('Board state is not serialized properly');
        }
        
        setGameState(gameState);
        createBoard(gameState);
        if (gameState.promotionRequired === true) {
            console.log('Promotion required');
            if (!getPendingPromotionMove()) {
                setPendingPromotionMove('not_pending');
            }
            showPromotionButtons();
        } else {
            hidePromotionButtons();
            clearPendingPromotionMove();
        }
    }
    
    if (data.success) {
        const statusMessages = [];
        
        const gameEndsStatusHandlers = {
            'checkmate': () => {
                statusMessages.push('Checkmate!');
                if (data.state && data.state.winner) {
                    const winner = data.state.winner === getPlayerColor() ? 'You' : 'Opponent';
                    statusMessages.push(`${winner} win!`);
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
            const currentPlayer = data.state.currentTurn === getPlayerColor() ? 'Your' : 'Opponent\'s';
            statusMessages.push(`${currentPlayer} turn`);
        }
        
        updateStatus(statusMessages.join(' - '));
    }
    else if (data.state.promotionRequired) {
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
        button.addEventListener('click', function() {
            const piece = this.dataset.piece;
            const pendingMove = getPendingPromotionMove();
            
            if (pendingMove) {
                sendMoveRequest(pendingMove.from, pendingMove.to, piece);
                hidePromotionButtons();
                clearPendingPromotionMove();
            }
        });
    });
}

function getSocket() {
    return socket;
}

export {
    connectWebSocket,
    sendMessage,
    getSocket
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPromotionButtons);
} else {
    setupPromotionButtons();
}

