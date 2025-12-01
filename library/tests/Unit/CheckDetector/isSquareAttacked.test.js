const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const boards = loadMockBoards('isSquareAttacked');
    for (const board of boards) {
        const isAttacked = CheckDetector.isSquareAttacked(board.targetSquare, board.attackingColor, board.board);
        expect(isAttacked).toBe(board.expectedResult);
    }
});