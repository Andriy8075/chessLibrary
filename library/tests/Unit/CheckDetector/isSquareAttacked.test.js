const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isSquareAttacked');
    for (const testCase of testCases) {
        const isAttacked = CheckDetector.isSquareAttacked(testCase.targetSquare, testCase.attackingColor, testCase.board);
        try {
            expect(isAttacked).toBe(testCase.expectedResult);
        } catch (error) {
            const message = `Test case "${testCase.name || 'unnamed'}": Square ${JSON.stringify(testCase.targetSquare)} should ${testCase.expectedResult ? '' : 'not '}be attacked by ${testCase.attackingColor}. Got ${isAttacked}, expected ${testCase.expectedResult}.`;
            console.log(`Board: ${testCase.name}`);
            console.log(`Target Square: ${JSON.stringify(testCase.targetSquare)}`);
            console.log(`Attacking Color: ${testCase.attackingColor}`);
            console.log(`Expected Result: ${testCase.expectedResult}`);
            console.log(`Is Attacked: ${isAttacked}`);
            throw new Error(message);
        }
    }
});