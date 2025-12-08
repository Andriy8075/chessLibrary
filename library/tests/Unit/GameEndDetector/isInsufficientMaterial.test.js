const loadMockBoards = require('../../helpers/loadMockBoards');
const GameEndDetector = require('../../../src/board/GameEndDetector');

test('board cases', () => {
    const testCases = loadMockBoards('isInsufficientMaterial');
    for (const testCase of testCases) {
        const isInsufficientMaterial = GameEndDetector.isInsufficientMaterial(testCase.board);
        // expectedResult: true means enough pieces (not insufficient), false means insufficient material
        // isInsufficientMaterial === 'insufficientMaterial': true means insufficient, false/null means enough
        expect(isInsufficientMaterial === 'insufficientMaterial').toBe(testCase.expectedResult);
    }
});