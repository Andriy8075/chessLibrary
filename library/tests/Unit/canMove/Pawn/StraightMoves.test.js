const mockBoard = require('../../../../src/board/Board');

test('white piece can move forward 1 square', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 4, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('black piece can move forward 1 square', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 4, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 3 });
    expect(result).toBe(true);
});

test('white piece can move forward 2 squares from starting position', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 2, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 2, col: 3 });
    result = pawn.canMove({ row: 4, col: 3 });
    expect(result).toBe(true);
});

test('black piece can move forward 2 squares from starting position', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 7, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 7, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(true);
});

test('white piece can not move further than 2 squares forward', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 2, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 2, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('black piece can not move further than 2 squares forward', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 7, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 7, col: 3 });
    result = pawn.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test ('white pawn can move 2 squares forward only from starting position', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 3, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 3, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test ('black pawn can move 2 squares forward only from starting position', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 6, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 6, col: 3 });
    result = pawn.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test ('white pawn can not move 2 squares forward if there is a piece in the way', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 2, col: 3 }}, {type: 'pawn', color: 'black', position: { row: 3, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 2, col: 3 });
    result = pawn.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

test ('black pawn can not move 2 squares forward if there is a piece in the way', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 7, col: 3 }}, {type: 'pawn', color: 'white', position: { row: 6, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 7, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('white pawn can not move forward if there is a piece in the way', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 4, col: 3 }}, {type: 'pawn', color: 'black', position: { row: 5, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('black pawn can not move forward if there is a piece in the way', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 4, col: 3 }}, {type: 'pawn', color: 'white', position: { row: 3, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 3 });
    expect(result).toBe(false);
});

test('white pawn can not move backward', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 4, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 3, col: 3 });
    expect(result).toBe(false);
});

test('black pawn can not move backward', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 4, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 4, col: 3 });
    result = pawn.canMove({ row: 5, col: 3 });
    expect(result).toBe(false);
});

test('white pawn can not go out of the board', () => {
    const board = new mockBoard([{type: 'pawn', color: 'white', position: { row: 8, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 8, col: 3 });
    result = pawn.canMove({ row: 9, col: 3 });
    expect(result).toBe(false);
});

test('black pawn can not go out of the board', () => {
    const board = new mockBoard([{type: 'pawn', color: 'black', position: { row: 1, col: 3 }}]);
    const pawn = board.getPieceOnCell({ row: 1, col: 3 });
    result = pawn.canMove({ row: 0, col: 3 });
    expect(result).toBe(false);
});




