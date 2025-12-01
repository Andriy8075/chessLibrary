BlackCanCaptureAndGoForward = {
    pieces: [
        {type: 'bishop', color: 'white', position: {row: 6, col: 4}},
        {type: 'knight', color: 'white', position: {row: 6, col: 6}},
        {type: 'pawn', color: 'black', position: {row: 7, col: 5}}
    ],    mainPiecePosition: {row: 7, col: 5},
    moves: [
        {row: 6, col: 5},
        {row: 5, col: 5},
        {row: 6, col: 4},
        {row: 6, col: 6}
    ]
}

module.exports = BlackCanCaptureAndGoForward;
