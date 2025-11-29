const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

class Knight extends Piece {
    canMove(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        if (!((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2))) return false;

        const targetPiece = this.board.getPieceOnCell(cellTo);
        if (targetPiece && targetPiece.color === this.color) return false;

        return true;
    }

    findAllPossibleMoves() {
        const possibleMoves = [];
        const directions = [
            { row: 2, col: 1 }, { row: 2, col: -1 },
            { row: -2, col: 1 }, { row: -2, col: -1 },
            { row: 1, col: 2 }, { row: 1, col: -2 },
            { row: -1, col: 2 }, { row: -1, col: -2 }
        ];

        for (const dir of directions) {
            const newRow = this.cell.row + dir.row;
            const newCol = this.cell.col + dir.col;

            if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                const targetCell = { row: newRow, col: newCol };
                const pieceOnTarget = this.board.getPieceOnCell(targetCell);

                if (!pieceOnTarget || pieceOnTarget.color !== this.color) {
                    possibleMoves.push(targetCell);
                }
            }
        }

        return possibleMoves;
    }
}

module.exports = Knight;
