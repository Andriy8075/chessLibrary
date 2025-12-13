import { connectWebSocket } from './js/websocket.js';
import { findGame } from './js/ui.js';
import { sendResignRequest, sendProposeDrawRequest, sendAcceptDrawRequest } from './js/moveHandler.js';

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
    
    const proposeDrawBtn = document.getElementById('proposeDrawBtn');
    if (proposeDrawBtn) {
        proposeDrawBtn.addEventListener('click', function() {
            if (confirm('Propose a draw to your opponent?')) {
                sendProposeDrawRequest();
            }
        });
    }
    
    const acceptDrawBtn = document.getElementById('acceptDrawBtn');
    if (acceptDrawBtn) {
        acceptDrawBtn.addEventListener('click', function() {
            if (confirm('Accept the draw proposal?')) {
                sendAcceptDrawRequest();
            }
        });
    }
});
connectWebSocket();