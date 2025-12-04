const loadMockBoards = require('../../helpers/loadMockBoards');

test('board cases', () => {
    const boards = loadMockBoards('tryToMove');
    for (const board of boards) {
        const result = board.board.tryToMove(board.cellFrom, board.cellTo);
        expect(result).toBe(board.expectedResult);
    }
});