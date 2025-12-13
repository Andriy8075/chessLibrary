import { connectWebSocket } from './js/websocket.js';
import { findGame } from './js/ui.js';
import { sendResignRequest } from './js/moveHandler.js';

document.addEventListener('DOMContentLoaded', function() {
    const findGameBtn = document.getElementById('findGameBtn');
    if (findGameBtn) {
        findGameBtn.addEventListener('click', findGame);
    }
    
    const resignBtn = document.getElementById('resignBtn');
    if (resignBtn) {
        resignBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to resign?')) {
                sendResignRequest();
            }
        });
    }
});
connectWebSocket();