const invalidCells = require('../cellTests/invalidCells.js');

const getInvalidCellsTestCases = () => {
    const invalidFrom = invalidCells.map(cell => ({
        from: cell,
        to: { row: 3, col: 6 },
    }));

    const invalidTo = invalidCells.map(cell => ({
        from: { row: 3, col: 6 },
        to: cell,
    }));

    const sameCell = {
        from: { row: 3, col: 6 },
        to: { row: 3, col: 6 },
    }

    return [...invalidFrom, ...invalidTo, sameCell];
}

module.exports = getInvalidCellsTestCases;