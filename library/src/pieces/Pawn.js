const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

class Pawn extends Piece {
    canMoveToCellOnEmptyBoard(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);

        if (this.color === 'white') {
            if (rowDiff <= 0) return false;
            if (colDiff !== 0) return false;
            if (rowDiff > 2) return false;
            if (rowDiff === 2 && this.cell.row !== 2) return false;
        } else {
            if (rowDiff >= 0) return false;
            if (colDiff !== 0) return false;
            if (Math.abs(rowDiff) > 2) return false;
            if (Math.abs(rowDiff) === 2 && this.cell.row !== 7) return false;
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

    canEnPassant(cellTo, board) {
        if (!this.canCaptureAt(cellTo)) return false;

        const enPassantTarget = board.getEnPassantTarget();
        if (!enPassantTarget) return false;

        const enPassantRow = this.color === 'white' ? this.cell.row + 1 : this.cell.row - 1;
        return enPassantTarget.row === enPassantRow && enPassantTarget.col === cellTo.col;
    }

    canPromote(cellTo) {
        if (!isValidCell(cellTo)) return false;

        if (this.color === 'white') {
            return cellTo.row === 8;
        } else {
            return cellTo.row === 1;
        }
    }

    doesCheckToKing(board) {
        const enemyKing = board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;

        return this.canCaptureAt(enemyKing.cell);
    }

    findAllPossibleMoves(board) {
        const possibleMoves = [];

        const forwardDirection = this.color === 'white' ? 1 : -1;
        
        const oneSquareForward = { row: this.cell.row + forwardDirection, col: this.cell.col };
        if (isValidCell(oneSquareForward) && !board.getPieceOnCell(oneSquareForward)) {
            possibleMoves.push(oneSquareForward);
        }

        if ((this.color === 'white' && this.cell.row === 2) ||
            (this.color === 'black' && this.cell.row === 7)) {
            const twoSquaresForward = { row: this.cell.row + 2 * forwardDirection, col: this.cell.col };
            if (isValidCell(twoSquaresForward) && 
                !board.getPieceOnCell(twoSquaresForward) &&
                !board.getPieceOnCell(oneSquareForward)) {
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
                const pieceOnTarget = board.getPieceOnCell(captureCell);
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
            if (this.canEnPassant(enPassantCell, board)) {
                possibleMoves.push(enPassantCell);
            }
        }

        return possibleMoves;
    }
}

module.exports = Pawn;
