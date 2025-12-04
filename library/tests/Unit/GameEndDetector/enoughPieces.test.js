const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const boards = loadMockBoards('enoughPieces');
    for (const board of boards) {
        const enoughPieces = GameEndDetector.enoughPiecesAfterMoveToContinueGame(board.board);
        expect(enoughPieces).toBe(board.expectedResult);
    }
});