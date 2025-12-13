const MockBoard = require('../../../src/board/Board');

describe('Board._executeMove', () => {
    it('should move a piece from one cell to another', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
        ]);
        const cellFrom = { row: 2, col: 4 };
        const cellTo = { row: 3, col: 4 };
        const pawn = board.getPieceOnCell(cellFrom);
        board._executeMove(cellFrom, cellTo);
        try {
            expect(board.getPieceOnCell(cellTo)).toBe(pawn);
        } catch (error) {
            console.error('Move details:', JSON.stringify({ cellFrom, cellTo, pieceType: 'Pawn', color: 'white' }, null, 2));
            throw new Error(`Piece should be at destination cell ${JSON.stringify(cellTo)} after move from ${JSON.stringify(cellFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(cellFrom)).toBeNull();
        } catch (error) {
            console.error('Move details:', JSON.stringify({ cellFrom, cellTo }, null, 2));
            throw new Error(`Source cell ${JSON.stringify(cellFrom)} should be empty after move to ${JSON.stringify(cellTo)}. ${error.message}`);
        }
        try {
            expect(pawn.cell).toStrictEqual(cellTo);
        } catch (error) {
            console.error('Move details:', JSON.stringify({ cellFrom, cellTo, actualPieceCell: pawn.cell }, null, 2));
            throw new Error(`Piece cell property should be ${JSON.stringify(cellTo)} after move from ${JSON.stringify(cellFrom)}. ${error.message}`);
        }
    });

    it('should capture a piece if it is on the target cell', () => {
        const board = new MockBoard([
            {type: 'Pawn', color: 'white', position: { row: 2, col: 4 }},
            {type: 'Pawn', color: 'black', position: { row: 3, col: 5 }},
        ]);
        const cellFrom = { row: 2, col: 4 };
        const cellTo = { row: 3, col: 4 };
        const capturedCell = { row: 2, col: 5 };
        const pawn = board.getPieceOnCell(cellFrom);
        board._executeMove(cellFrom, cellTo);
        try {
            expect(board.getPieceOnCell(cellTo)).toBe(pawn);
        } catch (error) {
            console.error('Capture move details:', JSON.stringify({ cellFrom, cellTo, capturedCell }, null, 2));
            throw new Error(`Piece should be at destination cell ${JSON.stringify(cellTo)} after capture move from ${JSON.stringify(cellFrom)}. ${error.message}`);
        }
        try {
            expect(board.getPieceOnCell(capturedCell)).toBeNull();
        } catch (error) {
            console.error('Capture move details:', JSON.stringify({ cellFrom, cellTo, capturedCell }, null, 2));
            throw new Error(`Expected captured piece at ${JSON.stringify(capturedCell)} but found ${board.getPieceOnCell(capturedCell)}. ${error.message}`);
        }
        try {
            expect(pawn.cell).toStrictEqual(cellTo);
        } catch (error) {
            console.error('Capture move details:', JSON.stringify({ cellFrom, cellTo, actualPieceCell: pawn.cell }, null, 2));
            throw new Error(`Piece cell property should be ${JSON.stringify(cellTo)} after capture move from ${JSON.stringify(cellFrom)}. ${error.message}`);
        }
    });
});