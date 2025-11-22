const Knight = require('../../../src/pieces/Knight.js');

knight = new Knight('black', {
    row: 4,
    col: 3
})

test('returns true for valid moves', () => {
    result = knight.canMoveToCellOnEmptyBoard({ row: 6, col: 4 });
    expect(result).toBe(true);
});