const mockBoard = require('../MockBoard');

const bishopProvider = (cell) => {
    const board = new mockBoard([{type: 'bishop', color: 'black', position: cell}]);
    return board.getPieceOnCell(cell);
}

test('returns true for valid moves', () => {
    const bishop = bishopProvider({ row: 4, col: 3 });
    result = bishop.canMove({ row: 6, col: 5 });
    expect(result).toBe(true);
});

test('returns false for invalid moves', () => {
    const bishop = bishopProvider({ row: 4, col: 3 });
    result = bishop.canMove({ row: 6, col: 6 });
    expect(result).toBe(false);
});

test('can not move to cells outside of the board', () => {
    const bishop = bishopProvider({ row: 4, col: 7 });
    result = bishop.canMove({ row: 6, col: 9 });
    expect(result).toBe(false);
});