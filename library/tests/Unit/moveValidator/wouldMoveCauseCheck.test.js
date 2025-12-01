const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');

test('board cases', () => {
    const boards = loadMockBoards('wouldMoveCauseCheck');
    for (const board of boards) {
        const wouldMoveCauseCheck = MoveValidator.wouldMoveCauseCheck(board.cellFrom, board.cellTo, board.board);
        expect(wouldMoveCauseCheck).toBe(board.expectedResult);
    }
});