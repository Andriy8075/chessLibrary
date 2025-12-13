const King = require('../pieces/King');
const Queen = require('../pieces/Queen');
const Rook = require('../pieces/Rook');
const Bishop = require('../pieces/Bishop');
const Knight = require('../pieces/Knight');
const Pawn = require('../pieces/Pawn');

function pieceClassProvider(pieceName) {
    pieceName = pieceName.toLowerCase();
    switch (pieceName) {
        case 'king':
            return King;
        case 'queen':
            return Queen;
        case 'rook':
            return Rook;
        case 'bishop':
            return Bishop;
        case 'knight':
            return Knight;
        case 'pawn':
            return Pawn;
        default:
            throw new Error(`Invalid piece name: ${pieceName}`);
    }
}

module.exports = pieceClassProvider;