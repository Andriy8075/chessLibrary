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

test('can not castle if there is a piece between king and rook', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 4 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
        {type: 'knight', color: 'white', position: { row: 1, col: 7 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 4 });
    result = king.canCastle({ row: 1, col: 6 });
    expect(result).toBe(false);
})

test('can castle only if king is moving to specific cell', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 4 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 1 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: false,
            whiteQueensideRook: true,
            blackKing: true,
            blackKingsideRook: true,
            blackQueensideRook: true,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 4 });
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            const cell = { row: i, col: j };
            result = king.canCastle(cell);
            if (result !== (i === 1 && j === 2)) {
                console.log(`result: ${result}, expected: ${i === 1 && j === 2}`);
                console.log(`cell: ${cell.row}, ${cell.col}`);
            }
            expect(result).toBe(i === 1 && j === 2);
        }
    }
})
