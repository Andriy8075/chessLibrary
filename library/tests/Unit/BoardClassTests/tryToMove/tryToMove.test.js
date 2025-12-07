const loadMockBoards = require('../../../helpers/loadMockBoards');
const ensureCorrectPromotion = require('./ensureCorrectPromotion');
const ensurePassantUpdatedCorrectly = require('./ensurePassantUpdatedCorrectly');

test('board cases', () => {
    const testCases = loadMockBoards('tryToMove');
    for (const testCase of testCases) {
        let result
        if (testCase.promotionPiece) {
            result = testCase.board.tryToMove(testCase.cellFrom, testCase.cellTo, testCase.promotionPiece);
        } else {
            result = testCase.board.tryToMove(testCase.cellFrom, testCase.cellTo);
        }

        expect(result).toBe(testCase.expectedResult);

        if (result) {
            ensurePassantUpdatedCorrectly(testCase);
            ensureCorrectPromotion(testCase);
        }
    }
});