import { sendMessage } from './websocket.js';
import { updateStatus } from './uiHelpers.js';

function hideResignButton() {
    const resignBtn = document.getElementById('resignBtn');
    if (resignBtn) {
        resignBtn.style.display = 'none';
    }
}

function hideDrawButtons() {
    const proposeDrawBtn = document.getElementById('proposeDrawBtn');
    const acceptDrawBtn = document.getElementById('acceptDrawBtn');
    if (proposeDrawBtn) {
        proposeDrawBtn.style.display = 'none';
    }
    if (acceptDrawBtn) {
        acceptDrawBtn.style.display = 'none';
    }
}

function findGame() {
    const success = sendMessage({ type: 'findGame' });
    if (success) {
        updateStatus('Searching for game...');
        hideResignButton();
        hideDrawButtons();
    } else {
        updateStatus('Not connected to server');
    }
}

export { findGame };

