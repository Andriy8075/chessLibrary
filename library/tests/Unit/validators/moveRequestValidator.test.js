const validateMoveRequest = require('../../../src/validators/moveRequestValidator');

test('request must contain from and to cells', () => {
    const request = {
        from: { row: 1, col: 1 },
        invalidParameter: { row: 1, col: 7 },
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});

test('request must contain only from and to cells', () => {
    const request = {
        from: { row: 1, col: 1 },
        to: { row: 6, col: 2 },
        invalidParameter: { row: 1, col: 1 },
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});

test('from and to cells must be different', () => {
    const request = {
        from: { row: 5, col: 3 },
        to: { row: 5, col: 3 },
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});

test('cells must be valid', () => {
    const requests = [];
    const request = {
        from: { row: 1, col: 0 },
        to: { row: 6, col: 2 },
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});
