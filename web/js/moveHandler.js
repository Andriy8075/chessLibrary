import { getSocket } from './websocket.js';
import { updateStatus } from './uiHelpers.js';

function sendMoveRequest(cellFrom, cellTo) {
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        updateStatus('Not connected to server');
        return;
    }
    
    const message = {
        type: 'gameRequest',
        gameRequest: {
            type: 'move',
            from: cellFrom,
            to: cellTo
        }
    };
    
    socket.send(JSON.stringify(message));
    updateStatus('Sending move...');
}

export { sendMoveRequest };

