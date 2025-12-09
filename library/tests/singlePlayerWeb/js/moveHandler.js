import { updateStatus } from './uiHelpers.js';
import { setPendingPromotionMove, clearPendingPromotionMove } from './gameState.js';
import { handleGameResponse } from './ui.js';

const API_BASE_URL = 'http://localhost:3001';

async function sendMoveRequest(cellFrom, cellTo, promotion = null) {
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
        
        // Handle the response
        handleGameResponse(result);
        
        return result;
    } catch (error) {
        updateStatus(`Network error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

export { sendMoveRequest };

