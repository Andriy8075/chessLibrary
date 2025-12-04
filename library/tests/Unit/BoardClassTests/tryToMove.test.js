const loadMockBoards = require('../../helpers/loadMockBoards');

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
            const movedPiece = board.board.getPieceOnCell(board.cellTo);
            if(movedPiece.constructor.name.toLowerCase() === 'pawn'){
                if (Math.abs(board.cellTo.row - board.cellFrom.row) === 2) {
                    const realEnPassantTarget = board.board.getEnPassantTarget();
                    const expectedEnPassantTarget = {
                        row: board.cellTo.row + (board.cellFrom.color === 'white' ? 1 : -1),
                         col: board.cellTo.col
                    };
                    expect(realEnPassantTarget).toEqual(expectedEnPassantTarget);
                }

                if(board.cellTo.row === (board.cellFrom.color === 'white' ? 8 : 1)){
                    expect(movedPiece.constructor.name.toLowerCase()).toBe(board.promotionPiece.toLowerCase());
                }
            }
        }
    }
});