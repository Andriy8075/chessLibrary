const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('checkmateOrStalemateAfterMove');
    for (const testCase of testCases) {
        const checkmateOrStalemate = GameEndDetector.checkForCheckmateOrStalemateAfterMove(testCase.cellTo, testCase.board);
        try {
            expect(checkmateOrStalemate).toBe(testCase.expectedResult);
        } catch (error) {
            const moveInfo = testCase.cellFrom ? 
                `Move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)}` :
                `Move to ${JSON.stringify(testCase.cellTo)}`;
            console.error('Move details:', JSON.stringify({
                cellFrom: testCase.cellFrom || 'N/A',
                cellTo: testCase.cellTo,
                expectedResult: testCase.expectedResult,
                actualResult: checkmateOrStalemate
            }, null, 2));
            throw new Error(
                `After ${moveInfo}, expected ${testCase.expectedResult} but got ${checkmateOrStalemate}. ${error.message}`
            );
        }
    }
});