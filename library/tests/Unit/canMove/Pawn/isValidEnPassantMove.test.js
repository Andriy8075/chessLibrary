const Pawn = require('../../../../src/pieces/Pawn');
const MockBoard = require('../../../helpers/MockBoard');

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
            result = Pawn.isValidEnPassantMove({ row: 4, col: 2 }, cell, board);
            expect(result).toBe(i === 3 && j === 1);
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
            result = Pawn.isValidEnPassantMove({ row: 5, col: 2 }, cell, board);
            if (result !== false) {
                console.log(`result: ${result}, expected: false`);
                console.log(`cell: ${cell.row}, ${cell.col}`);
            }
            expect(result).toBe(false);
        }
    }
})

// test('can capture only if column is the same as the en passant target', () => {
//     const board = new MockBoard([
//         {type: 'pawn', color: 'white', position: { row: 5, col: 1 }},
//         {type: 'pawn', color: 'black', position: { row: 5, col: 2 }},
//     ], {
//         enPassantTarget: { row: 4, col: 1 }
//     });
//     for (let i = 1; i <= 8; i++) {
//         for (let j = 1; j <= 8; j++) {
//             const cell = { row: i, col: j };
//             result = Pawn.isValidEnPassantMove({ row: 5, col: 2 }, cell, board);
//             expect(result).toBe(j === 1);
//         }
//     }
// })