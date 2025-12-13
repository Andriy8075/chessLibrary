const MockBoard = require('../../../src/board/Board');

describe('Board._updatePieceMovementTracking', () => {
    it('should update the piece movement tracking for white king', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
        ]);
        board._updatePieceMovementTracking({ row: 1, col: 5 });
        expect(board.hasPieceMoved('white', 'king')).toBe(true);
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'king')).toBe(false);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(false);
    });

    it('should update the piece movement tracking for white queenside rook', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'white', position: { row: 1, col: 1 }},
        ]);
        board._updatePieceMovementTracking({ row: 1, col: 1 });
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(true);
        expect(board.hasPieceMoved('white', 'king')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'king')).toBe(false);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(false);
    });

    it('should update the piece movement tracking for white kingside rook', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'white', position: { row: 1, col: 8 }},
        ]);
        board._updatePieceMovementTracking({ row: 1, col: 8 });
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('white', 'king')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(true);
        expect(board.hasPieceMoved('black', 'king')).toBe(false);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(false);
    });

    it('should update the piece movement tracking for black king', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
        ]);
        board._updatePieceMovementTracking({ row: 8, col: 5 });
        expect(board.hasPieceMoved('white', 'king')).toBe(false);
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'king')).toBe(true);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(false);
    });

    it('should update the piece movement tracking for black queenside rook', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 8, col: 1 }},
        ]);
        board._updatePieceMovementTracking({ row: 8, col: 1 });
        expect(board.hasPieceMoved('white', 'king')).toBe(false);
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'king')).toBe(false);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(true);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(false);
    });

    it('should update the piece movement tracking for black kingside rook', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 8, col: 8 }},
        ]);
        board._updatePieceMovementTracking({ row: 8, col: 8 });
        expect(board.hasPieceMoved('white', 'king')).toBe(false);
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'king')).toBe(false);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(true);
    });

    it('should not update the piece movement tracking if the cell is not on the first or eighth row', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        board._updatePieceMovementTracking({ row: 2, col: 4 });
        expect(board.hasPieceMoved('white', 'king')).toBe(false);
        expect(board.hasPieceMoved('white', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('white', 'kingsideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'king')).toBe(false);
        expect(board.hasPieceMoved('black', 'queensideRook')).toBe(false);
        expect(board.hasPieceMoved('black', 'kingsideRook')).toBe(false);
    });
});