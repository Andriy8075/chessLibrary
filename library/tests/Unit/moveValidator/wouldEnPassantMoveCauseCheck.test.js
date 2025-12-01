const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');

test('board cases', () => {
    const boards = loadMockBoards('wouldEnPassantMoveCauseCheck');
    for (const board of boards) {
        const wouldMoveCauseCheck = MoveValidator.wouldEnPassantMoveCauseCheck(board.cellFrom, board.cellTo, board.board);
        expect(wouldMoveCauseCheck).toBe(board.expectedResult);
    }
});