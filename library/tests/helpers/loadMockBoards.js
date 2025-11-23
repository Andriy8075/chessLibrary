const fs = require('fs');
const path = require('path');
const MockBoard = require('./MockBoard');

// specify path to folder with mock boards RELATIVELY TO TESTS FOLDER
function loadMockBoards(folderPath) {
    const boards = [];
    const files = fs.readdirSync(path.join(__dirname, '..', '..', '..', folderPath));
    for (const file of files) {
        const boardSchema = require(path.join(__dirname, '..', '..', '..', folderPath, file));
        const pieces = boardSchema.board.map(piece => {
            const pieceClass = pieceClassProvider(piece.type);
            return new pieceClass(piece.color, piece.position, board);
        });
        const board = new MockBoard(pieces);
        boards.push({
            board: board,
            mainPiecePosition: boardSchema.mainPiecePosition,
            moves: boardSchema.moves
        });
    }
    return boards;
}

module.exports = loadMockBoards;