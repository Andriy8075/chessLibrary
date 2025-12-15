const loadMockBoards = require('../../helpers/loadMockBoards');
const { cellsEqual } = require('../../../src/utils/Cell');
const fs = require('fs');
const path = require('path');
const mockBoardsFolder = require('../../helpers/mockBoardsFolder');
const { assertCanMoveResult } = require('../../helpers/testAssertions');

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
            const pieceInfo = piece ? {
                type: piece.constructor.name,
                color: piece.color,
                position: board.mainPiecePosition
            } : 'N/A';
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
                    assertCanMoveResult(result, expected, board.mainPiecePosition, cellTo, pieceInfo, folderName);
                }
            }
        });
    });
});