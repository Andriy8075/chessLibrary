import { updateStatus } from './uiHelpers.js';
import { setPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';
import { handleGameResponse } from './ui.js';

const API_BASE_URL = 'http://localhost:3001';

async function sendMoveRequest(cellFrom, cellTo, promotion = null) {
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
    
    try {
        updateStatus('Sending move...');
        const response = await fetch(`${API_BASE_URL}/api/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameRequest)
        });
        
        const result = await response.json();
        
        handleGameResponse(result);
        
        return result;
    } catch (error) {
        updateStatus(`Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function sendResignRequest(color) {
    const gameRequest = {
        type: 'resign',
        color: color
    };
    
    try {
        updateStatus(`Sending resign request for ${color}...`);
        const response = await fetch(`${API_BASE_URL}/api/resign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameRequest)
        });
        
        const result = await response.json();
        handleGameResponse(result);
        return result;
    } catch (error) {
        updateStatus(`Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function sendProposeDrawRequest(color) {
    const gameRequest = {
        type: 'proposeDraw',
        color: color
    };
    
    try {
        updateStatus(`Sending draw proposal for ${color}...`);
        const response = await fetch(`${API_BASE_URL}/api/propose-draw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameRequest)
        });
        
        const result = await response.json();
        handleGameResponse(result);
        return result;
    } catch (error) {
        updateStatus(`Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function sendAcceptDrawRequest(color) {
    const gameRequest = {
        type: 'acceptDraw',
        color: color
    };
    
    try {
        updateStatus(`Accepting draw proposal for ${color}...`);
        const response = await fetch(`${API_BASE_URL}/api/accept-draw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameRequest)
        });
        
        const result = await response.json();
        handleGameResponse(result);
        return result;
    } catch (error) {
        updateStatus(`Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

export { sendMoveRequest, sendResignRequest, sendProposeDrawRequest, sendAcceptDrawRequest };

