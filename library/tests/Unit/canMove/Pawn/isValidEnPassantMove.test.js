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
