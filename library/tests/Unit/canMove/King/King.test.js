const MockBoard = require('../../../../src/board/Board');

const kingProvider = (cell) => {
    const board = new MockBoard([{type: 'king', color: 'black', position: cell}]);
    return board.getPieceOnCell(cell);
}

test('can not move to cells outside of the board', () => {
    const king = kingProvider({ row: 4, col: 8 });
    result = king.canMove({ row: 4, col: 9 });
    expect(result).toBe(false);
});

test('can not move to the same cell', () => {
    const king = kingProvider({ row: 4, col: 3 });
    result = king.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test('can move to a cell 1 square away in the same row', () => {
    const king = kingProvider({ row: 4, col: 3 });
    result = king.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('can move to a cell 1 square away in the same column', () => {
    const king = kingProvider({ row: 4, col: 3 });
    result = king.canMove({ row: 4, col: 4 });
    expect(result).toBe(true);
});

test('can move to a cell 1 square away in the diagonal', () => {
    const king = kingProvider({ row: 4, col: 3 });
    result = king.canMove({ row: 5, col: 4 });
    expect(result).toBe(true);
});

test('can not move more than 1 square in any direction', () => {
    const king = kingProvider({ row: 4, col: 3 });
    result = king.canMove({ row: 6, col: 3 });
    expect(result).toBe(false);
});

test('can not move to a cell occupied by a piece of the same color', () => {
    const board = new MockBoard([
        {type: 'king', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'black', position: { row: 5, col: 3 }},
    ]);
    const king = board.getPieceOnCell({ row: 4, col: 3 });
    result = king.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('can capture a piece of the opposite color', () => {
    const board = new MockBoard([
        {type: 'king', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'white', position: { row: 5, col: 3 }},
    ]);
    const king = board.getPieceOnCell({ row: 4, col: 3 });
    result = king.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

