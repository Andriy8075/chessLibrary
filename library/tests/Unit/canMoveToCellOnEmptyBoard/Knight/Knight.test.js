const Knight = require('../../../../src/pieces/Knight');

knightInCenter = new Knight('black', {
    row: 4,
    col: 3
})

test('returns true for valid moves', () => {
    result = knightInCenter.canMoveToCellOnEmptyBoard({ row: 6, col: 4 });
    expect(result).toBe(true);
});

test('returns false for invalid moves', () => {
    result = knightInCenter.canMoveToCellOnEmptyBoard({ row: 6, col: 5 });
    expect(result).toBe(false);
});

knightOnEdge = new Knight('black', {
    row: 4,
    col: 8
})

test('can not move to cells outside of the board', () => {
    result = knightOnEdge.canMoveToCellOnEmptyBoard({ row: 6, col: 9 });
    expect(result).toBe(false);
});

