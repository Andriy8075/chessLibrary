const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('hasLegalMoves');
    for (const testCase of testCases) {
        const hasLegalMoves = GameEndDetector.hasLegalMoves(testCase.color, testCase.board);
        expect(hasLegalMoves).toBe(testCase.expectedResult);
    }
});