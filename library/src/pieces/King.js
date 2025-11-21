const Piece = require('./Piece');
const { getDistance, isValidCell, cellsEqual } = require('../utils/Cell');
const Rook = require('./Rook');

/**
 * King piece class
 */
class King extends Piece {
    /**
     * Checks if king can move to cell on empty board (one square in any direction)
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if king can move to cell
     */
    canMoveToCellOnEmptyBoard(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        // King moves one square in any direction
        return absRowDiff <= 1 && absColDiff <= 1 && (absRowDiff !== 0 || absColDiff !== 0);
    }

    /**
     * Checks if king can castle to the specified cell
     * @param {{row: number, col: number}} cellTo - Target cell (king's destination)
     * @param {Board} board - Board instance
     * @returns {boolean} True if castling is possible
     */
    tryCastle(cellTo, board) {
        // King must be on starting position
        const kingStartRow = this.color === 'white' ? 1 : 8;
        if (this.cell.row !== kingStartRow || this.cell.col !== 5) return false;

        // King must not have moved
        if (board.hasPieceMoved(this.color, 'king')) return false;

        // Determine castling direction
        const colDiff = cellTo.col - this.cell.col;
        if (Math.abs(colDiff) !== 2) return false; // King moves 2 squares for castling

        const isKingside = colDiff > 0;
        const rookCol = isKingside ? 8 : 1;
        const rookCell = { row: kingStartRow, col: rookCol };

        // Rook must be on starting position
        const rook = board.getPieceOnCell(rookCell);
        if (!rook || !(rook instanceof Rook) || rook.color !== this.color) return false;

        // Rook must not have moved
        if (board.hasPieceMoved(this.color, isKingside ? 'kingsideRook' : 'queensideRook')) return false;

        // Path must be clear
        const pathStartCol = isKingside ? 6 : 2;
        const pathEndCol = isKingside ? 7 : 4;
        for (let col = pathStartCol; col <= pathEndCol; col++) {
            const pathCell = { row: kingStartRow, col };
            if (board.getPieceOnCell(pathCell)) return false;
        }

        // King must not be in check
        if (board.isKingInCheck(this.color)) return false;

        // King must not pass through check
        const intermediateCol = isKingside ? 6 : 3;
        const intermediateCell = { row: kingStartRow, col: intermediateCol };
        if (board.wouldMoveCauseCheck(this.cell, intermediateCell, this.color)) return false;

        return true;
    }

    /**
     * Checks if this king is in check
     * @param {Board} board - Board instance
     * @returns {boolean} True if king is in check
     */
    doesCheckToKing(board) {
        // This method is called on the enemy king, so we check if this king is attacked
        return board.isSquareAttacked(this.cell, this.getOppositeColor());
    }

    /**
     * Finds all possible moves for king
     * @param {Board} board - Board instance
     * @returns {Array<{row: number, col: number}>} Array of possible move cells
     */
    findAllPossibleMoves(board) {
        const possibleMoves = [];
        const directions = [
            { row: 1, col: 0 },   // Up
            { row: -1, col: 0 },  // Down
            { row: 0, col: 1 },   // Right
            { row: 0, col: -1 },  // Left
            { row: 1, col: 1 },   // Up-right
            { row: 1, col: -1 },  // Up-left
            { row: -1, col: 1 },  // Down-right
            { row: -1, col: -1 }  // Down-left
        ];

        // Regular moves
        for (const dir of directions) {
            const newRow = this.cell.row + dir.row;
            const newCol = this.cell.col + dir.col;

            if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                const targetCell = { row: newRow, col: newCol };
                const pieceOnTarget = board.getPieceOnCell(targetCell);

                // Can move if cell is empty or contains enemy piece
                if (!pieceOnTarget || pieceOnTarget.color !== this.color) {
                    possibleMoves.push(targetCell);
                }
            }
        }

        // Castling moves
        const kingStartRow = this.color === 'white' ? 1 : 8;
        if (this.cell.row === kingStartRow && this.cell.col === 5) {
            // Kingside castling
            const kingsideCell = { row: kingStartRow, col: 7 };
            if (this.tryCastle(kingsideCell, board)) {
                possibleMoves.push(kingsideCell);
            }

            // Queenside castling
            const queensideCell = { row: kingStartRow, col: 3 };
            if (this.tryCastle(queensideCell, board)) {
                possibleMoves.push(queensideCell);
            }
        }

        return possibleMoves;
    }
}

module.exports = King;

