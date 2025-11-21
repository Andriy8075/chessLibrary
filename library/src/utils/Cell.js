/**
 * Utility functions for working with chess board cells
 * Cells are represented as objects with row and col properties
 * Row and col are 1-indexed (1-8)
 */

/**
 * Creates a cell object
 * @param {number} row - Row number (1-8)
 * @param {number} col - Column number (1-8)
 * @returns {{row: number, col: number}} Cell object
 */
function createCell(row, col) {
    if (row < 1 || row > 8 || col < 1 || col > 8) {
        throw new Error(`Invalid cell coordinates: row=${row}, col=${col}`);
    }
    return { row, col };
}

/**
 * Checks if two cells are equal
 * @param {{row: number, col: number}} cell1 - First cell
 * @param {{row: number, col: number}} cell2 - Second cell
 * @returns {boolean} True if cells are equal
 */
function cellsEqual(cell1, cell2) {
    return cell1.row === cell2.row && cell1.col === cell2.col;
}

/**
 * Gets the distance between two cells
 * @param {{row: number, col: number}} cell1 - First cell
 * @param {{row: number, col: number}} cell2 - Second cell
 * @returns {{rowDiff: number, colDiff: number}} Distance object
 */
function getDistance(cell1, cell2) {
    return {
        rowDiff: cell2.row - cell1.row,
        colDiff: cell2.col - cell1.col
    };
}

/**
 * Checks if a cell is valid (within board bounds)
 * @param {{row: number, col: number}} cell - Cell to check
 * @returns {boolean} True if cell is valid
 */
function isValidCell(cell) {
    return cell && 
           typeof cell.row === 'number' && 
           typeof cell.col === 'number' &&
           cell.row >= 1 && cell.row <= 8 &&
           cell.col >= 1 && cell.col <= 8;
}

module.exports = {
    createCell,
    cellsEqual,
    getDistance,
    isValidCell
};

