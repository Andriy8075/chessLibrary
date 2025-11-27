CanNotGoOverOtherPieces = {
    board: [
        {type: 'queen', color: 'white', position: {row: 2, col: 3}},
        {type: 'bishop', color: 'white', position: {row: 3, col: 2}},
        {type: 'knight', color: 'black', position: {row: 5, col: 4}}
    ],    mainPiecePosition: {row: 3, col: 2},
    moves: [
        {row: 2, col: 1},
        {row: 4, col: 1},
        {row: 4, col: 3},
        {row: 5, col: 4}
    ]
}

module.exports = CanNotGoOverOtherPieces;
