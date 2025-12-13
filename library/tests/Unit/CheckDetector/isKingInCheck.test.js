const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isKingInCheck');
    for (const testCase of testCases) {
        const isInCheck = CheckDetector.isKingInCheck(testCase.color, testCase.board);
        try {
            expect(isInCheck).toBe(testCase.expectedResult);
        } catch (error) {
            throw new Error(`${testCase.color} king should ${testCase.expectedResult ? '' : 'not '}be in check. Got ${isInCheck}, expected ${testCase.expectedResult}. ${error.message}`);
        }
    }
});