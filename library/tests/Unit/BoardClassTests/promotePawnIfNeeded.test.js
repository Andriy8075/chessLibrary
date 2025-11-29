const MockBoard = require('../../helpers/MockBoard');
const Rook = require('../../../src/pieces/Rook');
const Knight = require('../../../src/pieces/Knight');
const Pawn = require('../../../src/pieces/Pawn');

describe('Board.promotePawnIfNeeded', () => {
    it('should promote white pawn to the given piece', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 8, col: 4 }},
        ]);
        board.promotePawnIfNeeded({ row: 8, col: 4 }, 'Rook');
        expect(board.getPieceOnCell({ row: 8, col: 4 })).toBeInstanceOf(Rook);
    });

    it('should promote black pawn to the given piece', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'black', position: { row: 1, col: 4 }},
        ]);
        board.promotePawnIfNeeded({ row: 1, col: 4 }, 'Knight');
        expect(board.getPieceOnCell({ row: 1, col: 4 })).toBeInstanceOf(Knight);
    });

    it('should not promote white pawn on the wrong row', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        board.promotePawnIfNeeded({ row: 2, col: 4 }, 'Rook');
        expect(board.getPieceOnCell({ row: 2, col: 4 })).toBeInstanceOf(Pawn);
    });

    it('should not promote black pawn on the wrong row', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'black', position: { row: 2, col: 4 }},
        ]);
        board.promotePawnIfNeeded({ row: 2, col: 4 }, 'Rook');
        expect(board.getPieceOnCell({ row: 2, col: 4 })).toBeInstanceOf(Pawn);
    });
});