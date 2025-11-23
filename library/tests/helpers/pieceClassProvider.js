const King = require('../../src/pieces/King');
const Queen = require('../../src/pieces/Queen');
const Rook = require('../../src/pieces/Rook');
const Bishop = require('../../src/pieces/Bishop');
const Knight = require('../../src/pieces/Knight');
const Pawn = require('../../src/pieces/Pawn');

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