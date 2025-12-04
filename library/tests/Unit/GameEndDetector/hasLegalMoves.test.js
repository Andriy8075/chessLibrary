const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const boards = loadMockBoards('hasLegalMoves');
    for (const board of boards) {
        const hasLegalMoves = GameEndDetector.hasLegalMoves(board.color, board.board);
        expect(hasLegalMoves).toBe(board.expectedResult);
    }
});