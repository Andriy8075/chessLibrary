const CheckDetector = require('./CheckDetector');
const MoveValidator = require('./MoveValidator');

class GameEndDetector {
    static hasLegalMoves(color, board) {
        const arrangement = board.getArrangement();
        
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = arrangement[row - 1][col - 1];
                if (piece && piece.color === color) {
                    const possibleMoves = piece.findAllPossibleMoves();
                    for (const move of possibleMoves) {
                        if (!MoveValidator.wouldMoveCauseCheck(piece.cell, move, board)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }

    static checkForCheckmateOrStalemateAfterMove(cellTo, board) {
        const pieceAtDest = board.getPieceOnCell(cellTo);
        
        let movingColor;
        let opponentColor;
        
        movingColor = pieceAtDest.color;
        opponentColor = movingColor === 'white' ? 'black' : 'white';
        
        const hasMoves = this.hasLegalMoves(opponentColor, board);

        if (!hasMoves) {
            const kingInCheck = CheckDetector.isKingInCheck(opponentColor, board);
            return kingInCheck ? 'checkmate' : 'stalemate';
        }
    }

    static enoughPiecesAfterMoveToContinueGame(board) {
        
        const pieces = [];
        const arrangement = board.getArrangement();
            
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const p = arrangement[row - 1][col - 1];
                if (p) {
                    pieces.push(p);
                }
            }
        }
        
        if (pieces.length <= 2) {
            return false;
        }
        
        const whitePieces = pieces.filter(p => p.color === 'white');
        const blackPieces = pieces.filter(p => p.color === 'black');

        // using FIDE rules for insufficient material. 
        // Draw only if checkmate is impossible even with cooperation of both sides.
        if (whitePieces.length === 1 && blackPieces.length === 2) {
            const minorPiece = blackPieces.find(p => p.constructor.name === 'Bishop' || p.constructor.name === 'Knight');
            if (minorPiece) return false;
        }
        if (blackPieces.length === 1 && whitePieces.length === 2) {
            const minorPiece = whitePieces.find(p => p.constructor.name === 'Bishop' || p.constructor.name === 'Knight');
            if (minorPiece) return false;
        }
        
        if (whitePieces.length === 2 && blackPieces.length === 2) {
            const whiteBishop = whitePieces.find(p => p.constructor.name === 'Bishop');
            const blackBishop = blackPieces.find(p => p.constructor.name === 'Bishop');
            if (whiteBishop && blackBishop) {
                const whiteBishopSquareColor = (whiteBishop.cell.row + whiteBishop.cell.col) % 2;
                const blackBishopSquareColor = (blackBishop.cell.row + blackBishop.cell.col) % 2;
                if (whiteBishopSquareColor === blackBishopSquareColor) {
                    return false;
                }
            }
        }
        
        return true;
    }
}

module.exports = GameEndDetector;
