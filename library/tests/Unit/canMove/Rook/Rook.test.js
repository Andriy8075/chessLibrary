const loadMockBoards = require('../../../helpers/loadMockBoards');
const MockBoard = require('../../../helpers/MockBoard');
const { cellsEqual } = require('../../../../src/utils/Cell');

const rookProvider = (cell) => {
    const board = new MockBoard([{type: 'rook', color: 'black', position: cell}]);
    return board.getPieceOnCell(cell);
}

test('can not move to cells outside of the board', () => {
    const rook = rookProvider({ row: 4, col: 3 });
    result = rook.canMove({ row: 4, col: 9 });
    expect(result).toBe(false);
});

test('can not move to the same cell', () => {
    const rook = rookProvider({ row: 4, col: 3 });
    result = rook.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test('can not jump over pieces', () => {
    const board = new MockBoard([
        {type: 'rook', color: 'black', position: { row: 4, col: 3 }},
        {type: 'pawn', color: 'white', position: { row: 5, col: 3 }},
    ]);
    const rook = board.getPieceOnCell({ row: 4, col: 3 });
    result = rook.canMove({ row: 6, col: 3 });
    expect(result).toBe(false);
});

test('can not move to a cell that is blocked by a piece of the same color', () => {
    const board = new MockBoard([
        {type: 'rook', color: 'black', position: { row: 4, col: 3 }},
        {type: 'rook', color: 'black', position: { row: 5, col: 3 }},
    ]);
    const rook = board.getPieceOnCell({ row: 4, col: 3 });
    result = rook.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('can kill enemy pieces', () => {
    const board = new MockBoard([
        {type: 'rook', color: 'black', position: { row: 4, col: 3 }},
        {type: 'rook', color: 'white', position: { row: 5, col: 3 }},
    ]);
    const rook = board.getPieceOnCell({ row: 4, col: 3 });
    result = rook.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('can not move to a cell that is not in the same row or column', () => {
    const rook = rookProvider({ row: 4, col: 3 });
    result = rook.canMove({ row: 5, col: 4 });
    expect(result).toBe(false);
});

test('can move to a cell in the same row', () => {
    const rook = rookProvider({ row: 4, col: 3 });
    result = rook.canMove({ row: 4, col: 4 });
    expect(result).toBe(true);
});

test('can move to a cell in the same column', () => {
    const rook = rookProvider({ row: 4, col: 3 });
    result = rook.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('mock board cases', () => {
    const boards = loadMockBoards('Unit/canMove/Rook/boards');
    for (const board of boards) {
        const rook = board.board.getPieceOnCell(board.mainPiecePosition);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cellTo = { row: i + 1, col: j + 1 };
                result = rook.canMove(cellTo);
                let expected = false;
                for (const move of board.moves) {
                    if (cellsEqual(move, cellTo)) {
                        expected = true;
                        break;
                    }
                }
                if (result !== expected) {
                    console.log(`Rook at ${board.mainPiecePosition} can move to ${cellTo} but should not`, {depth: 5});
                }
                expect(result).toBe(expected);

            }
        }
    }
});