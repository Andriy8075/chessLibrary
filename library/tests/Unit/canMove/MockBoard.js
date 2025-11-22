const { isValidCell } = require('../../../src/utils/Cell');

class MockBoard {
    constructor(additionalPieces = []) {
        this.arrangement = Array(8).fill(null).map(() => Array(8).fill(null));
        
        for (const piece of additionalPieces) {
            if (piece && piece.cell) {
                this.arrangement[piece.cell.row - 1][piece.cell.col - 1] = piece;
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

