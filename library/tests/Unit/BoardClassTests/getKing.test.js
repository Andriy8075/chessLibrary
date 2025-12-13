const MockBoard = require('../../../src/board/Board');

describe('Board.getKing', () => {
    it('should return the king of the given color', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
            {type: 'Bishop', color: 'black', position: { row: 7, col: 7 }},
            {type: 'Bishop', color: 'black', position: { row: 7, col: 2 }},
            {type: 'King', color: 'white', position: { row: 6, col: 4 }},
            {type: 'Queen', color: 'black', position: { row: 5, col: 5 }},
            {type: 'Queen', color: 'white', position: { row: 5, col: 4 }},
            {type: 'Pawn', color: 'white', position: { row: 2, col: 1 }},
            {type: 'Knight', color: 'white', position: { row: 7, col: 8 }},
        ]);
        const king1 = board.getKing('white');
        const king2 = board.getPieceOnCell({ row: 6, col: 4 })
        try {
            expect(king1).toBe(king2);
        } catch (error) {
            throw new Error(`getKing('white') should return the king at {row: 6, col: 4}. ${error.message}`);
        }
    });
});