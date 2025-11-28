const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

class Pawn extends Piece {
    canMove(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const targetPiece = this.board.getPieceOnCell(cellTo);

        if (colDiff === 0) {
            if (this.color === 'white') {
                if (rowDiff <= 0 || rowDiff > 2) return false;
                if (rowDiff === 2 && this.cell.row !== 2) return false;
            } else {
                if (rowDiff >= 0 || Math.abs(rowDiff) > 2) return false;
                if (Math.abs(rowDiff) === 2 && this.cell.row !== 7) return false;
            }
            if (targetPiece) return false;
            if (Math.abs(rowDiff) === 2) {
                const intermediateRow = this.color === 'white' ? this.cell.row + 1 : this.cell.row - 1;
                const intermediateCell = { row: intermediateRow, col: this.cell.col };
                if (this.board.getPieceOnCell(intermediateCell)) return false;
            }
        } else {
            if (!this.canCaptureAt(cellTo)) return false;
            if (!targetPiece && !this.canEnPassant(cellTo)) return false;
            if (targetPiece && targetPiece.color === this.color) return false;
        }

        return true;
    }

    canCaptureAt(cellTo) {
        if (!isValidCell(cellTo)) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);

        if (this.color === 'white') {
            return rowDiff === 1 && Math.abs(colDiff) === 1;
        } else {
            return rowDiff === -1 && Math.abs(colDiff) === 1;
        }
    }

    static isValidEnPassantMove(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        if (!(piece instanceof Pawn)) return false;
        
        if (!piece.canCaptureAt(cellTo)) return false;

        const targetPiece = board.getPieceOnCell(cellTo);
        if (targetPiece) return false;

        if (!piece.canEnPassant(cellTo)) return false;

        return true;
    }

    canEnPassant(cellTo) {
        if (!this.canCaptureAt(cellTo)) return false;

        const enPassantTarget = this.board.getEnPassantTarget();
        if (!enPassantTarget) return false;

        const enPassantRow = this.color === 'white' ? this.cell.row + 1 : this.cell.row - 1;
        return enPassantTarget.row === enPassantRow && enPassantTarget.col === cellTo.col;
    }

    static canPromote(cell, board) {
        const piece = board.getPieceOnCell(cell);
        return (piece instanceof Pawn && piece.cell.row === (piece.color === 'white' ? 8 : 1))
    }

    doesCheckToKing() {
        const enemyKing = this.board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;

        return this.canCaptureAt(enemyKing.cell);
    }

    findAllPossibleMoves() {
        const possibleMoves = [];

        const forwardDirection = this.color === 'white' ? 1 : -1;
        
        const oneSquareForward = { row: this.cell.row + forwardDirection, col: this.cell.col };
        if (isValidCell(oneSquareForward) && !this.board.getPieceOnCell(oneSquareForward)) {
            possibleMoves.push(oneSquareForward);
        }

        if ((this.color === 'white' && this.cell.row === 2) ||
            (this.color === 'black' && this.cell.row === 7)) {
            const twoSquaresForward = { row: this.cell.row + 2 * forwardDirection, col: this.cell.col };
            if (isValidCell(twoSquaresForward) && 
                !this.board.getPieceOnCell(twoSquaresForward) &&
                !this.board.getPieceOnCell(oneSquareForward)) {
                possibleMoves.push(twoSquaresForward);
            }
        }

        const captureDirections = [
            { row: forwardDirection, col: 1 },
            { row: forwardDirection, col: -1 }
        ];

        for (const dir of captureDirections) {
            const captureCell = { row: this.cell.row + dir.row, col: this.cell.col + dir.col };
            if (isValidCell(captureCell)) {
                const pieceOnTarget = this.board.getPieceOnCell(captureCell);
                if (pieceOnTarget && pieceOnTarget.color !== this.color) {
                    possibleMoves.push(captureCell);
                }
            }
        }

        const enPassantDirections = [
            { row: forwardDirection, col: 1 },
            { row: forwardDirection, col: -1 }
        ];

        for (const dir of enPassantDirections) {
            const enPassantCell = { row: this.cell.row + dir.row, col: this.cell.col + dir.col };
            if (this.canEnPassant(enPassantCell)) {
                possibleMoves.push(enPassantCell);
            }
        }

        return possibleMoves;
    }
}

module.exports = Pawn;
