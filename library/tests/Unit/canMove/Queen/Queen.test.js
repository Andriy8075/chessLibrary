const MockBoard = require('../../../../src/board/Board');

const queenProvider = (cell) => {
    const board = new MockBoard([{type: 'queen', color: 'black', position: cell}]);
    return board.getPieceOnCell(cell);
}

test('can move to cells outside of the board', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 4, col: 9 });
    try {
        expect(result).toBe(false);
    } catch (error) {
        throw new Error(`Queen should not be able to move to cells outside the board (row: 4, col: 9). Got ${result}, expected false. ${error.message}`);
    }
});

test('can not move to the same cell', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});


test('can not move like knight', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 5, col: 5 });
    expect(result).toBe(false);
});

test('can move to a cell in the same row', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 4, col: 4 });
    expect(result).toBe(true);
});

test('can move to a cell in the same column', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('can move like bishop', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 5, col: 4 });
    expect(result).toBe(true);
});

test*('can capture enemy pieces', () => {
    const board = new MockBoard([
        {type: 'queen', color: 'black', position: { row: 4, col: 3 }},
        {type: 'queen', color: 'white', position: { row: 5, col: 3 }},
    ]);
    const queen = board.getPieceOnCell({ row: 4, col: 3 });
    result = queen.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('can not capture own pieces', () => {
    const board = new MockBoard([
        {type: 'queen', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'black', position: { row: 5, col: 3 }},
    ]);
    const queen = board.getPieceOnCell({ row: 4, col: 3 });
    result = queen.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('can not jump over pieces', () => {
    const board = new MockBoard([
        {type: 'queen', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'white', position: { row: 5, col: 3 }},
    ]);
    const queen = board.getPieceOnCell({ row: 4, col: 3 });
    result = queen.canMove({ row: 6, col: 3 });
    expect(result).toBe(false);
});