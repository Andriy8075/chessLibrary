/**
 * Chess Library
 * 
 * Main entry point for the chess library.
 * Exports only the Game class for end users.
 * 
 * @example
 * const Game = require('chess');
 * const game = new Game();
 * const result = game.processRequest({
 *   type: 'move',
 *   from: { row: 2, col: 1 },
 *   to: { row: 4, col: 1 }
 * });
 */

const Game = require('./Game');

module.exports = Game;

