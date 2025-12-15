const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');
const { assertBooleanWithMoveContext } = require('../../helpers/testAssertions');

test('board cases', () => {
    const testCases = loadMockBoards('wouldMoveCauseCheck');
    for (const testCase of testCases) {
        const wouldMoveCauseCheck = MoveValidator.wouldMoveCauseCheck(testCase.cellFrom, testCase.cellTo, testCase.board);
        assertBooleanWithMoveContext(
            wouldMoveCauseCheck,
            testCase.expectedResult,
            testCase.cellFrom,
            testCase.cellTo,
            'Move',
            { action: 'cause check' }
        );
    }
});