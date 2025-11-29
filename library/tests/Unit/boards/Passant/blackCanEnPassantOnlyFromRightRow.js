BlackCanEnPassantOnlyFromRightRow = {
    pieces: [
        {type: 'pawn', color: 'white', position: {row: 4, col: 1}},
        {type: 'pawn', color: 'black', position: {row: 7, col: 2}}
    ],    mainPiecePosition: {row: 7, col: 2},
    moves: [
        {row: 6, col: 2},
        {row: 5, col: 2}
    ],
    extraInfo: {
        enPassantTarget: {row: 3, col: 1},
    }

}

module.exports = BlackCanEnPassantOnlyFromRightRow;
