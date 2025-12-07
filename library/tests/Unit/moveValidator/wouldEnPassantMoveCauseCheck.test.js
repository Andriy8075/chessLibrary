const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');

test('board cases', () => {
    const testCases = loadMockBoards('wouldEnPassantMoveCauseCheck');
    for (const testCase of testCases) {
        const wouldMoveCauseCheck = MoveValidator.wouldEnPassantMoveCauseCheck(testCase.cellFrom, testCase.cellTo, testCase.board);
        expect(wouldMoveCauseCheck).toBe(testCase.expectedResult);
    }
});