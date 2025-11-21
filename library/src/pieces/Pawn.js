const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

/**
 * Pawn piece class
 */
class Pawn extends Piece {
    /**
     * Checks if pawn can move to cell on empty board
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if pawn can move to cell (forward move only, no capture)
     */
    canMoveToCellOnEmptyBoard(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);

        // Pawns move forward only
        if (this.color === 'white') {
            // White pawns move up (row increases)
            if (rowDiff <= 0) return false;
            // Can move 1 or 2 squares forward on same column
            if (colDiff !== 0) return false;
            // Can move 2 squares only from starting position (row 2)
            if (rowDiff > 2) return false;
            if (rowDiff === 2 && this.cell.row !== 2) return false;
        } else {
            // Black pawns move down (row decreases)
            if (rowDiff >= 0) return false;
            // Can move 1 or 2 squares forward on same column
            if (colDiff !== 0) return false;
            // Can move 2 squares only from starting position (row 7)
            if (Math.abs(rowDiff) > 2) return false;
            if (Math.abs(rowDiff) === 2 && this.cell.row !== 7) return false;
        }

        return true;
    }

    /**
     * Checks if pawn can capture on diagonal
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if pawn can capture at cell
     */
    canCaptureAt(cellTo) {
        if (!isValidCell(cellTo)) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);

        if (this.color === 'white') {
            // White pawns capture diagonally up-right or up-left
            return rowDiff === 1 && Math.abs(colDiff) === 1;
        } else {
            // Black pawns capture diagonally down-right or down-left
            return rowDiff === -1 && Math.abs(colDiff) === 1;
        }
    }

    /**
     * Checks if pawn can perform en passant
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {Board} board - Board instance
     * @returns {boolean} True if en passant is possible
     */
    canEnPassant(cellTo, board) {
        if (!this.canCaptureAt(cellTo)) return false;

        // Check if en passant target exists
        const enPassantTarget = board.getEnPassantTarget();
        if (!enPassantTarget) return false;

        // En passant target should be in the row between current and target
        const enPassantRow = this.color === 'white' ? this.cell.row + 1 : this.cell.row - 1;
        return enPassantTarget.row === enPassantRow && enPassantTarget.col === cellTo.col;
    }

    /**
     * Checks if pawn can promote
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if pawn reaches promotion rank
     */
    canPromote(cellTo) {
        if (!isValidCell(cellTo)) return false;

        if (this.color === 'white') {
            return cellTo.row === 8;
        } else {
            return cellTo.row === 1;
        }
    }

    /**
     * Checks if pawn attacks the enemy king
     * @param {Board} board - Board instance
     * @returns {boolean} True if pawn attacks enemy king
     */
    doesCheckToKing(board) {
        const enemyKing = board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;

        return this.canCaptureAt(enemyKing.cell);
    }

    /**
     * Finds all possible moves for pawn
     * @param {Board} board - Board instance
     * @returns {Array<{row: number, col: number}>} Array of possible move cells
     */
    findAllPossibleMoves(board) {
        const possibleMoves = [];

        // Forward moves
        const forwardDirection = this.color === 'white' ? 1 : -1;
        
        // One square forward
        const oneSquareForward = { row: this.cell.row + forwardDirection, col: this.cell.col };
        if (isValidCell(oneSquareForward) && !board.getPieceOnCell(oneSquareForward)) {
            possibleMoves.push(oneSquareForward);
        }

        // Two squares forward (only from starting position)
        if ((this.color === 'white' && this.cell.row === 2) ||
            (this.color === 'black' && this.cell.row === 7)) {
            const twoSquaresForward = { row: this.cell.row + 2 * forwardDirection, col: this.cell.col };
            if (isValidCell(twoSquaresForward) && 
                !board.getPieceOnCell(twoSquaresForward) &&
                !board.getPieceOnCell(oneSquareForward)) {
                possibleMoves.push(twoSquaresForward);
            }
        }

        // Diagonal captures
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

        // En passant
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

