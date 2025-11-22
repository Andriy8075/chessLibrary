const Piece = require('./Piece');
const { getDistance, isValidCell, cellsEqual } = require('../utils/Cell');
const Rook = require('./Rook');

class King extends Piece {
    canMove(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        if (!(absRowDiff <= 1 && absColDiff <= 1 && (absRowDiff !== 0 || absColDiff !== 0))) return false;

        const targetPiece = this.board.getPieceOnCell(cellTo);
        if (targetPiece && targetPiece.color === this.color) return false;

        return true;
    }

    tryCastle(cellTo) {
        const kingStartRow = this.color === 'white' ? 1 : 8;
        if (this.cell.row !== kingStartRow || this.cell.col !== 5) return false;

        if (this.board.hasPieceMoved(this.color, 'king')) return false;

        const colDiff = cellTo.col - this.cell.col;
        if (Math.abs(colDiff) !== 2) return false;

        const isKingside = colDiff > 0;
        const rookCol = isKingside ? 8 : 1;
        const rookCell = { row: kingStartRow, col: rookCol };

        const rook = this.board.getPieceOnCell(rookCell);
        if (!rook || !(rook instanceof Rook) || rook.color !== this.color) return false;

        if (this.board.hasPieceMoved(this.color, isKingside ? 'kingsideRook' : 'queensideRook')) return false;

        const pathStartCol = isKingside ? 6 : 2;
        const pathEndCol = isKingside ? 7 : 4;
        for (let col = pathStartCol; col <= pathEndCol; col++) {
            const pathCell = { row: kingStartRow, col };
            if (this.board.getPieceOnCell(pathCell)) return false;
        }

        if (this.board.isKingInCheck(this.color)) return false;

        const intermediateCol = isKingside ? 6 : 3;
        const intermediateCell = { row: kingStartRow, col: intermediateCol };
        if (this.board.wouldMoveCauseCheck(this.cell, intermediateCell, this.color)) return false;

        return true;
    }

    doesCheckToKing() {
        return this.board.isSquareAttacked(this.cell, this.getOppositeColor());
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

        const kingStartRow = this.color === 'white' ? 1 : 8;
        if (this.cell.row === kingStartRow && this.cell.col === 5) {
            const kingsideCell = { row: kingStartRow, col: 7 };
            if (this.tryCastle(kingsideCell)) {
                possibleMoves.push(kingsideCell);
            }

            const queensideCell = { row: kingStartRow, col: 3 };
            if (this.tryCastle(queensideCell)) {
                possibleMoves.push(queensideCell);
            }
        }

        return possibleMoves;
    }
}

module.exports = King;
