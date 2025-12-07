const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');

test('board cases', () => {
    const testCases = loadMockBoards('wouldMoveCauseCheck');
    for (const testCase of testCases) {
        const wouldMoveCauseCheck = MoveValidator.wouldMoveCauseCheck(testCase.cellFrom, testCase.cellTo, testCase.board);
        expect(wouldMoveCauseCheck).toBe(testCase.expectedResult);
    }
});