WhiteCanEnPassantOnlyNeighbourColumns = {
    pieces: [
        {type: 'pawn', color: 'white', position: {row: 5, col: 1}},
        {type: 'pawn', color: 'black', position: {row: 5, col: 3}}
    ],    mainPiecePosition: {row: 5, col: 1},
    moves: [
        {row: 6, col: 1}
    ],
    extraInfo: {
        enPassantTarget: {row: 6, col: 3},
    }

}

module.exports = WhiteCanEnPassantOnlyNeighbourColumns;
