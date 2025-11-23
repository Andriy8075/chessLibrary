import { connectWebSocket } from './js/websocket.js';
import { findGame } from './js/ui.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const findGameBtn = document.getElementById('findGameBtn');
    if (findGameBtn) {
        findGameBtn.addEventListener('click', findGame);
    }
});

connectWebSocket();
