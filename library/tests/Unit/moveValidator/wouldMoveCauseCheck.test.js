const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');

test('board cases', () => {
    const testCases = loadMockBoards('wouldMoveCauseCheck');
    for (const testCase of testCases) {
        const wouldMoveCauseCheck = MoveValidator.wouldMoveCauseCheck(testCase.cellFrom, testCase.cellTo, testCase.board);
        try {
            expect(wouldMoveCauseCheck).toBe(testCase.expectedResult);
        } catch (error) {
            console.error('Move details:', JSON.stringify({
                cellFrom: testCase.cellFrom,
                cellTo: testCase.cellTo,
                expectedResult: testCase.expectedResult,
                actualResult: wouldMoveCauseCheck
            }, null, 2));
            throw new Error(
                `Move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)} ` +
                `should ${testCase.expectedResult ? '' : 'not '}cause check. Got ${wouldMoveCauseCheck}, expected ${testCase.expectedResult}. ${error.message}`
            );
        }
    }
});