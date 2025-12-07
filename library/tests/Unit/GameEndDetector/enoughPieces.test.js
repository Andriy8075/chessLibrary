const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('enoughPieces');
    for (const testCase of testCases) {
        const enoughPieces = GameEndDetector.enoughPiecesAfterMoveToContinueGame(testCase.board);
        expect(enoughPieces).toBe(testCase.expectedResult);
    }
});