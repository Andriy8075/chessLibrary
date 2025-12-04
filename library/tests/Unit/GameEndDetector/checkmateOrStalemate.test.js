const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const boards = loadMockBoards('checkmateOrStalemateAfterMove');
    for (const board of boards) {
        const checkmateOrStalemate = GameEndDetector.checkForCheckmateOrStalemateAfterMove(board.cellTo, board.board);
        expect(checkmateOrStalemate).toBe(board.expectedResult);
    }
});