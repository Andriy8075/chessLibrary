const invalidCells = require('../cellTests/invalidCells.js');

const getInvalidCellsTestCases = () => {
    const invalidFrom = invalidCells.map(cell => ({
        from: cell,
        to: { row: 3, col: 6 },
        color: 'white',
        type: 'move',
    }));

    const invalidTo = invalidCells.map(cell => ({
        from: { row: 3, col: 6 },
        to: cell,
        color: 'white',
        type: 'move',
    }));

    const invalidColor = {
        from: { row: 3, col: 6 },
        to: { row: 3, col: 6 },
        color: 'invalid',
        type: 'move',
    }

    const sameCell = {
        from: { row: 3, col: 6 },
        to: { row: 3, col: 6 },
        color: 'white',
        type: 'move',
    }

    return [...invalidFrom, ...invalidTo, sameCell, invalidColor];
}

module.exports = getInvalidCellsTestCases;