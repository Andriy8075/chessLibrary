const mockBoard = require('../../../../src/board/Board');

test('white pawn can en passant', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 5, col: 4 }},
         {type: 'pawn', color: 'black', position: { row: 5, col: 5 }}
        ],
        {enPassantTarget: { row: 6, col: 5 }});
    const pawn = board.getPieceOnCell({ row: 5, col: 4 });
    result = pawn.canMove({ row: 6, col: 5 });
    expect(result).toBe(true);
});

test('black pawn can en passant', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 4, col: 4 }},
         {type: 'pawn', color: 'white', position: { row: 4, col: 5 }}
        ],
        {enPassantTarget: { row: 3, col: 5 }});
    const pawn = board.getPieceOnCell({ row: 4, col: 4 });
    result = pawn.canMove({ row: 3, col: 5 });
    expect(result).toBe(true);
});


