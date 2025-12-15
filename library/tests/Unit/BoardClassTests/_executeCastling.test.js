const MockBoard = require('../../../src/board/Board');
const { assertCastlingMove } = require('../../helpers/testAssertions');

describe('Board._executeCastling', () => {
    it('should execute kingside castling for white', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
            {type: 'Rook', color: 'white', position: { row: 1, col: 8 }},
        ]);
        const kingFrom = { row: 1, col: 5 };
        const kingTo = { row: 1, col: 7 };
        const rookFrom = { row: 1, col: 8 };
        const rookTo = { row: 1, col: 6 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        assertCastlingMove(board, kingFrom, kingTo, rookFrom, rookTo, king, rook, 'kingside', 'white');
    });

    it('should execute kingside castling for black', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
            {type: 'Rook', color: 'black', position: { row: 8, col: 8 }},
        ]);
        const kingFrom = { row: 8, col: 5 };
        const kingTo = { row: 8, col: 7 };
        const rookFrom = { row: 8, col: 8 };
        const rookTo = { row: 8, col: 6 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        assertCastlingMove(board, kingFrom, kingTo, rookFrom, rookTo, king, rook, 'kingside', 'black');
    });

    it('should execute queenside castling for white', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
            {type: 'Rook', color: 'white', position: { row: 1, col: 1 }},
        ]);
        const kingFrom = { row: 1, col: 5 };
        const kingTo = { row: 1, col: 3 };
        const rookFrom = { row: 1, col: 1 };
        const rookTo = { row: 1, col: 4 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        assertCastlingMove(board, kingFrom, kingTo, rookFrom, rookTo, king, rook, 'queenside', 'white', [{ row: 1, col: 2 }]);
    });

    it('should execute queenside castling for black', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
            {type: 'Rook', color: 'black', position: { row: 8, col: 1 }},
        ]);
        const kingFrom = { row: 8, col: 5 };
        const kingTo = { row: 8, col: 3 };
        const rookFrom = { row: 8, col: 1 };
        const rookTo = { row: 8, col: 4 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        assertCastlingMove(board, kingFrom, kingTo, rookFrom, rookTo, king, rook, 'queenside', 'black', [{ row: 8, col: 2 }]);
    });
});