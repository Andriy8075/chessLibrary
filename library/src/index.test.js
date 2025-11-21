/**
 * Test exports for the chess library
 * 
 * This file exports all classes needed for testing:
 * - Game class
 * - Board class
 * - All piece classes
 * 
 * Tests should import from this file to access internal classes.
 */

const Game = require('./Game');
const Board = require('./board/Board');
const Piece = require('./pieces/Piece');
const King = require('./pieces/King');
const Queen = require('./pieces/Queen');
const Rook = require('./pieces/Rook');
const Bishop = require('./pieces/Bishop');
const Knight = require('./pieces/Knight');
const Pawn = require('./pieces/Pawn');

module.exports = {
    Game,
    Board,
    Piece,
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn
};

