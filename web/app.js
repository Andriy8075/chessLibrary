let socket;
let gameState = null;
let playerColor = null;

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
            gameState = message.data.gameState;
            playerColor = message.data.color;
            updateStatus(`Game found! You are playing as ${playerColor}`);
            createBoard(gameState);
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
}

function findGame() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type: 'findGame' });
        socket.send(message);
        updateStatus('Searching for game...');
    } else {
        updateStatus('Not connected to server');
    }
}

function updateStatus(text) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = text;
    }
}

function createBoard(state) {
    const boardEl = document.getElementById('chessBoard');
    boardEl.innerHTML = '';
    
    if (!state || !state.board) {
        console.error('Invalid game state');
        return;
    }
    
    const arrangement = Array.isArray(state.board) ? state.board : [];
    
    const isBlackPlayer = playerColor === 'black';
    
    for (let displayRow = 0; displayRow < 8; displayRow++) {
        for (let displayCol = 0; displayCol < 8; displayCol++) {
            const boardRow = isBlackPlayer ? displayRow : 7 - displayRow;
            const boardCol = isBlackPlayer ? displayCol : 7 - displayCol;
            
            const square = document.createElement('div');
            const isLight = (displayRow + displayCol) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            
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
            
            boardEl.appendChild(square);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const findGameBtn = document.getElementById('findGameBtn');
    if (findGameBtn) {
        findGameBtn.addEventListener('click', findGame);
    }
});

connectWebSocket();
