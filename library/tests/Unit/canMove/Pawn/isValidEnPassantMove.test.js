const Pawn = require('../../../../src/pieces/Pawn');
const MockBoard = require('../../../../src/board/Board');

test('returns true for only one valid move', () => {
    const board = new MockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 1 }},
        {type: 'pawn', color: 'black', position: { row: 4, col: 2 }},
    ], {
        enPassantTarget: { row: 3, col: 1 }
    });
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            const cell = { row: i, col: j };
            const cellFrom = { row: 4, col: 2 };
            result = Pawn.isValidEnPassantMove(cellFrom, cell, board);
            const expected = i === 3 && j === 1;
            try {
                expect(result).toBe(expected);
            } catch (error) {
                console.error('En passant validation details:', JSON.stringify({
                    cellFrom: cellFrom,
                    cellTo: cell,
                    expectedResult: expected,
                    actualResult: result,
                    enPassantTarget: board.extraInfo?.enPassantTarget || null
                }, null, 2));
                throw new Error(
                    `En passant move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cell)} should be ${expected}. ` +
                    `Got ${result}, expected ${expected}.`
                );
            }
        }
    }
})

test('can capture only if row is 3 or 6', () => {
    const board = new MockBoard([
        {type: 'pawn', color: 'white', position: { row: 5, col: 1 }},
        {type: 'pawn', color: 'black', position: { row: 5, col: 2 }},
    ], {
        enPassantTarget: { row: 3, col: 1 }
    });
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            const cell = { row: i, col: j };
            const cellFrom = { row: 5, col: 2 };
            result = Pawn.isValidEnPassantMove(cellFrom, cell, board);
            try {
                expect(result).toBe(false);
            } catch (error) {
                console.error('En passant validation details:', JSON.stringify({
                    cellFrom: cellFrom,
                    cellTo: cell,
                    expectedResult: false,
                    actualResult: result,
                    reason: 'pawn not on row 3 or 6',
                    enPassantTarget: board.extraInfo?.enPassantTarget || null
                }, null, 2));
                throw new Error(
                    `En passant move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cell)} should not be valid (pawn not on row 3 or 6). ` +
                    `Got ${result}, expected false.`
                );
            }
        }
    }
})

test('can not en passant if enPassantTarget is not set', () => {
    const board = new MockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 1 }},
        {type: 'pawn', color: 'black', position: { row: 4, col: 2 }},
    ]);
    const cellFrom = { row: 4, col: 2 };
    const cell = { row: 3, col: 1 };
    result = Pawn.isValidEnPassantMove(cellFrom, cell, board);
    try {
        expect(result).toBe(false);
    } catch (error) {
        console.error('En passant validation details:', JSON.stringify({
            cellFrom: cellFrom,
            cellTo: cell,
            expectedResult: false,
            actualResult: result,
            reason: 'enPassantTarget is not set',
            enPassantTarget: board.extraInfo?.enPassantTarget || null
        }, null, 2));
        throw new Error(
            `En passant move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cell)} should not be valid when enPassantTarget is not set. ` +
            `Got ${result}, expected false.`
        );
    }
})
