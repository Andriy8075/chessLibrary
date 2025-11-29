const MockBoard = require('../../helpers/MockBoard');

describe('Board._executeEnPassant', () => {
    it('should execute en passant for white', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 5, col: 4 }},
            {type: 'Pawn', color: 'black', position: { row: 5, col: 5 }},
        ],
        { enPassantTarget: { row: 6, col: 5 } }
    );
        const whitePawn = board.getPieceOnCell({ row: 5, col: 4 });
        const blackPawn = board.getPieceOnCell({ row: 5, col: 5 });
        board._executeEnPassant({ row: 5, col: 4 }, { row: 6, col: 5 });
        expect(board.getPieceOnCell({ row: 6, col: 5 })).toBe(whitePawn);
        expect(board.getPieceOnCell({ row: 5, col: 4 })).toBeNull();
        expect(board.getPieceOnCell({ row: 5, col: 5 })).toBeNull();
    });

    it('should execute en passant for black', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'black', position: { row: 4, col: 4 }},
            {type: 'Pawn', color: 'white', position: { row: 4, col: 5 }},
        ],
        { enPassantTarget: { row: 3, col: 5 } }
    );
        const blackPawn = board.getPieceOnCell({ row: 4, col: 4 });
        const whitePawn = board.getPieceOnCell({ row: 4, col: 5 });
        board._executeEnPassant({ row: 4, col: 4 }, { row: 3, col: 5 });
        expect(board.getPieceOnCell({ row: 3, col: 5 })).toBe(blackPawn);
        expect(board.getPieceOnCell({ row: 4, col: 4 })).toBeNull();
        expect(board.getPieceOnCell({ row: 4, col: 5 })).toBeNull();
    });
});