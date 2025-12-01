const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const boards = loadMockBoards('isKingInCheck');
    for (const board of boards) {
        const isInCheck = CheckDetector.isKingInCheck(board.color, board.board);
        expect(isInCheck).toBe(board.expectedResult);
    }
});