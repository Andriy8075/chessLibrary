const Knight = require('../../../../src/pieces/Knight');
const getEmptyBoard = require('../getEmptyBoard');

test('returns true for valid moves', () => {
    const board = getEmptyBoard();
    const knightInCenter = new Knight('black', { row: 4, col: 3 }, board);
    result = knightInCenter.canMove({ row: 6, col: 4 });
    expect(result).toBe(true);
});

test('returns false for invalid moves', () => {
    const board = getEmptyBoard();
    const knightInCenter = new Knight('black', { row: 4, col: 3 }, board);
    result = knightInCenter.canMove({ row: 6, col: 5 });
    expect(result).toBe(false);
});

test('can not move to cells outside of the board', () => {
    const board = getEmptyBoard();
    const knightOnEdge = new Knight('black', { row: 4, col: 8 }, board);
    result = knightOnEdge.canMove({ row: 6, col: 9 });
    expect(result).toBe(false);
});

