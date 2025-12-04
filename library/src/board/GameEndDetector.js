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

    static checkForFiftyMoveRuleAfterMove(moveHistory) {
        if (!moveHistory || moveHistory.length < 100) {
            return null;
        }

        // Check last 100 half-moves (50 full moves)
        const last100Moves = moveHistory.slice(-100);
        
        // Check if any of the last 50 moves involved a pawn move or capture
        for (let i = last100Moves.length - 1; i >= 0; i--) {
            const move = last100Moves[i];
            if (move.wasPawnMove || move.wasCapture) {
                return null; // Reset found, not 50-move rule
            }
        }

        // No pawn move or capture in last 50 moves (100 half-moves)
        return 'fiftyMoveRule';
    }

    static _getPositionSignature(board, currentTurn) {
        // Create a unique signature for the board position including:
        // - Piece positions
        // - Castling rights
        // - En passant target
        // - Current turn
        
        const arrangement = board.getSerializedState();
        const extraInfo = board.extraInfo;
        
        // Create position string
        let positionStr = '';
        
        // Add piece positions in canonical order (row by row, col by col)
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = arrangement[row - 1][col - 1];
                if (piece) {
                    positionStr += `${piece.type}-${piece.color}-${row}-${col}|`;
                }
            }
        }
        
        // Add castling rights (store actual state of piecesMadeMoves for unique position signature)
        const castlingRights = extraInfo.piecesMadeMoves;
        positionStr += `castling:${castlingRights.whiteKing ? '1' : '0'}${castlingRights.blackKing ? '1' : '0'}`;
        positionStr += `${castlingRights.whiteKingsideRook ? '1' : '0'}${castlingRights.whiteQueensideRook ? '1' : '0'}`;
        positionStr += `${castlingRights.blackKingsideRook ? '1' : '0'}${castlingRights.blackQueensideRook ? '1' : '0'}|`;
        
        // Add en passant target
        const enPassantTarget = extraInfo.enPassantTarget;
        if (enPassantTarget) {
            positionStr += `ep:${enPassantTarget.row}-${enPassantTarget.col}|`;
        } else {
            positionStr += 'ep:null|';
        }
        
        // Add current turn
        positionStr += `turn:${currentTurn}`;
        
        return positionStr;
    }

    static checkForThreefoldRepetitionAfterMove(board, moveHistory, positionHistory) {
        if (!positionHistory || positionHistory.length < 3) {
            return null;
        }

        // Get current position signature
        // Need to determine current turn - it's the opposite of the last move's color
        let currentTurn = 'white';
        if (moveHistory && moveHistory.length > 0) {
            const lastMove = moveHistory[moveHistory.length - 1];
            currentTurn = lastMove.color === 'white' ? 'black' : 'white';
        }
        
        const currentPositionSignature = this._getPositionSignature(board, currentTurn);
        
        // Count occurrences of current position in history (before adding current one)
        // If it has appeared 2 times already, after adding it will be the 3rd time (threefold repetition)
        let occurrenceCount = 0;
        for (let i = 0; i < positionHistory.length; i++) {
            if (positionHistory[i] === currentPositionSignature) {
                occurrenceCount++;
            }
        }
        
        // If position has appeared 2 times before, adding current will make it the 3rd occurrence
        if (occurrenceCount >= 2) {
            return 'threefoldRepetition';
        }
        
        return null;
    }
}

module.exports = GameEndDetector;
