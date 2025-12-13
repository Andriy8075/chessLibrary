const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');

test('board cases', () => {
    const testCases = loadMockBoards('wouldEnPassantMoveCauseCheck');
    for (const testCase of testCases) {
        const wouldMoveCauseCheck = MoveValidator.wouldEnPassantMoveCauseCheck(testCase.cellFrom, testCase.cellTo, testCase.board);
        try {
            expect(wouldMoveCauseCheck).toBe(testCase.expectedResult);
        } catch (error) {
            console.error('En passant move details:', JSON.stringify({
                cellFrom: testCase.cellFrom,
                cellTo: testCase.cellTo,
                expectedResult: testCase.expectedResult,
                actualResult: wouldMoveCauseCheck,
                enPassantTarget: testCase.board ? testCase.board.extraInfo?.enPassantTarget : 'N/A'
            }, null, 2));
            throw new Error(
                `En passant move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)} ` +
                `should ${testCase.expectedResult ? '' : 'not '}cause check. Got ${wouldMoveCauseCheck}, expected ${testCase.expectedResult}. ${error.message}`
            );
        }
    }
});