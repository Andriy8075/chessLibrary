import { getSocket } from './websocket.js';
import { updateStatus } from './uiHelpers.js';
import { setPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';

function sendMoveRequest(cellFrom, cellTo, promotion = null) {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateStatus('Not connected to server');
        return;
    }
    
    // If no promotion is specified, store the move in case promotion is required
    if (!promotion) {
        setPendingPromotionMove({ from: cellFrom, to: cellTo });
    } else {
        // Clear pending move when sending a promotion
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

export { sendMoveRequest };

