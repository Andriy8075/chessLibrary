const MockBoard = require('../MockBoard');

const KnightAndPawn = {
    board: new MockBoard([
        {type: 'knight', color: 'black', position: {row: 4, col: 3}},
        {type: 'pawn', color: 'white', position: {row: 5, col: 4}}
    ]),
    moves: [
        {row: 6, col: 4},
        {row: 6, col: 2},
        {row: 2, col: 4},
        {row: 2, col: 2}
    ]
}

module.exports = KnightAndPawn;