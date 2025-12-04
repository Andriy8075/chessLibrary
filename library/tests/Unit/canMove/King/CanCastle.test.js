const MockBoard = require('../../../helpers/MockBoard');
const King = require('../../../../src/pieces/King');

test('white king can castle kingside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 5 });
    const canCastle = king.canCastle({ row: 1, col: 7 });
    expect(canCastle).toBe(true);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 1, col: 5 }, { row: 1, col: 7 }, board);
    expect(isValidCastlingMove).toBe(true);
})

test('white king can castle queenside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 1 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteQueensideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 5 });
    const canCastle = king.canCastle({ row: 1, col: 3 });
    expect(canCastle).toBe(true);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 1, col: 5 }, { row: 1, col: 3 }, board);
    expect(isValidCastlingMove).toBe(true);
})

test('black king can castle kingside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'black', position: { row: 8, col: 5 }},
        {type: 'rook', color: 'black', position: { row: 8, col: 8 }},
    ], {
        piecesMadeMoves: {
            blackKing: false,
            blackKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 8, col: 5 });
    const canCastle = king.canCastle({ row: 8, col: 7 });
    expect(canCastle).toBe(true);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 8, col: 5 }, { row: 8, col: 7 }, board);
    expect(isValidCastlingMove).toBe(true);
})

test('black king can castle queenside', () => {
    const board = new MockBoard([
        {type: 'king', color: 'black', position: { row: 8, col: 5 }},
        {type: 'rook', color: 'black', position: { row: 8, col: 1 }},
    ], {
        piecesMadeMoves: {
            blackKing: false,
            blackQueensideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 8, col: 5 });
    const canCastle = king.canCastle({ row: 8, col: 3 });
    expect(canCastle).toBe(true);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 8, col: 5 }, { row: 8, col: 3 }, board);
    expect(isValidCastlingMove).toBe(true);
})

test('can not castle if king has moved', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
    ], {
        piecesMadeMoves: {
            whiteKing: true,
            whiteKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 5 });
    const canCastle = king.canCastle({ row: 1, col: 7 });
    expect(canCastle).toBe(false);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 1, col: 5 }, { row: 1, col: 7 }, board);
    expect(isValidCastlingMove).toBe(false);
})

test('can not castle if rook has moved', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: true,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 5 });
    const canCastle = king.canCastle({ row: 1, col: 7 });
    expect(canCastle).toBe(false);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 1, col: 5 }, { row: 1, col: 7 }, board);
    expect(isValidCastlingMove).toBe(false);
})

test('can not castle if there is a piece between king and rook', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
        {type: 'knight', color: 'white', position: { row: 1, col: 6 }},
    ], {
        piecesMadeMoves: {
            whiteKing: false,
            whiteKingsideRook: false,
        }
    });
    const king = board.getPieceOnCell({ row: 1, col: 5 });
    const canCastle = king.canCastle({ row: 1, col: 7 });
    expect(canCastle).toBe(false);

    const isValidCastlingMove = King.isValidCastlingMove({ row: 1, col: 5 }, { row: 1, col: 7 }, board);
    expect(isValidCastlingMove).toBe(false);
})

test('can castle only if king is moving to specific cell', () => {
    const board = new MockBoard([
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
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
    const king = board.getPieceOnCell({ row: 1, col: 5 });
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            const cell = { row: i, col: j };
            const canCastle = king.canCastle(cell);
            if (canCastle !== (i === 1 && j === 7)) {
                console.log(`canCastle: ${canCastle}, expected: ${i === 1 && j === 7}`);
                console.log(`cell: ${cell.row}, ${cell.col}`);
            }
            expect(canCastle).toBe(i === 1 && j === 7);

            const isValidCastlingMove = King.isValidCastlingMove({ row: 1, col: 5 }, cell, board);
            if (isValidCastlingMove !== (i === 1 && j === 7)) {
                console.log(`isValidCastlingMove: ${isValidCastlingMove}, expected: ${i === 1 && j === 7}`);
                console.log(`cell: ${cell.row}, ${cell.col}`);
            }
            expect(isValidCastlingMove).toBe(i === 1 && j === 7);
        }
    }
})
