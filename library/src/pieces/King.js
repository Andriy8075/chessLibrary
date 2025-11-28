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

    canCastle(cellTo) {
        const kingStartRow = this.color === 'white' ? 1 : 8;
        if (this.cell.row !== kingStartRow || this.cell.col !== 4) return false;
        if (cellTo.row !== kingStartRow) return false;

        if (this.board.hasPieceMoved(this.color, 'king')) return false;

        const colDiff = cellTo.col - this.cell.col;
        if (Math.abs(colDiff) !== 2) return false;

        const isKingside = colDiff < 0;

        if (this.board.hasPieceMoved(this.color, isKingside ? 'kingsideRook' : 'queensideRook')) return false;
        if (this.board.hasPieceMoved(this.color, 'king')) return false;

        // check for pieces between king and rook
        const pathStartCol = isKingside ? 2 : 5;
        const pathEndCol = isKingside ? 3 : 7;
        for (let col = pathStartCol; col <= pathEndCol; col++) {
            const pathCell = { row: kingStartRow, col };
            if (this.board.getPieceOnCell(pathCell)) return false;
        }

        // check for checks for king, rook and pieces
        const startCol = isKingside ? 1 : 4;
        const endCol = isKingside ? 4 : 8;

        for (let col = startCol; col <= endCol; col++) {
            const pathCell = { row: kingStartRow, col };
            if (this.board.isSquareAttacked(pathCell, this.getOppositeColor())) return false;
        }

        return true;
    }

    static isValidCastlingMove(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        if (!piece) return false;
        if (!(piece instanceof King)) return false;
        if (!piece.canCastle(cellTo)) return false;
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
        if (this.cell.row === kingStartRow && this.cell.col === 4) {
            const kingsideCell = { row: kingStartRow, col: 6 };
            if (this.canCastle(kingsideCell)) {
                possibleMoves.push(kingsideCell);
            }

            const queensideCell = { row: kingStartRow, col: 2 };
            if (this.canCastle(queensideCell)) {
                possibleMoves.push(queensideCell);
            }
        }

        return possibleMoves;
    }
}

module.exports = King;
