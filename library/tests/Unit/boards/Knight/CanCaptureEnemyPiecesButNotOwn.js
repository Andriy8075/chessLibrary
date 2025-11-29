CanCaptureEnemyPiecesButNotOwn = {
    pieces: [
        {type: 'knight', color: 'white', position: {row: 3, col: 2}},
        {type: 'queen', color: 'white', position: {row: 3, col: 4}},
        {type: 'bishop', color: 'white', position: {row: 4, col: 1}},
        {type: 'knight', color: 'black', position: {row: 5, col: 3}},
        {type: 'knight', color: 'black', position: {row: 6, col: 1}},
        {type: 'pawn', color: 'white', position: {row: 7, col: 2}},
        {type: 'rook', color: 'black', position: {row: 7, col: 4}}
    ],    mainPiecePosition: {row: 5, col: 3},
    moves: [
        {row: 3, col: 2},
        {row: 4, col: 1},
        {row: 3, col: 4},
        {row: 4, col: 5},
        {row: 6, col: 5},
        {row: 7, col: 2}
    ]
}

module.exports = CanCaptureEnemyPiecesButNotOwn;
