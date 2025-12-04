const loadMockBoards = require('../../helpers/loadMockBoards');

test('board cases', () => {
    const boards = loadMockBoards('tryToMove');
    for (const board of boards) {
        let result
        if (board.promotionPiece) {
            result = board.board.tryToMove(board.cellFrom, board.cellTo, board.promotionPiece);
            if (result) {
                const newPiece = board.board.getPieceOnCell(board.cellTo);
                expect(newPiece.constructor.name.toLowerCase()).toBe(board.promotionPiece.toLowerCase());
            }
        } else {
            result = board.board.tryToMove(board.cellFrom, board.cellTo);
        }
        expect(result).toBe(board.expectedResult);
    }
});