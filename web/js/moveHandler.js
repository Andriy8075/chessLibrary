import { getSocket } from './websocket.js';
import { updateStatus } from './uiHelpers.js';
import { setPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';

function sendMoveRequest(cellFrom, cellTo, promotion = null) {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateStatus('Not connected to server');
        return;
    }
    
    if (!promotion) {
        setPendingPromotionMove({ from: cellFrom, to: cellTo });
    } else {
        clearPendingPromotionMove();
    }
    
    const gameRequest = {
        type: 'move',
        from: cellFrom,
        to: cellTo
    };
    
    if (promotion) {
        gameRequest.promotion = promotion;
    }
    
    const message = {
        type: 'gameRequest',
        gameRequest: gameRequest
    };
    
    socket.send(JSON.stringify(message));
    updateStatus('Sending move...');
}

function sendResignRequest() {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateStatus('Not connected to server');
        return;
    }
    
    const gameRequest = {
        type: 'resign'
    };
    
    const message = {
        type: 'gameRequest',
        gameRequest: gameRequest
    };
    
    socket.send(JSON.stringify(message));
    updateStatus('Sending resign request...');
}

function sendProposeDrawRequest() {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateStatus('Not connected to server');
        return;
    }
    
    const gameRequest = {
        type: 'proposeDraw'
    };
    
    const message = {
        type: 'gameRequest',
        gameRequest: gameRequest
    };
    
    socket.send(JSON.stringify(message));
    updateStatus('Sending draw proposal...');
}

function sendAcceptDrawRequest() {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateStatus('Not connected to server');
        return;
    }
    
    const gameRequest = {
        type: 'acceptDraw'
    };
    
    const message = {
        type: 'gameRequest',
        gameRequest: gameRequest
    };
    
    socket.send(JSON.stringify(message));
    updateStatus('Accepting draw proposal...');
}

export { sendMoveRequest, sendResignRequest, sendProposeDrawRequest, sendAcceptDrawRequest };

