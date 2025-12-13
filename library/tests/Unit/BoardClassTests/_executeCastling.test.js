const MockBoard = require('../../helpers/../../src/board/Board');

describe('Board._executeCastling', () => {
    it('should execute kingside castling for white', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
            {type: 'Rook', color: 'white', position: { row: 1, col: 8 }},
        ]);
        const king = board.getPieceOnCell({ row: 1, col: 5 });
        const rook = board.getPieceOnCell({ row: 1, col: 8 });
        board._executeCastling({ row: 1, col: 5 }, { row: 1, col: 7 });
        expect(board.getPieceOnCell({ row: 1, col: 7 })).toBe(king);
        expect(board.getPieceOnCell({ row: 1, col: 8 })).toBeNull();
        expect(board.getPieceOnCell({ row: 1, col: 6 })).toBe(rook);
        expect(board.getPieceOnCell({ row: 1, col: 5 })).toBeNull();
    });

    it('should execute kingside castling for black', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
            {type: 'Rook', color: 'black', position: { row: 8, col: 8 }},
        ]);
        const king = board.getPieceOnCell({ row: 8, col: 5 });
        const rook = board.getPieceOnCell({ row: 8, col: 8 });
        board._executeCastling({ row: 8, col: 5 }, { row: 8, col: 7 });
        expect(board.getPieceOnCell({ row: 8, col: 7 })).toBe(king);
        expect(board.getPieceOnCell({ row: 8, col: 8 })).toBeNull();
        expect(board.getPieceOnCell({ row: 8, col: 6 })).toBe(rook);
        expect(board.getPieceOnCell({ row: 8, col: 5 })).toBeNull();
    });

    it('should execute queenside castling for white', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
            {type: 'Rook', color: 'white', position: { row: 1, col: 1 }},
        ]);
        const king = board.getPieceOnCell({ row: 1, col: 5 });
        const rook = board.getPieceOnCell({ row: 1, col: 1 });
        board._executeCastling({ row: 1, col: 5 }, { row: 1, col: 3 });
        expect(board.getPieceOnCell({ row: 1, col: 3 })).toBe(king);
        expect(board.getPieceOnCell({ row: 1, col: 1 })).toBeNull();
        expect(board.getPieceOnCell({ row: 1, col: 2 })).toBeNull();
        expect(board.getPieceOnCell({ row: 1, col: 4 })).toBe(rook);
        expect(board.getPieceOnCell({ row: 1, col: 5 })).toBeNull();
    });

    it('should execute queenside castling for black', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
            {type: 'Rook', color: 'black', position: { row: 8, col: 1 }},
        ]);
        const king = board.getPieceOnCell({ row: 8, col: 5 });
        const rook = board.getPieceOnCell({ row: 8, col: 1 });
        board._executeCastling({ row: 8, col: 5 }, { row: 8, col: 3 });
        expect(board.getPieceOnCell({ row: 8, col: 3 })).toBe(king);
        expect(board.getPieceOnCell({ row: 8, col: 1 })).toBeNull();
        expect(board.getPieceOnCell({ row: 8, col: 2 })).toBeNull();
        expect(board.getPieceOnCell({ row: 8, col: 4 })).toBe(rook);
        expect(board.getPieceOnCell({ row: 8, col: 5 })).toBeNull();
    });
});