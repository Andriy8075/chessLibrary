const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isInsufficientMaterial');
    for (const testCase of testCases) {
        const isInsufficientMaterial = GameEndDetector.isInsufficientMaterial(testCase.board);
        expect(isInsufficientMaterial === 'insufficientMaterial').toBe(testCase.expectedResult);
    }
});