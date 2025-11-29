WhiteCanNotEnPassantWhenTargetColumnIsWrong = {
    pieces: [
        {type: 'pawn', color: 'black', position: {row: 5, col: 3}},
        {type: 'pawn', color: 'white', position: {row: 5, col: 4}}
    ],    mainPiecePosition: {row: 5, col: 4},
    moves: [
        {row: 6, col: 4}
    ],
    extraInfo: {
        enPassantTarget: {row: 6, col: 2},
    }

}

module.exports = WhiteCanNotEnPassantWhenTargetColumnIsWrong;
