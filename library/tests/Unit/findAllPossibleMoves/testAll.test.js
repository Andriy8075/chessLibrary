const loadMockBoards = require('../../helpers/loadMockBoards');
const sortMoves = require('./sort');
const fs = require('fs');
const path = require('path');

test('board cases', () => {
    const boardsPath = path.join(__dirname, '../boards');
    const folders = fs.readdirSync(boardsPath).filter(item => {
        const itemPath = path.join(boardsPath, item);
        return fs.statSync(itemPath).isDirectory();
    });

    folders.forEach(folderName => {
        const boards = loadMockBoards(`Unit/boards/${folderName}`);
        boards.forEach(board => {
            const piece = board.board.getPieceOnCell(board.mainPiecePosition);
            const possibleMoves = piece.findAllPossibleMoves();
            
            const { sortedPossibleMoves, sortedExpectedMoves } = sortMoves(possibleMoves, board.moves);
            
            expect(sortedPossibleMoves).toEqual(sortedExpectedMoves);
        });
    });
});