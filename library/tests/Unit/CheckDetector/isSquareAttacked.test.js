const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isSquareAttacked');
    for (const testCase of testCases) {
        const isAttacked = CheckDetector.isSquareAttacked(testCase.targetSquare, testCase.attackingColor, testCase.board);
        if (isAttacked !== testCase.expectedResult) {
            console.log(`Board: ${testCase.name}`);
            console.log(`Target Square: ${testCase.targetSquare}`);
            console.log(`Attacking Color: ${testCase.attackingColor}`);
            console.log(`Board: ${testCase.board}`);
            console.log(`Expected Result: ${testCase.expectedResult}`);
            console.log(`Is Attacked: ${isAttacked}`);
        }
        expect(isAttacked).toBe(testCase.expectedResult);
    }
});