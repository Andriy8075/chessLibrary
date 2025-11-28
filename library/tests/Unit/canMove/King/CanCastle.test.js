const MockBoard = require('../../../helpers/MockBoard');
const King = require('../../../../src/pieces/King');

test('white king can castle kingside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 4 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 1 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 4 });
    result = king.canCastle({ row: 1, col: 6 });
    expect(result).toBe(true);
})

