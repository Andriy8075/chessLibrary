const { isValidCell } = require('../../src/utils/Cell');
const pieceClassProvider = require('./pieceClassProvider');
const CheckDetector = require('../../src/board/CheckDetector');

class MockBoard {
    constructor(additionalPieces = [], extraInfo = {}) {
        this.arrangement = Array(8).fill(null).map(() => Array(8).fill(null));
        this.extraInfo = extraInfo;
        
        for (const piece of additionalPieces) {
            const pieceClass = pieceClassProvider(piece.type);
            this.arrangement[piece.position.row - 1][piece.position.col - 1] = new pieceClass(piece.color, piece.position, this);
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

    getEnPassantTarget() {
        return this.extraInfo.enPassantTarget;
    }

    hasPieceMoved(color, pieceType) {
        return this.extraInfo.piecesMadeMoves[`${color}${pieceType.charAt(0).toUpperCase()}${pieceType.slice(1)}`];
    }

    isSquareAttacked(cell, color) {
        return CheckDetector.isSquareAttacked(cell, color, this);
    }

    getArrangement() {
        return this.arrangement;
    }
}

module.exports = MockBoard;

