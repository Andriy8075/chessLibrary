const loadMockBoards = require('../../helpers/loadMockBoards');
const sortMoves = require('./sort');
const fs = require('fs');
const path = require('path');
const mockBoardsFolder = require('../../helpers/mockBoardsFolder');

test('board cases', () => {
    const testCasesPath = path.join(mockBoardsFolder, 'findAllPossibleMoves');
    const folders = fs.readdirSync(testCasesPath).filter(item => {
        const itemPath = path.join(testCasesPath, item);
        return fs.statSync(itemPath).isDirectory();
    });

    folders.forEach(folderName => {
        const testCases = loadMockBoards(`findAllPossibleMoves/${folderName}`);
        testCases.forEach(testCase => {
            const piece = testCase.board.getPieceOnCell(testCase.mainPiecePosition);
            const possibleMoves = piece.findAllPossibleMoves();
            
            const { sortedPossibleMoves, sortedExpectedMoves } = sortMoves(possibleMoves, testCase.moves);
            
            try {
                expect(sortedPossibleMoves).toEqual(sortedExpectedMoves);
            } catch (error) {
                throw new Error(`Piece at ${JSON.stringify(testCase.mainPiecePosition)} in folder "${folderName}" should have expected moves. ${error.message}`);
            }
        });
    });
});