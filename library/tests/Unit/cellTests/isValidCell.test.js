const { isValidCell } = require('../../../src/utils/Cell');
const validCells = require('./validCells');
const invalidCells = require('./invalidCells');

test('returns true for valid cells', () => {
    validCells.forEach(cell => {
        const result = isValidCell(cell);
        if (result !== true) {
            console.log('Failed test case - expected true but got false:');
            console.log('Cell:', JSON.stringify(cell, null, 2));
        }
        expect(result).toBe(true);
    });
});

test('returns false for invalid cells', () => {
    invalidCells.forEach(cell => {
        const result = isValidCell(cell);
        if (result !== false) {
            console.log('Failed test case - expected false but got true:');
            console.log('Cell:', JSON.stringify(cell, null, 2));
        }
        expect(result).toBe(false);
    });
});