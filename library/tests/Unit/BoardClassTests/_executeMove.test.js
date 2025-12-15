const MockBoard = require('../../../src/board/Board');
const { assertBasicMove, assertCaptureMove } = require('../../helpers/testAssertions');

describe('Board._executeMove', () => {
    it('should move a piece from one cell to another', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        const cellFrom = { row: 2, col: 4 };
        const cellTo = { row: 3, col: 4 };
        const pawn = board.getPieceOnCell(cellFrom);
        board._executeMove(cellFrom, cellTo);
        assertBasicMove(board, cellFrom, cellTo, pawn);
    });

    it('should capture a piece if it is on the target cell', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
            {type: 'Pawn', color: 'black', position: { row: 3, col: 5 }},
        ]);
        const cellFrom = { row: 2, col: 4 };
        const cellTo = { row: 3, col: 4 };
        const capturedCell = { row: 2, col: 5 };
        const pawn = board.getPieceOnCell(cellFrom);
        board._executeMove(cellFrom, cellTo);
        assertCaptureMove(board, cellFrom, cellTo, capturedCell, pawn);
    });
});