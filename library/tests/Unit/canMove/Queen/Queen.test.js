const MockBoard = require('../../../helpers/MockBoard');
const { cellsEqual } = require('../../../../src/utils/Cell');

const queenProvider = (cell) => {
    const board = new MockBoard([{type: 'queen', color: 'black', position: cell}]);
    return board.getPieceOnCell(cell);
}

test('can move to cells outside of the board', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 4, col: 9 });
    expect(result).toBe(false);
});

test('can not move to the same cell', () => {
    const queen = queenProvider({ row: 4, col: 3 });
    result = queen.canMove({ row: 4, col: 3 });
    expect(result).toBe(false);
});

