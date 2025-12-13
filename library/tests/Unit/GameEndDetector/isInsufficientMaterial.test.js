const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isInsufficientMaterial');
    for (const testCase of testCases) {
        const isInsufficientMaterial = GameEndDetector.isInsufficientMaterial(testCase.board);
        const result = isInsufficientMaterial === 'insufficientMaterial';
        try {
            expect(result).toBe(testCase.expectedResult);
        } catch (error) {
            throw new Error(`Board should ${testCase.expectedResult ? '' : 'not '}have insufficient material. Got ${result} (returned: ${isInsufficientMaterial}), expected ${testCase.expectedResult}. ${error.message}`);
        }
    }
});