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
    result = king.canCastle({ row: 1, col: 2 });
    expect(result).toBe(true);
})

test('white king can castle queenside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 4 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteQueensideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 4 });
    result = king.canCastle({ row: 1, col: 6 });
    expect(result).toBe(true);
})

test('black king can castle kingside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'black', position: { row: 8, col: 4 }},
        {type: 'rook', color: 'black', position: { row: 8, col: 1 }},
    ], {
        piecesMadeMoves: {
            blackKing: false,
            blackKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 8, col: 4 });
    result = king.canCastle({ row: 8, col: 2 });
    expect(result).toBe(true);
})

test('black king can castle queenside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'black', position: { row: 8, col: 4 }},
        {type: 'rook', color: 'black', position: { row: 8, col: 8 }},
    ], {
        piecesMadeMoves: {
            blackKing: false,
            blackQueensideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 8, col: 4 });
    result = king.canCastle({ row: 8, col: 6 });
    expect(result).toBe(true);
})

test('can not castle if king has moved', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 4 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 1 }},
    ], {
        piecesMadeMoves: {
            whiteKing: true,
            whiteKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 4 });
    result = king.canCastle({ row: 1, col: 2 });
    expect(result).toBe(false);
})

test('can not castle if rook has moved', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 4 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 1 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: true,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 4 });
    result = king.canCastle({ row: 1, col: 2 });
    expect(result).toBe(false);
})
