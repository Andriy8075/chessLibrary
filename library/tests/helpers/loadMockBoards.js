const fs = require('fs');
const path = require('path');
const MockBoard = require('./MockBoard');
const mockBoardsFolder = require('./mockBoardsFolder');
// specify path to folder with mock boards RELATIVELY TO test/boards FOLDER
function loadMockBoards(folderPath) {
    const boards = [];
    const testPath = mockBoardsFolder
    const files = fs.readdirSync(path.join(testPath, folderPath));
    for (const file of files) {
        const boardSchema = require(path.join(testPath, folderPath, file));
        const extraInfo = boardSchema.extraInfo || {};
        const board = new MockBoard(boardSchema.pieces, extraInfo);
        if (boardSchema.boardType === 'tryMove') {
            console.log('boardSchema', boardSchema);
            console.log('pieces', boardSchema.pieces);
        }
        boards.push({
            board: board,
            ...Object.fromEntries(
                Object.entries(boardSchema)
        ),
        });
    }
    return boards;
}

module.exports = loadMockBoards;