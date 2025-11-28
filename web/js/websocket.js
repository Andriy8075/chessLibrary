import { setGameState, setPlayerColor, resetSelection, getPlayerColor } from './gameState.js';
import { createBoard } from './board.js';
import { updateStatus } from './uiHelpers.js';

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
    
    // Update game state if provided
    if (data.state) {
        // The state should already be serialized from the server
        // But we need to ensure the board is properly serialized
        let gameState = data.state;
        
        // If board is not an array (not serialized), we can't handle it
        // The server should serialize it before sending
        if (!Array.isArray(gameState.board)) {
            console.warn('Board state is not serialized properly');
        }
        
        setGameState(gameState);
        createBoard(gameState);
    }
    
    // Handle response status
    if (data.success) {
        const statusMessages = [];
        
        // Check for special game states
        if (data.checkmate) {
            statusMessages.push('Checkmate!');
            if (data.state && data.state.winner) {
                const winner = data.state.winner === getPlayerColor() ? 'You' : 'Opponent';
                statusMessages.push(`${winner} win!`);
            }
        } else if (data.stalemate) {
            statusMessages.push('Stalemate! Game is a draw.');
        } else if (data.draw) {
            statusMessages.push('Game is a draw.');
        } else if (data.check) {
            statusMessages.push('Check!');
        } else {
            statusMessages.push('Move successful');
        }
        
        // Show whose turn it is
        if (data.state && data.state.currentTurn) {
            const currentPlayer = data.state.currentTurn === getPlayerColor() ? 'Your' : 'Opponent\'s';
            statusMessages.push(`${currentPlayer} turn`);
        }
        
        // Show game status if game has ended
        if (data.state && data.state.gameStatus && data.state.gameStatus !== 'active') {
            if (data.state.gameStatus === 'checkmate') {
                // Already handled above
            } else if (data.state.gameStatus === 'draw') {
                // Already handled above
            } else if (data.state.gameStatus === 'resigned') {
                statusMessages.push('Game ended by resignation');
            }
        }
        
        updateStatus(statusMessages.join(' - '));
    } else if (data.error) {
        updateStatus(`Move failed: ${data.error}`);
    } else {
        updateStatus('Received game response');
    }
}

function getSocket() {
    return socket;
}

export {
    connectWebSocket,
    sendMessage,
    getSocket
};

