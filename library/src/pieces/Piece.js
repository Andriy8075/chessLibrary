const { isValidCell } = require('../utils/Cell');

/**
 * Base class for all chess pieces
 */
class Piece {
    /**
     * @param {string} color - 'white' or 'black'
     * @param {{row: number, col: number}} cell - Initial position
     */
    constructor(color, cell) {
        if (color !== 'white' && color !== 'black') {
            throw new Error(`Invalid color: ${color}. Must be 'white' or 'black'`);
        }
        if (!isValidCell(cell)) {
            throw new Error(`Invalid cell: ${JSON.stringify(cell)}`);
        }
        this.color = color;
        this.cell = cell;
    }

    /**
     * Gets the opposite color
     * @returns {string} 'white' or 'black'
     */
    getOppositeColor() {
        return this.color === 'white' ? 'black' : 'white';
    }

    /**
     * Checks if this piece can move to a cell on an empty board
     * Must be implemented by subclasses
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if piece can move to cell
     */
    canMoveToCellOnEmptyBoard(cellTo) {
        throw new Error('canMoveToCellOnEmptyBoard must be implemented by subclass');
    }

    /**
     * Checks if this piece attacks the enemy king
     * Must be implemented by subclasses
     * @param {Board} board - Board instance
     * @returns {boolean} True if piece attacks enemy king
     */
    doesCheckToKing(board) {
        throw new Error('doesCheckToKing must be implemented by subclass');
    }

    /**
     * Finds all possible moves for this piece
     * Must be implemented by subclasses
     * @param {Board} board - Board instance
     * @returns {Array<{row: number, col: number}>} Array of possible move cells
     */
    findAllPossibleMoves(board) {
        throw new Error('findAllPossibleMoves must be implemented by subclass');
    }

    /**
     * Updates the piece's position
     * @param {{row: number, col: number}} newCell - New position
     */
    updatePosition(newCell) {
        if (!isValidCell(newCell)) {
            throw new Error(`Invalid cell: ${JSON.stringify(newCell)}`);
        }
        this.cell = newCell;
    }
}

module.exports = Piece;

