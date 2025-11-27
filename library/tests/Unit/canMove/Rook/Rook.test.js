const loadMockBoards = require('../../../helpers/loadMockBoards');
const { cellsEqual } = require('../../../../src/utils/Cell');

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
                    console.log(`Bishop at ${board.mainPiecePosition} can move to ${cellTo} but should not`, {depth: 5});
                }
                expect(result).toBe(expected);

            }
        }
    }
});