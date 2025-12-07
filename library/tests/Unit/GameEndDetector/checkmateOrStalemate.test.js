const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('checkmateOrStalemateAfterMove');
    for (const testCase of testCases) {
        const checkmateOrStalemate = GameEndDetector.checkForCheckmateOrStalemateAfterMove(testCase.cellTo, testCase.board);
        expect(checkmateOrStalemate).toBe(testCase.expectedResult);
    }
});