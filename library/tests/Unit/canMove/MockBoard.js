const { isValidCell } = require('../../../src/utils/Cell');
const King = require('../../../src/pieces/King');
const Queen = require('../../../src/pieces/Queen');
const Rook = require('../../../src/pieces/Rook');
const Bishop = require('../../../src/pieces/Bishop');
const Knight = require('../../../src/pieces/Knight');
const Pawn = require('../../../src/pieces/Pawn');

class MockBoard {
    constructor(additionalPieces = []) {
        this.arrangement = Array(8).fill(null).map(() => Array(8).fill(null));
        
        for (const piece of additionalPieces) {
            if (piece.type === 'king') {
                this.arrangement[piece.position.row - 1][piece.position.col - 1] = new King(piece.color, piece.position, this);
            } else if (piece.type === 'queen') {
                this.arrangement[piece.position.row - 1][piece.position.col - 1] = new Queen(piece.color, piece.position, this);
            } else if (piece.type === 'rook') {
                this.arrangement[piece.position.row - 1][piece.position.col - 1] = new Rook(piece.color, piece.position, this);
            } else if (piece.type === 'bishop') {
                this.arrangement[piece.position.row - 1][piece.position.col - 1] = new Bishop(piece.color, piece.position, this);
            } else if (piece.type === 'knight') {
                this.arrangement[piece.position.row - 1][piece.position.col - 1] = new Knight(piece.color, piece.position, this);
            } else if (piece.type === 'pawn') {
                this.arrangement[piece.position.row - 1][piece.position.col - 1] = new Pawn(piece.color, piece.position, this);
            }
            else {
                throw new Error(`Invalid piece type: ${piece.type}`);
            }
        }
    }

    getPieceOnCell(cell) {
        if (!isValidCell(cell)) return null;
        return this.arrangement[cell.row - 1][cell.col - 1];
    }

    isPathClear(cellFrom, cellTo) {
        if (!isValidCell(cellFrom) || !isValidCell(cellTo)) return false;

        const rowDiff = cellTo.row - cellFrom.row;
        const colDiff = cellTo.col - cellFrom.col;
        const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);

        let currentRow = cellFrom.row + rowStep;
        let currentCol = cellFrom.col + colStep;

        while (currentRow !== cellTo.row || currentCol !== cellTo.col) {
            if (this.arrangement[currentRow - 1][currentCol - 1] !== null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }
}

module.exports = MockBoard;

