const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

/**
 * Queen piece class
 */
class Queen extends Piece {
    /**
     * Checks if queen can move to cell on empty board (horizontal, vertical, or diagonal)
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if queen can move to cell
     */
    canMoveToCellOnEmptyBoard(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        // Queen moves like rook (horizontal/vertical) or bishop (diagonal)
        return (absRowDiff === 0 && absColDiff !== 0) ||  // Horizontal
               (absRowDiff !== 0 && absColDiff === 0) ||  // Vertical
               (absRowDiff === absColDiff);                // Diagonal
    }

    /**
     * Checks if queen attacks the enemy king
     * @param {Board} board - Board instance
     * @returns {boolean} True if queen attacks enemy king
     */
    doesCheckToKing(board) {
        const enemyKing = board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;

        if (!this.canMoveToCellOnEmptyBoard(enemyKing.cell)) return false;

        // Check if path is clear
        return board.isPathClear(this.cell, enemyKing.cell);
    }

    /**
     * Finds all possible moves for queen
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

        for (const dir of directions) {
            for (let i = 1; i <= 7; i++) {
                const newRow = this.cell.row + dir.row * i;
                const newCol = this.cell.col + dir.col * i;

                if (newRow < 1 || newRow > 8 || newCol < 1 || newCol > 8) break;

                const targetCell = { row: newRow, col: newCol };
                const pieceOnTarget = board.getPieceOnCell(targetCell);

                if (!pieceOnTarget) {
                    possibleMoves.push(targetCell);
                } else {
                    // Can capture enemy piece
                    if (pieceOnTarget.color !== this.color) {
                        possibleMoves.push(targetCell);
                    }
                    break; // Blocked by piece
                }
            }
        }

        return possibleMoves;
    }
}

module.exports = Queen;

