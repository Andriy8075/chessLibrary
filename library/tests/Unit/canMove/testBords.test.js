const loadMockBoards = require('../../helpers/loadMockBoards');
const { cellsEqual } = require('../../../src/utils/Cell');
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
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const cellTo = { row: i + 1, col: j + 1 };
                    result = piece.canMove(cellTo);
                    let expected = false;
                    for (const move of board.moves) {
                        if (cellsEqual(move, cellTo)) {
                            expected = true;
                            break;
                        }
                    }
                    if (result !== expected) {
                        console.log(`Bishop at ${board.mainPiecePosition} can move to ${cellTo} but should not`, {depth: 5});
                    }
                    expect(result).toBe(expected);
    
                }
            }
        });
    });
});