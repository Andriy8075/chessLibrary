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

    static isInsufficientMaterial(board) {
        
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
            return 'insufficientMaterial';
        }
        
        const whitePieces = pieces.filter(p => p.color === 'white');
        const blackPieces = pieces.filter(p => p.color === 'black');

        // using FIDE rules for insufficient material. 
        // Draw only if checkmate is impossible even with cooperation of both sides.
        if (whitePieces.length === 1 && blackPieces.length === 2) {
            const minorPiece = blackPieces.find(p => p.constructor.name === 'Bishop' || p.constructor.name === 'Knight');
            if (minorPiece) return 'insufficientMaterial';
        }
        if (blackPieces.length === 1 && whitePieces.length === 2) {
            const minorPiece = whitePieces.find(p => p.constructor.name === 'Bishop' || p.constructor.name === 'Knight');
            if (minorPiece) return 'insufficientMaterial';
        }
        
        if (whitePieces.length === 2 && blackPieces.length === 2) {
            const whiteBishop = whitePieces.find(p => p.constructor.name === 'Bishop');
            const blackBishop = blackPieces.find(p => p.constructor.name === 'Bishop');
            if (whiteBishop && blackBishop) {
                const whiteBishopSquareColor = (whiteBishop.cell.row + whiteBishop.cell.col) % 2;
                const blackBishopSquareColor = (blackBishop.cell.row + blackBishop.cell.col) % 2;
                if (whiteBishopSquareColor === blackBishopSquareColor) {
                    return 'insufficientMaterial';
                }
            }
        }
        
        return null;
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

    static checkForThreefoldRepetitionAfterMove(positionHistory) {
        
        const currentPositionSignature = positionHistory[positionHistory.length - 1];
        
        let occurrenceCount = 0;
        for (let i = 0; i < positionHistory.length; i++) {
            if (positionHistory[i] === currentPositionSignature) {
                occurrenceCount++;
            }
        }
        
        if (occurrenceCount >= 2) {
            return 'threefoldRepetition';
        }
        
        return null;
    }

    static checkForGameEndAfterMove(gameState) {
        const { board, currentTurn, moveHistory, positionHistory } = gameState;
        return this.checkForThreefoldRepetitionAfterMove(positionHistory) ||
        this.checkForFiftyMoveRuleAfterMove(moveHistory) ||
        this.checkForCheckmateOrStalemateAfterMove(currentTurn, board) ||
        this.enoughPiecesAfterMoveToContinueGame(board) || null;
    }
}

module.exports = GameEndDetector;
