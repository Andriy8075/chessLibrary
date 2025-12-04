const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const boards = loadMockBoards('isSquareAttacked');
    for (const board of boards) {
        const isAttacked = CheckDetector.isSquareAttacked(board.targetSquare, board.attackingColor, board.board);
        if (isAttacked !== board.expectedResult) {
            console.log(`Board: ${board.name}`);
            console.log(`Target Square: ${board.targetSquare}`);
            console.log(`Attacking Color: ${board.attackingColor}`);
            console.log(`Board: ${board.board}`);
            console.log(`Expected Result: ${board.expectedResult}`);
            console.log(`Is Attacked: ${isAttacked}`);
        }
        expect(isAttacked).toBe(board.expectedResult);
    }
});