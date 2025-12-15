const MockBoard = require('../../../src/board/Board');
const { assertEnPassantMove } = require('../../helpers/testAssertions');

describe('Board._executeEnPassant', () => {
    it('should execute en passant for white', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 5, col: 4 }},
            {type: 'Pawn', color: 'black', position: { row: 5, col: 5 }},
        ],
        { enPassantTarget: { row: 6, col: 5 } }
    );
        const cellFrom = { row: 5, col: 4 };
        const cellTo = { row: 6, col: 5 };
        const capturedCell = { row: 5, col: 5 };
        const whitePawn = board.getPieceOnCell(cellFrom);
        board._executeEnPassant(cellFrom, cellTo);
        assertEnPassantMove(board, cellFrom, cellTo, capturedCell, whitePawn, 'white');
    });

    it('should execute en passant for black', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'black', position: { row: 4, col: 4 }},
            {type: 'Pawn', color: 'white', position: { row: 4, col: 5 }},
        ],
        { enPassantTarget: { row: 3, col: 5 } }
    );
        const cellFrom = { row: 4, col: 4 };
        const cellTo = { row: 3, col: 5 };
        const capturedCell = { row: 4, col: 5 };
        const blackPawn = board.getPieceOnCell(cellFrom);
        board._executeEnPassant(cellFrom, cellTo);
        assertEnPassantMove(board, cellFrom, cellTo, capturedCell, blackPawn, 'black');
    });
});