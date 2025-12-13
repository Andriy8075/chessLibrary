const MockBoard = require('../../helpers/../../src/board/Board');

describe('Board.isPathClear', () => {
    it('should return true if the path is clear. The same row', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 4, col: 3 }},
            {type: 'pawn', color: 'white', position: { row: 4, col: 7 }},
        ]);
        expect(board.isPathClear({ row: 4, col: 3 }, { row: 4, col: 7 })).toBe(true);
    });

    it('should return false if the path is not clear. The same row', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 4, col: 3 }},
            {type: 'pawn', color: 'black', position: { row: 4, col: 4 }},
            {type: 'pawn', color: 'white', position: { row: 4, col: 7 }},
        ]);
        expect(board.isPathClear({ row: 4, col: 3 }, { row: 4, col: 7 })).toBe(false);
    });

    it('should return true if the path is clear. The same column', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 3, col: 3 }},
            {type: 'pawn', color: 'white', position: { row: 7, col: 3 }},
        ]);
        expect(board.isPathClear({ row: 3, col: 3 }, { row: 7, col: 3 })).toBe(true);
    });

    it('should return false if the path is not clear. The same column', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 3, col: 3 }},
            {type: 'pawn', color: 'black', position: { row: 4, col: 3 }},
            {type: 'pawn', color: 'white', position: { row: 7, col: 3 }},
        ]);
        expect(board.isPathClear({ row: 3, col: 3 }, { row: 7, col: 3 })).toBe(false);
    });

    it('should return true if the path is clear. The same diagonal', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 2, col: 3 }},
            {type: 'pawn', color: 'white', position: { row: 6, col: 7 }},
        ]);
        expect(board.isPathClear({ row: 2, col: 3 }, { row: 6, col: 7 })).toBe(true);
    });

    it('should return false if the path is not clear. The same diagonal', () => {
        const board = new MockBoard([
            {type: 'Rook', color: 'black', position: { row: 2, col: 3 }},
            {type: 'pawn', color: 'black', position: { row: 3, col: 4 }},
            {type: 'pawn', color: 'white', position: { row: 6, col: 7 }},
        ]);
        expect(board.isPathClear({ row: 2, col: 3 }, { row: 6, col: 7 })).toBe(false);
    });
});
