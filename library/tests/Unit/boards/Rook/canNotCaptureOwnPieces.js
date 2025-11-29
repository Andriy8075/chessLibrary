CanNotCaptureOwnPieces = {
    pieces: [
        {type: 'bishop', color: 'white', position: {row: 4, col: 3}},
        {type: 'knight', color: 'white', position: {row: 5, col: 2}},
        {type: 'rook', color: 'white', position: {row: 5, col: 3}},
        {type: 'knight', color: 'white', position: {row: 6, col: 3}}
    ],    mainPiecePosition: {row: 5, col: 3},
    moves: [
        {row: 5, col: 4},
        {row: 5, col: 5},
        {row: 5, col: 6},
        {row: 5, col: 7},
        {row: 5, col: 8}
    ]
}

module.exports = CanNotCaptureOwnPieces;
