const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');
const { assertBooleanWithMoveContext } = require('../../helpers/testAssertions');

test('board cases', () => {
    const testCases = loadMockBoards('checkmateOrStalemateAfterMove');
    for (const testCase of testCases) {
        const checkmateOrStalemate = GameEndDetector.checkForCheckmateOrStalemateAfterMove(testCase.cellTo, testCase.board);
        assertBooleanWithMoveContext(
            checkmateOrStalemate,
            testCase.expectedResult,
            testCase.cellFrom,
            testCase.cellTo,
            'After move'
        );
    }
});