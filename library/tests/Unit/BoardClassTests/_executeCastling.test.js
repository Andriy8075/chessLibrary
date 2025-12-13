const MockBoard = require('../../../src/board/Board');

describe('Board._executeCastling', () => {
    it('should execute kingside castling for white', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
            {type: 'Rook', color: 'white', position: { row: 1, col: 8 }},
        ]);
        const kingFrom = { row: 1, col: 5 };
        const kingTo = { row: 1, col: 7 };
        const rookFrom = { row: 1, col: 8 };
        const rookTo = { row: 1, col: 6 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        try {
            expect(board.getPieceOnCell(kingTo)).toBe(king);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom, kingTo, rookFrom, rookTo, side: 'kingside', color: 'white' }, null, 2));
            throw new Error(`King should be at ${JSON.stringify(kingTo)} after kingside castling from ${JSON.stringify(kingFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom }, null, 2));
            throw new Error(`Rook source cell ${JSON.stringify(rookFrom)} should be empty after castling. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookTo)).toBe(rook);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom, rookTo }, null, 2));
            throw new Error(`Rook should be at ${JSON.stringify(rookTo)} after castling from ${JSON.stringify(rookFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(kingFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom }, null, 2));
            throw new Error(`King source cell ${JSON.stringify(kingFrom)} should be empty after castling. ${error.message}`);
        }
    });

    it('should execute kingside castling for black', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
            {type: 'Rook', color: 'black', position: { row: 8, col: 8 }},
        ]);
        const kingFrom = { row: 8, col: 5 };
        const kingTo = { row: 8, col: 7 };
        const rookFrom = { row: 8, col: 8 };
        const rookTo = { row: 8, col: 6 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        try {
            expect(board.getPieceOnCell(kingTo)).toBe(king);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom, kingTo, rookFrom, rookTo, side: 'kingside', color: 'black' }, null, 2));
            throw new Error(`King should be at ${JSON.stringify(kingTo)} after kingside castling from ${JSON.stringify(kingFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom }, null, 2));
            throw new Error(`Rook source cell ${JSON.stringify(rookFrom)} should be empty after castling. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookTo)).toBe(rook);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom, rookTo }, null, 2));
            throw new Error(`Rook should be at ${JSON.stringify(rookTo)} after castling from ${JSON.stringify(rookFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(kingFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom }, null, 2));
            throw new Error(`King source cell ${JSON.stringify(kingFrom)} should be empty after castling. ${error.message}`);
        }
    });

    it('should execute queenside castling for white', () => {
        const board = new MockBoard([
            {type: 'King', color: 'white', position: { row: 1, col: 5 }},
            {type: 'Rook', color: 'white', position: { row: 1, col: 1 }},
        ]);
        const kingFrom = { row: 1, col: 5 };
        const kingTo = { row: 1, col: 3 };
        const rookFrom = { row: 1, col: 1 };
        const rookTo = { row: 1, col: 4 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        try {
            expect(board.getPieceOnCell(kingTo)).toBe(king);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom, kingTo, rookFrom, rookTo, side: 'queenside', color: 'white' }, null, 2));
            throw new Error(`King should be at ${JSON.stringify(kingTo)} after queenside castling from ${JSON.stringify(kingFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom }, null, 2));
            throw new Error(`Rook source cell ${JSON.stringify(rookFrom)} should be empty after castling. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell({ row: 1, col: 2 })).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ intermediateCell: { row: 1, col: 2 } }, null, 2));
            throw new Error(`Intermediate cell {row: 1, col: 2} should be empty after queenside castling. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookTo)).toBe(rook);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom, rookTo }, null, 2));
            throw new Error(`Rook should be at ${JSON.stringify(rookTo)} after castling from ${JSON.stringify(rookFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(kingFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom }, null, 2));
            throw new Error(`King source cell ${JSON.stringify(kingFrom)} should be empty after castling. ${error.message}`);
        }
    });

    it('should execute queenside castling for black', () => {
        const board = new MockBoard([
            {type: 'King', color: 'black', position: { row: 8, col: 5 }},
            {type: 'Rook', color: 'black', position: { row: 8, col: 1 }},
        ]);
        const kingFrom = { row: 8, col: 5 };
        const kingTo = { row: 8, col: 3 };
        const rookFrom = { row: 8, col: 1 };
        const rookTo = { row: 8, col: 4 };
        const king = board.getPieceOnCell(kingFrom);
        const rook = board.getPieceOnCell(rookFrom);
        board._executeCastling(kingFrom, kingTo);
        try {
            expect(board.getPieceOnCell(kingTo)).toBe(king);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom, kingTo, rookFrom, rookTo, side: 'queenside', color: 'black' }, null, 2));
            throw new Error(`King should be at ${JSON.stringify(kingTo)} after queenside castling from ${JSON.stringify(kingFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom }, null, 2));
            throw new Error(`Rook source cell ${JSON.stringify(rookFrom)} should be empty after castling. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell({ row: 8, col: 2 })).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ intermediateCell: { row: 8, col: 2 } }, null, 2));
            throw new Error(`Intermediate cell {row: 8, col: 2} should be empty after queenside castling. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(rookTo)).toBe(rook);
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ rookFrom, rookTo }, null, 2));
            throw new Error(`Rook should be at ${JSON.stringify(rookTo)} after castling from ${JSON.stringify(rookFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(kingFrom)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ kingFrom }, null, 2));
            throw new Error(`King source cell ${JSON.stringify(kingFrom)} should be empty after castling. ${error.message}`);
        }
    });
});