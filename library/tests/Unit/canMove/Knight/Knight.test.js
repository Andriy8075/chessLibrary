const mockBoard = require('../MockBoard');
const emptyBoardCases = require('./EmptyBoardCases');
const { cellsEqual } = require('../../../../src/utils/Cell');

const knightProvider = (cell) => {
    const board = new mockBoard([{type: 'knight', color: 'black', position: cell}]);
    return board.getPieceOnCell(cell);
}

test('returns true for valid moves', () => {
    const knightInCenter = knightProvider({ row: 4, col: 3 });
    result = knightInCenter.canMove({ row: 6, col: 4 });
    expect(result).toBe(true);
});

test('returns false for invalid moves', () => {
    const knightInCenter = knightProvider({ row: 4, col: 3 });
    result = knightInCenter.canMove({ row: 6, col: 5 });
    expect(result).toBe(false);
});

test('can not move to cells outside of the board', () => {
    const knightOnEdge = knightProvider({ row: 4, col: 8 });
    result = knightOnEdge.canMove({ row: 6, col: 9 });
    expect(result).toBe(false);
});

test('test positions with all valid moves', () => {
    for (const position of emptyBoardCases) {
        const knight = knightProvider(position.position);
        for (let i = 1; i <= 8; i++) {
            for (let j = 1; j <= 8; j++) {
                const cellTo = { row: i, col: j };
                result = knight.canMove(cellTo);
                let expected = false;
                for (const move of position.moves) {
                    if (cellsEqual(move, cellTo)) {
                        expected = true;
                        break;
                    }
                }
                if (result !== expected) {
                    console.log(`Knight at ${position.position} can move to ${cellTo} but should not`, {depth: 5});
                }
                expect(result).toBe(expected);
            }
        }
    }
});

test('can not move to cells occupied by pieces of the same color', () => {
    const board = new mockBoard([{type: 'knight', color: 'black', position: { row: 4, col: 3 }}, {type: 'knight', color: 'black', position: { row: 6, col: 4 }}]);
    const knight = board.getPieceOnCell({ row: 4, col: 3 });
    result = knight.canMove({ row: 6, col: 4 });
    expect(result).toBe(false);

    const knight2 = board.getPieceOnCell({ row: 6, col: 4 });
    result = knight2.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test('can move to cells occupied by pieces of the opposite color', () => {
    const board = new mockBoard([{type: 'knight', color: 'black', position: { row: 4, col: 3 }}, {type: 'knight', color: 'white', position: { row: 6, col: 4 }}]);
    const knight = board.getPieceOnCell({ row: 4, col: 3 });
    result = knight.canMove({ row: 6, col: 4 });
    expect(result).toBe(true);
});
