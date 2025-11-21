const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

/**
 * Bishop piece class
 */
class Bishop extends Piece {
    /**
     * Checks if bishop can move to cell on empty board (diagonal move)
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if bishop can move to cell
     */
    canMoveToCellOnEmptyBoard(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        // Bishop moves diagonally: row and col differences must be equal in absolute value
        return Math.abs(rowDiff) === Math.abs(colDiff);
    }

    /**
     * Checks if bishop attacks the enemy king
     * @param {Board} board - Board instance
     * @returns {boolean} True if bishop attacks enemy king
     */
    doesCheckToKing(board) {
        const enemyKing = board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;

        if (!this.canMoveToCellOnEmptyBoard(enemyKing.cell)) return false;

        // Check if path is clear
        return board.isPathClear(this.cell, enemyKing.cell);
    }

    /**
     * Finds all possible moves for bishop
     * @param {Board} board - Board instance
     * @returns {Array<{row: number, col: number}>} Array of possible move cells
     */
    findAllPossibleMoves(board) {
        const possibleMoves = [];
        const directions = [
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

module.exports = Bishop;

