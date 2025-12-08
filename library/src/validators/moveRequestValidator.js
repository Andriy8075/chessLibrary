const { isValidCell } = require('../utils/Cell');
const { cellsEqual } = require('../utils/Cell');

function validateMoveRequest(request) {

    const allowedKeys = ['type', 'from', 'to', 'color', 'promotion'];
    const requestKeys = Object.keys(request);
    if (requestKeys.length < 4 || requestKeys.length > 5 || !requestKeys.every(key => allowedKeys.includes(key))) {
        return {
            valid: false,
            error: 'Move request must include only type, from and to cells, color, and promotion'
        };
    }
    
    if (!request.from || !request.to || !request.color) {
        return {
            valid: false,
            error: 'Move request must include from and to cells and color'
        };
    }
    
    const cellFrom = request.from;
    const cellTo = request.to;
    const color = request.color;

    if (color !== 'white' && color !== 'black') {
        return {
            valid: false,
            error: 'Invalid color'
        };
    }

    if (!isValidCell(cellFrom) || !isValidCell(cellTo)) {
        return {
            valid: false,
            error: 'Invalid cell coordinates'
        };
    }

    if (cellsEqual(cellFrom, cellTo)) {
        return {
            valid: false,
            error: 'From and to cells are the same'
        };
    }

    const allowedPromotions = ['queen', 'rook', 'bishop', 'knight'];

    if (request.promotion) {
        let isValidPromotion = false;
        for (const promotion of allowedPromotions) {
            if (request.promotion.toLowerCase() === promotion) {
                isValidPromotion = true;
                break;
            }
        }
        if (!isValidPromotion) {
            return {
                valid: false,
                error: 'Invalid promotion'
            };
        }
    }

    return {
        valid: true,
        error: null
    };
}

module.exports = validateMoveRequest;