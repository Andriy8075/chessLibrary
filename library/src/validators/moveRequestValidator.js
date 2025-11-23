const { isValidCell } = require('../utils/Cell');
const { cellsEqual } = require('../utils/Cell');

function validateMoveRequest(request) {
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

    if (Object.keys(request).length !== 3) {
        return {
            valid: false,
            error: 'Move request must include only from and to cells and color'
        };
    }

    return {
        valid: true,
        error: null
    };
}

module.exports = validateMoveRequest;