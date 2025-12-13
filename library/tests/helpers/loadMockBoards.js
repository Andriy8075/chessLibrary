const fs = require('fs');
const path = require('path');
const MockBoard = require('./../../src/board/Board');
const mockBoardsFolder = require('./mockBoardsFolder');
function loadMockBoards(folderPath) {
    const boards = [];
    const testPath = mockBoardsFolder
    const files = fs.readdirSync(path.join(testPath, folderPath));
    for (const file of files) {
        const boardSchema = require(path.join(testPath, folderPath, file));
        const extraInfo = boardSchema.extraInfo || {};
        const board = new MockBoard(boardSchema.pieces, extraInfo);
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