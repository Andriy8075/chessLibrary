const MockBoard = require('../../helpers/MockBoard');

describe('Board._updateEnPassantTarget', () => {
    it('should update the en passant target for white pawn', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        const pawn = board.getPieceOnCell({ row: 2, col: 4 });
        board._updateEnPassantTarget(pawn, { row: 2, col: 4 }, { row: 4, col: 4 });
        expect(board.getEnPassantTarget()).toStrictEqual({ row: 3, col: 4 });
    });

    it('should update the en passant target for black pawn', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'black', position: { row: 7, col: 4 }},
        ]);
        const pawn = board.getPieceOnCell({ row: 7, col: 4 });
        board._updateEnPassantTarget(pawn, { row: 7, col: 4 }, { row: 5, col: 4 });
        expect(board.getEnPassantTarget()).toStrictEqual({ row: 6, col: 4 });
    });

    it('should not update the en passant target if the pawn does not move 2 squares', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        const pawn = board.getPieceOnCell({ row: 2, col: 4 });
        board._updateEnPassantTarget(pawn, { row: 2, col: 4 }, { row: 3, col: 4 });
        expect(board.getEnPassantTarget()).toBeNull();
    });

    it('should not update the en passant target if the pawn is not a pawn', () => {
        const board = new MockBoard([
            {type: 'Queen', color: 'white', position: { row: 2, col: 4 }},
        ]);
        const queen = board.getPieceOnCell({ row: 2, col: 4 });
        board._updateEnPassantTarget(queen, { row: 2, col: 4 }, { row: 4, col: 4 });
        expect(board.getEnPassantTarget()).toBeNull();
    });
});