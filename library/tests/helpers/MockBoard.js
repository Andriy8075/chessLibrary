const { isValidCell } = require('../../src/utils/Cell');
const pieceClassProvider = require('./pieceClassProvider');
const CheckDetector = require('../../src/board/CheckDetector');
const Board = require('../../src/board/Board');

class MockBoard extends Board {
    constructor(additionalPieces = [], extraInfo = {}) {
        super();
        
        this.arrangement = Array(8).fill(null).map(() => Array(8).fill(null));
        
        this.extraInfo = {
            piecesMadeMoves: {
                whiteKing: false,
                blackKing: false,
                whiteKingsideRook: false,
                whiteQueensideRook: false,
                blackKingsideRook: false,
                blackQueensideRook: false,
                ...(extraInfo.piecesMadeMoves || {})
            },
            enPassantTarget: extraInfo.enPassantTarget !== undefined ? extraInfo.enPassantTarget : null
        };
        
        // Place custom pieces
        for (const piece of additionalPieces) {
            const pieceClass = pieceClassProvider(piece.type);
            this.arrangement[piece.position.row - 1][piece.position.col - 1] = new pieceClass(piece.color, piece.position, this);
        }
    }
}

module.exports = MockBoard;

