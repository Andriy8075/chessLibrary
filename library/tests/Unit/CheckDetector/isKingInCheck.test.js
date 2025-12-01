const loadMockBoards = require('../../helpers/loadMockBoards');
const CheckDetector = require('../../../src/board/CheckDetector');
const path = require('path');
const fs = require('fs');
const mockBoardsFolder = require('../../helpers/mockBoardsFolder');

test('board cases', () => {
    const boards = loadMockBoards('isKingInCheck');
    for (const board of boards) {
        const isInCheck = CheckDetector.isKingInCheck(board.color, board.board);
        expect(isInCheck).toBe(board.expectedResult);
    }
});