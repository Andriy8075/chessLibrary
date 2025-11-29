const fs = require('fs');
const path = require('path');
const MockBoard = require('./MockBoard');
const pieceClassProvider = require('./pieceClassProvider');

// specify path to folder with mock boards RELATIVELY TO TESTS FOLDER
function loadMockBoards(folderPath) {
    const boards = [];
    const testPath = path.join(__dirname, '..');
    const files = fs.readdirSync(path.join(testPath, folderPath));
    for (const file of files) {
        const boardSchema = require(path.join(testPath, folderPath, file));
        const extraInfo = boardSchema.extraInfo || {};
        const board = new MockBoard(boardSchema.pieces, extraInfo);
        boards.push({
            board: board,
            mainPiecePosition: boardSchema.mainPiecePosition,
            moves: boardSchema.moves
        });
    }
    return boards;
}

module.exports = loadMockBoards;