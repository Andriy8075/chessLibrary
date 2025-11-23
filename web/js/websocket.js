import { setGameState, setPlayerColor, resetSelection } from './gameState.js';
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
        console.log('Message from server:', event);
        console.log('Message from server:', event.data);
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
            if (message.data && message.data.state) {
                setGameState(message.data.state);
                createBoard(message.data.state);
                if (message.data.success) {
                    updateStatus('Move successful');
                } else if (message.data.error) {
                    updateStatus(`Move failed: ${message.data.error}`);
                }
            }
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

function getSocket() {
    return socket;
}

export {
    connectWebSocket,
    sendMessage,
    getSocket
};

