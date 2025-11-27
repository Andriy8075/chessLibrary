const mockBoard = require('../../../helpers/MockBoard');
const loadMockBoards = require('../../../helpers/loadMockBoards');
const { cellsEqual } = require('../../../../src/utils/Cell');

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

test('mock board cases', () => {
    const boards = loadMockBoards('Unit/canMove/Bishop/boards');
    for (const board of boards) {
        const bishop = board.board.getPieceOnCell(board.mainPiecePosition);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const cellTo = { row: i + 1, col: j + 1 };
                result = bishop.canMove(cellTo);
                let expected = false;
                for (const move of board.moves) {
                    if (cellsEqual(move, cellTo)) {
                        expected = true;
                        break;
                    }
                }
                if (result !== expected) {
                    console.log(`Bishop at ${board.mainPiecePosition} can move to ${cellTo} but should not`, {depth: 5});
                }
                expect(result).toBe(expected);

            }
        }
    }
});
