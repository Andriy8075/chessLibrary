const validateMoveRequest = require('../../../src/validators/moveRequestValidator');
const getInvalidCellsTestCases = require('./invalidCellsTestCases');
const getValidCellsTestCases = require('./validCellsTestCases');

test('valid request is valid', () => {
    const request = {
        from: { row: 1, col: 1 },
        to: { row: 2, col: 2 },
        color: 'white',
        type: 'move',
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(true);
});

test('request must contain from and to cells', () => {
    const request = {
        from: { row: 1, col: 1 },
        invalidParameter: { row: 1, col: 7 },
        color: 'white',
        type: 'move',
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});

test('request must contain only from and to cells', () => {
    const request = {
        from: { row: 1, col: 1 },
        to: { row: 6, col: 2 },
        invalidParameter: { row: 1, col: 1 },
        color: 'white',
        type: 'move',
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});

test('from and to cells must be different', () => {
    const request = {
        from: { row: 5, col: 3 },
        to: { row: 5, col: 3 },
        color: 'white',
        type: 'move',
    }
    const { valid, error } = validateMoveRequest(request);
    expect(valid).toBe(false);
});

function launchTests(testCases, expected) {
    testCases.forEach(testCase => {
        const { valid, error } = validateMoveRequest(testCase);
        try {
            expect(valid).toBe(expected);
        } catch (e) {
            logTestCaseIfFailed(testCase, valid, error, expected);
            throw new Error(`Move request from ${JSON.stringify(testCase.from)} to ${JSON.stringify(testCase.to)} should be ${expected ? 'valid' : 'invalid'}. Got ${valid}, expected ${expected}. Error: ${error || 'none'}. ${e.message}`);
        }
    });
}

test('cells must be valid', () => {
    launchTests(getInvalidCellsTestCases(), false);
});

test('returns true for valid cells', () => {
    launchTests(getValidCellsTestCases(), true);
});

function logTestCaseIfFailed(testCase, valid, error, expected) {
    if (valid !== expected) {
        console.log('Failed test case - expected ' + expected + ' but got ' + valid + ':');
        console.log('From:', JSON.stringify(testCase.from, null, 2));
        console.log('To:', JSON.stringify(testCase.to, null, 2));
        console.log('Full test case:', JSON.stringify(testCase, null, 2));
        console.log('Error:', error);
    }
}