const MockBoard = require('../../helpers/../../src/board/Board');

describe('Board._executeMove', () => {
    it('should move a piece from one cell to another', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        const pawn = board.getPieceOnCell({ row: 2, col: 4 });
        board._executeMove({ row: 2, col: 4 }, { row: 3, col: 4 });
        expect(board.getPieceOnCell({ row: 3, col: 4 })).toBe(pawn);
        expect(board.getPieceOnCell({ row: 2, col: 4 })).toBeNull();
        expect(pawn.cell).toStrictEqual({ row: 3, col: 4 });
    });

    it('should capture a piece if it is on the target cell', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
            {type: 'Pawn', color: 'black', position: { row: 3, col: 5 }},
        ]);
        const pawn = board.getPieceOnCell({ row: 2, col: 4 });
        board._executeMove({ row: 2, col: 4 }, { row: 3, col: 4 });
        expect(board.getPieceOnCell({ row: 3, col: 4 })).toBe(pawn);
        expect(board.getPieceOnCell({ row: 2, col: 5 })).toBeNull();
        expect(pawn.cell).toStrictEqual({ row: 3, col: 4 });
    });
});