const getValidCellsTestCases = () => {
    return [
        {
            from: { row: 1, col: 1 },
            to: { row: 2, col: 2 },
            color: 'white',
            type: 'move',
        },
        {
            from: { row: 2, col: 1 },
            to: { row: 2, col: 2 },
            color: 'white',
            type: 'move',
        },
        {
            from: { row: 1, col: 8 },
            to: { row: 8, col: 1 },
            color: 'black',
            type: 'move',
        },
        {
            from: { row: 8, col: 8 },
            to: { row: 1, col: 1 },
            color: 'black',
            type: 'move',
        },
    ]
}

module.exports = getValidCellsTestCases;
