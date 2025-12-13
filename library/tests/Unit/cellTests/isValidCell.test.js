const { isValidCell } = require('../../../src/utils/Cell');
const validCells = require('./validCells');
const invalidCells = require('./invalidCells');

test('returns true for valid cells', () => {
    validCells.forEach(cell => {
        const result = isValidCell(cell);
        try {
            expect(result).toBe(true);
        } catch (error) {
            const message = `Cell ${JSON.stringify(cell)} should be valid. Got ${result}, expected true.`;
            console.log(message);
            throw new Error(message);
        }
    });
});

test('returns false for invalid cells', () => {
    invalidCells.forEach(cell => {
        const result = isValidCell(cell);
        try {
            expect(result).toBe(false);
        } catch (error) {
            const message = `Cell ${JSON.stringify(cell)} should be invalid. Got ${result}, expected false.`;
            console.log(message);
            throw new Error(message);
        }
    });
});