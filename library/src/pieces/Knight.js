const Piece = require('./Piece');
const { getDistance, isValidCell } = require('../utils/Cell');

/**
 * Knight piece class
 */
class Knight extends Piece {
    /**
     * Checks if knight can move to cell on empty board (L-shaped move)
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if knight can move to cell
     */
    canMoveToCellOnEmptyBoard(cellTo) {
        if (!isValidCell(cellTo)) return false;
        if (this.cell.row === cellTo.row && this.cell.col === cellTo.col) return false;

        const { rowDiff, colDiff } = getDistance(this.cell, cellTo);
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        // Knight moves in L-shape: 2 squares in one direction, 1 square perpendicular
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
    }

    /**
     * Checks if knight attacks the enemy king
     * @param {Board} board - Board instance
     * @returns {boolean} True if knight attacks enemy king
     */
    doesCheckToKing(board) {
        const enemyKing = board.getKing(this.getOppositeColor());
        if (!enemyKing) return false;
        return this.canMoveToCellOnEmptyBoard(enemyKing.cell);
    }

    /**
     * Finds all possible moves for knight
     * @param {Board} board - Board instance
     * @returns {Array<{row: number, col: number}>} Array of possible move cells
     */
    findAllPossibleMoves(board) {
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
                const pieceOnTarget = board.getPieceOnCell(targetCell);

                // Can move if cell is empty or contains enemy piece
                if (!pieceOnTarget || pieceOnTarget.color !== this.color) {
                    possibleMoves.push(targetCell);
                }
            }
        }

        return possibleMoves;
    }
}

module.exports = Knight;

