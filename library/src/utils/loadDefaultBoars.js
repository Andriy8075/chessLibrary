const Board = require('../board/Board');

function loadDefaultBoard() {
    const pieces = [{type: 'rook', color: 'white', position: { row: 1, col: 1 }},
        {type: 'rook', color: 'white', position: { row: 1, col: 8 }},
        {type: 'rook', color: 'black', position: { row: 8, col: 1 }},
        {type: 'rook', color: 'black', position: { row: 8, col: 8 }},
        {type: 'knight', color: 'white', position: { row: 1, col: 2 }},
        {type: 'knight', color: 'white', position: { row: 1, col: 7 }},
        {type: 'knight', color: 'black', position: { row: 8, col: 2 }},
        {type: 'knight', color: 'black', position: { row: 8, col: 7 }},
        {type: 'bishop', color: 'white', position: { row: 1, col: 3 }},
        {type: 'bishop', color: 'white', position: { row: 1, col: 6 }},
        {type: 'bishop', color: 'black', position: { row: 8, col: 3 }},
        {type: 'bishop', color: 'black', position: { row: 8, col: 6 }},
        {type: 'king', color: 'white', position: { row: 1, col: 5 }},
        {type: 'king', color: 'black', position: { row: 8, col: 5 }},
        {type: 'queen', color: 'white', position: { row: 1, col: 4 }},
        {type: 'queen', color: 'black', position: { row: 8, col: 4 }}];
    for (let col = 1; col <= 8; col++) {
        pieces.push({type: 'pawn', color: 'white', position: { row: 2, col }});
        pieces.push({type: 'pawn', color: 'black', position: { row: 7, col }});
    }
    return new Board(pieces);
}

module.exports = loadDefaultBoard;