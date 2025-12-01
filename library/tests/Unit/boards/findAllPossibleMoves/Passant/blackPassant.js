BlackPassant = {
    pieces: [
        {type: 'pawn', color: 'white', position: {row: 4, col: 1}},
        {type: 'pawn', color: 'black', position: {row: 4, col: 2}}
    ],    mainPiecePosition: {row: 4, col: 2},
    moves: [
        {row: 3, col: 2},
        {row: 3, col: 1}
    ],
    extraInfo: {
        enPassantTarget: {row: 3, col: 1},
    }

}

module.exports = BlackPassant;
