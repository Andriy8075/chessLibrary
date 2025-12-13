const MockBoard = require('../../../src/board/Board');

describe('Board._executeEnPassant', () => {
    it('should execute en passant for white', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 5, col: 4 }},
            {type: 'Pawn', color: 'black', position: { row: 5, col: 5 }},
        ],
        { enPassantTarget: { row: 6, col: 5 } }
    );
        const cellFrom = { row: 5, col: 4 };
        const cellTo = { row: 6, col: 5 };
        const capturedCell = { row: 5, col: 5 };
        const whitePawn = board.getPieceOnCell(cellFrom);
        const blackPawn = board.getPieceOnCell(capturedCell);
        board._executeEnPassant(cellFrom, cellTo);
        try {
            expect(board.getPieceOnCell(cellTo)).toBe(whitePawn);
        } catch (error) {
            console.error('En passant details:', JSON.stringify({ cellFrom, cellTo, capturedCell, enPassantTarget: board.extraInfo.enPassantTarget }, null, 2));
            throw new Error(`White pawn should be at ${JSON.stringify(cellTo)} after en passant from ${JSON.stringify(cellFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(cellFrom)).toBeNull();
        } catch (error) {
            console.error('En passant details:', JSON.stringify({ cellFrom, cellTo }, null, 2));
            throw new Error(`Source cell ${JSON.stringify(cellFrom)} should be empty after en passant to ${JSON.stringify(cellTo)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(capturedCell)).toBeNull();
        } catch (error) {
            console.error('En passant details:', JSON.stringify({ cellFrom, cellTo, capturedCell }, null, 2));
            throw new Error(`Captured pawn cell ${JSON.stringify(capturedCell)} should be empty after en passant. ${error.message}`);
        }
    });

    it('should execute en passant for black', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'black', position: { row: 4, col: 4 }},
            {type: 'Pawn', color: 'white', position: { row: 4, col: 5 }},
        ],
        { enPassantTarget: { row: 3, col: 5 } }
    );
        const cellFrom = { row: 4, col: 4 };
        const cellTo = { row: 3, col: 5 };
        const capturedCell = { row: 4, col: 5 };
        const blackPawn = board.getPieceOnCell(cellFrom);
        const whitePawn = board.getPieceOnCell(capturedCell);
        board._executeEnPassant(cellFrom, cellTo);
        try {
            expect(board.getPieceOnCell(cellTo)).toBe(blackPawn);
        } catch (error) {
            console.error('En passant details:', JSON.stringify({ cellFrom, cellTo, capturedCell, enPassantTarget: board.extraInfo.enPassantTarget }, null, 2));
            throw new Error(`Black pawn should be at ${JSON.stringify(cellTo)} after en passant from ${JSON.stringify(cellFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(cellFrom)).toBeNull();
        } catch (error) {
            console.error('En passant details:', JSON.stringify({ cellFrom, cellTo }, null, 2));
            throw new Error(`Source cell ${JSON.stringify(cellFrom)} should be empty after en passant to ${JSON.stringify(cellTo)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(capturedCell)).toBeNull();
        } catch (error) {
            console.error('En passant details:', JSON.stringify({ cellFrom, cellTo, capturedCell }, null, 2));
            throw new Error(`Captured pawn cell ${JSON.stringify(capturedCell)} should be empty after en passant. ${error.message}`);
        }
    });
});