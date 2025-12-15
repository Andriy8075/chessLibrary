const loadMockBoards = require('../../helpers/loadMockBoards');
const MoveValidator = require('../../../src/board/MoveValidator');
const { assertBooleanWithMoveContext } = require('../../helpers/testAssertions');

test('board cases', () => {
    const testCases = loadMockBoards('wouldEnPassantMoveCauseCheck');
    for (const testCase of testCases) {
        const wouldMoveCauseCheck = MoveValidator.wouldEnPassantMoveCauseCheck(testCase.cellFrom, testCase.cellTo, testCase.board);
        assertBooleanWithMoveContext(
            wouldMoveCauseCheck,
            testCase.expectedResult,
            testCase.cellFrom,
            testCase.cellTo,
            'En passant move',
            {
                action: 'cause check',
                enPassantTarget: testCase.board ? testCase.board.extraInfo?.enPassantTarget : 'N/A'
            }
        );
    }
});