const CheckDetector = require('./CheckDetector');

class GameEndDetector {
    static hasLegalMoves(color, board) {
        const arrangement = board.getArrangement();
        
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = arrangement[row - 1][col - 1];
                if (piece && piece.color === color) {
                    const possibleMoves = piece.findAllPossibleMoves(board);
                    for (const move of possibleMoves) {
                        const MoveValidator = require('./MoveValidator');
                        if (!MoveValidator.wouldMoveCauseCheck(piece.cell, move, color, board)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }

    static checkForCheckmateAfterMove(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        const movingColor = piece.color;
        const opponentColor = movingColor === 'white' ? 'black' : 'white';
        
        board._movePiece(cellFrom, cellTo);
        
        const kingInCheck = CheckDetector.isKingInCheck(opponentColor, board);
        
        const hasMoves = this.hasLegalMoves(opponentColor, board);
        
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return kingInCheck && !hasMoves;
    }

    static checkForStalemateAfterMove(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        const movingColor = piece.color;
        const opponentColor = movingColor === 'white' ? 'black' : 'white';
        
        board._movePiece(cellFrom, cellTo);
        
        const kingInCheck = CheckDetector.isKingInCheck(opponentColor, board);
        
        const hasMoves = this.hasLegalMoves(opponentColor, board);
        
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return !kingInCheck && !hasMoves;
    }

    static enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        
        board._movePiece(cellFrom, cellTo);
        if (capturedPiece) {
            board._removePiece(cellTo);
        }
        
        const arrangement = board.getArrangement();
        const pieces = [];
        
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const p = arrangement[row - 1][col - 1];
                if (p) {
                    pieces.push(p);
                }
            }
        }
        
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        if (pieces.length <= 2) {
            return false;
        }
        
        const whitePieces = pieces.filter(p => p.color === 'white');
        const blackPieces = pieces.filter(p => p.color === 'black');
        
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
