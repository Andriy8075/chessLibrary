const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('hasLegalMoves');
    for (const testCase of testCases) {
        const hasLegalMoves = GameEndDetector.hasLegalMoves(testCase.color, testCase.board);
        try {
            expect(hasLegalMoves).toBe(testCase.expectedResult);
        } catch (error) {
            throw new Error(`${testCase.color} should ${testCase.expectedResult ? '' : 'not '}have legal moves. Got ${hasLegalMoves}, expected ${testCase.expectedResult}. ${error.message}`);
        }
    }
});