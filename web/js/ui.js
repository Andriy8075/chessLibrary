import { sendMessage } from './websocket.js';
import { updateStatus } from './uiHelpers.js';

function findGame() {
    const success = sendMessage({ type: 'findGame' });
    if (success) {
        updateStatus('Searching for game...');
    } else {
        updateStatus('Not connected to server');
    }
}

export { findGame };

