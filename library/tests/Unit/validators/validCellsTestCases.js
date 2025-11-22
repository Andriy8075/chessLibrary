const getValidCellsTestCases = () => {
    return [
        {
            from: { row: 1, col: 1 },
            to: { row: 2, col: 2 },
        },
        {
            from: { row: 2, col: 1 },
            to: { row: 2, col: 2 },
        },
        {
            from: { row: 1, col: 8 },
            to: { row: 8, col: 1 },
        },
        {
            from: { row: 8, col: 8 },
            to: { row: 1, col: 1 },
        },
    ]
}

module.exports = getValidCellsTestCases;
