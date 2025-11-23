const positions = [
    { position: { row: 4, col: 3 }, moves: [
        { row: 6, col: 4 },
        { row: 6, col: 2 },
        { row: 5, col: 5 },
        { row: 5, col: 1 },
        { row: 2, col: 4 },
        { row: 2, col: 2 },
        { row: 3, col: 5 },
        { row: 3, col: 1 }]
     },
     { position: { row: 4, col: 7 }, moves: [ // knight near the edge of the board
        { row: 6, col: 6 },
        { row: 6, col: 8 },
        { row: 5, col: 5 },
        { row: 3, col: 5 },
        { row: 2, col: 6 },
        { row: 2, col: 8 }]
    },
    { position: { row: 4, col: 8 }, moves: [ // knight on the edge of the board
        { row: 6, col: 7 },
        { row: 5, col: 6 },
        { row: 2, col: 7 },
        { row: 3, col: 6 }]
    },
    { position: {row: 2, col: 2}, moves: [ // knight near both edges of the board
        { row: 4, col: 3 },
        { row: 4, col: 1 },
        { row: 3, col: 4 },
        { row: 1, col: 4 }]
    },
    { position: {row: 1, col: 7}, moves: [ // knight in one edge and near another edge
        { row: 3, col: 6 },
        { row: 3, col: 8 },
        { row: 2, col: 5 }]
    },
    { position: {row: 8, col: 8}, moves: [ // in the very corner of the board
        { row: 6, col: 7 },
        { row: 7, col: 6 }]
    },
]

module.exports = positions;