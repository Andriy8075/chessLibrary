CanEnPassantOnlyNeighbourColumns = {
    pieces: [
        {type: 'pawn', color: 'black', position: {row: 4, col: 2}},
        {type: 'pawn', color: 'white', position: {row: 4, col: 4}}
    ],    mainPiecePosition: {row: 4, col: 2},
    moves: [
        {row: 3, col: 2}
    ],
    extraInfo: {
        enPassantTarget: {row: 3, col: 4},
    }

}

module.exports = CanEnPassantOnlyNeighbourColumns;
