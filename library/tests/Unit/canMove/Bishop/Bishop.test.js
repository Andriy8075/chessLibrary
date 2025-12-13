const MockBoard = require('../../../../src/board/Board');
const loadMockBoards = require('../../../helpers/loadMockBoards');
const { cellsEqual } = require('../../../../src/utils/Cell');

const bishopProvider = (cell) => {
    const board = new MockBoard([{type: 'bishop', color: 'black', position: cell}]);
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

test('can not move to the same cell', () => {
    const bishop = bishopProvider({ row: 4, col: 3 });
    result = bishop.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test('can capture enemy pieces', () => {
    const board = new MockBoard([
        {type: 'bishop', color: 'black', position: { row: 4, col: 3 }},
        {type: 'bishop', color: 'white', position: { row: 5, col: 4 }},
    ]);
    const bishop = board.getPieceOnCell({ row: 4, col: 3 });
    result = bishop.canMove({ row: 5, col: 4 });
    expect(result).toBe(true);
});

test('can not capture own pieces', () => {
    const board = new MockBoard([
        {type: 'bishop', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'black', position: { row: 5, col: 4 }},
    ]);
    const bishop = board.getPieceOnCell({ row: 4, col: 3 });
    result = bishop.canMove({ row: 5, col: 4 });
    expect(result).toBe(false);
});

test('can not jump over pieces', () => {
    const board = new MockBoard([
        {type: 'bishop', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'white', position: { row: 5, col: 4 }},
    ]);
    const bishop = board.getPieceOnCell({ row: 4, col: 3 });
    result = bishop.canMove({ row: 6, col: 5 });
    expect(result).toBe(false);
});
