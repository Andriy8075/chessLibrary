const validateMoveRequest = require('../../../src/validators/moveRequestValidator');
const getInvalidCellsTestCases = require('./invalidCellsTestCases');
const getValidCellsTestCases = require('./validCellsTestCases');

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
    const InvalidCellsTestCases = getInvalidCellsTestCases();
    InvalidCellsTestCases.forEach(testCase => {
        const { valid, error } = validateMoveRequest(testCase);
        if (valid !== false) {
            console.log('Failed test case - expected false but got true:');
            console.log('From:', JSON.stringify(testCase.from, null, 2));
            console.log('To:', JSON.stringify(testCase.to, null, 2));
            console.log('Full test case:', JSON.stringify(testCase, null, 2));
            console.log('Error:', error);
        }
        expect(valid).toBe(false);
    });
});

test('returns true for valid cells', () => {
    const validCellsTestCases = getValidCellsTestCases();
    validCellsTestCases.forEach(testCase => {
        const { valid, error } = validateMoveRequest(testCase);
        if (valid !== true) {
            console.log('Failed test case - expected true but got false:');
            console.log('From:', JSON.stringify(testCase.from, null, 2));
            console.log('To:', JSON.stringify(testCase.to, null, 2));
            console.log('Full test case:', JSON.stringify(testCase, null, 2));
            console.log('Error:', error);
        }
        expect(valid).toBe(true);
    });
});
