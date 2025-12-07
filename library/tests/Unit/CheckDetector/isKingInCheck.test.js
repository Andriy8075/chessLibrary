const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isKingInCheck');
    for (const testCase of testCases) {
        const isInCheck = CheckDetector.isKingInCheck(testCase.color, testCase.board);
        expect(isInCheck).toBe(testCase.expectedResult);
    }
});