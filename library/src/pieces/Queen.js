const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

class Queen extends Piece {
    canMove(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        if (!((absRowDiff === 0 && absColDiff !== 0) ||
               (absRowDiff !== 0 && absColDiff === 0) ||
               (absRowDiff === absColDiff))) return false;

        if (!this.board.isPathClear(this.cell, cellTo)) return false;

        const targetPiece = this.board.getPieceOnCell(cellTo);
        if (targetPiece && targetPiece.color === this.color) return false;

        return true;
    }

    doesCheckToKing() {
        const enemyKing = this.board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;

        return this.canMove(enemyKing.cell);
    }

    findAllPossibleMoves() {
        const possibleMoves = [];
        const directions = [
            { row: 1, col: 0 },
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: -1 },
            { row: 1, col: 1 },
            { row: 1, col: -1 },
            { row: -1, col: 1 },
            { row: -1, col: -1 }
        ];

        for (const dir of directions) {
            for (let i = 1; i <= 7; i++) {
                const newRow = this.cell.row + dir.row * i;
                const newCol = this.cell.col + dir.col * i;

                if (newRow < 1 || newRow > 8 || newCol < 1 || newCol > 8) break;

                const targetCell = { row: newRow, col: newCol };
                const pieceOnTarget = this.board.getPieceOnCell(targetCell);

                if (!pieceOnTarget) {
                    possibleMoves.push(targetCell);
                } else {
                    if (pieceOnTarget.color !== this.color) {
                        possibleMoves.push(targetCell);
                    }
                    break;
                }
            }
        }

        return possibleMoves;
    }
}

module.exports = Queen;
