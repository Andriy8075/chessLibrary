CanCaptureEnemyPieces = {
    pieces: [
        {type: 'queen', color: 'black', position: {row: 2, col: 1}},
        {type: 'bishop', color: 'white', position: {row: 3, col: 2}},
        {type: 'bishop', color: 'black', position: {row: 4, col: 1}}
    ],    mainPiecePosition: {row: 3, col: 2},
    moves: [
        {row: 2, col: 1},
        {row: 2, col: 3},
        {row: 1, col: 4},
        {row: 4, col: 3},
        {row: 5, col: 4},
        {row: 6, col: 5},
        {row: 7, col: 6},
        {row: 8, col: 7},
        {row: 4, col: 1}
    ]
}

module.exports = CanCaptureEnemyPieces;
