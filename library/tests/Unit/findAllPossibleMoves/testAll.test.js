const loadMockBoards = require('../../helpers/loadMockBoards');
const sortMoves = require('./sort');
const fs = require('fs');
const path = require('path');
const mockBoardsFolder = require('../../helpers/mockBoardsFolder');

test('board cases', () => {
    const boardsPath = path.join(mockBoardsFolder, 'findAllPossibleMoves');
    const folders = fs.readdirSync(boardsPath).filter(item => {
        const itemPath = path.join(boardsPath, item);
        return fs.statSync(itemPath).isDirectory();
    });

    folders.forEach(folderName => {
        const boards = loadMockBoards(`findAllPossibleMoves/${folderName}`);
        boards.forEach(board => {
            const piece = board.board.getPieceOnCell(board.mainPiecePosition);
            const possibleMoves = piece.findAllPossibleMoves();
            
            const { sortedPossibleMoves, sortedExpectedMoves } = sortMoves(possibleMoves, board.moves);
            
            expect(sortedPossibleMoves).toEqual(sortedExpectedMoves);
        });
    });
});