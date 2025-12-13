const mockBoard = require('../../../../src/board/Board');

test('white pawn can en passant', () => {
    const cellFrom = { row: 5, col: 4 };
    const cellTo = { row: 6, col: 5 };
    const enPassantTarget = { row: 6, col: 5 };
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: cellFrom},
         {type: 'pawn', color: 'black', position: { row: 5, col: 5 }}
        ],
        {enPassantTarget: enPassantTarget});
    const pawn = board.getPieceOnCell(cellFrom);
    result = pawn.canMove(cellTo);
    try {
        expect(result).toBe(true);
    } catch (error) {
        console.error('En passant move details:', JSON.stringify({
            cellFrom: cellFrom,
            cellTo: cellTo,
            enPassantTarget: enPassantTarget,
            color: 'white',
            expectedResult: true,
            actualResult: result
        }, null, 2));
        throw new Error(`White pawn should be able to en passant from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)}. Got ${result}, expected true. ${error.message}`);
    }
});

test('black pawn can en passant', () => {
    const cellFrom = { row: 4, col: 4 };
    const cellTo = { row: 3, col: 5 };
    const enPassantTarget = { row: 3, col: 5 };
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: cellFrom},
         {type: 'pawn', color: 'white', position: { row: 4, col: 5 }}
        ],
        {enPassantTarget: enPassantTarget});
    const pawn = board.getPieceOnCell(cellFrom);
    result = pawn.canMove(cellTo);
    try {
        expect(result).toBe(true);
    } catch (error) {
        console.error('En passant move details:', JSON.stringify({
            cellFrom: cellFrom,
            cellTo: cellTo,
            enPassantTarget: enPassantTarget,
            color: 'black',
            expectedResult: true,
            actualResult: result
        }, null, 2));
        throw new Error(`Black pawn should be able to en passant from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)}. Got ${result}, expected true. ${error.message}`);
    }
});


