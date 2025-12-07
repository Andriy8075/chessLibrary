const loadMockBoards = require('../../../helpers/loadMockBoards');
const ensureCorrectPromotion = require('./ensureCorrectPromotion');
const ensurePassantUpdatedCorrectly = require('./ensurePassantUpdatedCorrectly');

test('board cases', () => {
    const boards = loadMockBoards('tryToMove');
    for (const board of boards) {
        let result
        if (board.promotionPiece) {
            result = board.board.tryToMove(board.cellFrom, board.cellTo, board.promotionPiece);
        } else {
            result = board.board.tryToMove(board.cellFrom, board.cellTo);
        }

        expect(result).toBe(board.expectedResult);

        if (result) {
            ensurePassantUpdatedCorrectly(board);
            ensureCorrectPromotion(board);
        }
    }
});