const mockBoard = require('../../../helpers/../../src/board/Board');

test('white pawn can kill', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 3 }}, 
        {type: 'pawn', color: 'black', position: { row: 5, col: 4 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 4 });
    expect(result).toBe(true);
});

test('black pawn can kill', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 4, col: 3 }}, 
        {type: 'pawn', color: 'white', position: { row: 3, col: 4 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 4 });
    expect(result).toBe(true);
});

test('white pawn can not kill if there is no piece', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 3 }}, 
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 4 });
    expect(result).toBe(false);
});

test('black pawn can not kill if there is no piece', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 4, col: 3 }}, 
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 4 });
    expect(result).toBe(false);
});

test('white pawn can not kill backward', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 3 }}, 
        {type: 'pawn', color: 'black', position: { row: 3, col: 4 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 4 });
    expect(result).toBe(false);
});

test('black pawn can not kill backward', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 4, col: 3 }}, 
        {type: 'pawn', color: 'white', position: { row: 5, col: 4 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 4 });
    expect(result).toBe(false);
});

test('white pawn can not kill too far away', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 2, col: 3 }}, 
        {type: 'pawn', color: 'black', position: { row: 4, col: 4 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 2, col: 3 });
    result = pawn.canMove({ row: 4, col: 4 });
    expect(result).toBe(false);
});

test('black pawn can not kill too far away', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 7, col: 3 }}, 
        {type: 'pawn', color: 'white', position: { row: 5, col: 4 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 7, col: 3 });
    result = pawn.canMove({ row: 5, col: 4 });
    expect(result).toBe(false);
});

test('white pawn can not kill on a far column', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 3 }}, 
        {type: 'pawn', color: 'black', position: { row: 5, col: 1 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 1 });
    expect(result).toBe(false);
});

test('black pawn can not kill on a far column', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 4, col: 3 }}, 
        {type: 'pawn', color: 'white', position: { row: 5, col: 5 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 5 });
    expect(result).toBe(false);
});

test('white pawn can only kill black pieces', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'white', position: { row: 4, col: 3 }}, 
        {type: 'bishop', color: 'white', position: { row: 5, col: 2 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 2 });
    expect(result).toBe(false);
});

test('black pawn can only kill white pieces', () => {
    const board = new mockBoard([
        {type: 'pawn', color: 'black', position: { row: 4, col: 3 }}, 
        {type: 'bishop', color: 'black', position: { row: 3, col: 2 }},
    ]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 2 });
    expect(result).toBe(false);
});




