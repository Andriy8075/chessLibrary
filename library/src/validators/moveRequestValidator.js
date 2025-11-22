function validateMoveRequest(request) {
    if (!request.from || !request.to) {
        return {
            valid: false,
            error: 'Move request must include from and to cells'
        };
    }
    
    const cellFrom = request.from;
    const cellTo = request.to;

    if (!isValidCell(cellFrom) || !isValidCell(cellTo)) {
        return {
            valid: false,
            error: 'Invalid cell coordinates'
        };
    }

    if (Object.keys(request).length !== 2) {
        return {
            valid: false,
            error: 'Move request must include only from and to cells'
        };
    }

    return {
        valid: true,
        error: null
    };
}

module.exports = validateMoveRequest;