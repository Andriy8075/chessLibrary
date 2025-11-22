function createCell(row, col) {
    if (row < 1 || row > 8 || col < 1 || col > 8) {
        throw new Error(`Invalid cell coordinates: row=${row}, col=${col}`);
    }
    return { row, col };
}

function cellsEqual(cell1, cell2) {
    return cell1.row === cell2.row && cell1.col === cell2.col;
}

function getDistance(cell1, cell2) {
    return {
        rowDiff: cell2.row - cell1.row,
        colDiff: cell2.col - cell1.col
    };
}

function isValidCell(cell) {
    return cell && 
           typeof cell.row === 'number' && 
           typeof cell.col === 'number' &&
           cell.row >= 1 && cell.row <= 8 &&
           cell.col >= 1 && cell.col <= 8 &&
           Object.keys(cell).length === 2;
}

module.exports = {
    createCell,
    cellsEqual,
    getDistance,
    isValidCell
};
