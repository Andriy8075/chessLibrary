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

    static _getPositionMatrix(board) {
        const arrangement = board.getSerializedState();
        
        // Create a deep copy of the 8x8 matrix
        return arrangement.map(row => 
            row.map(piece => {
                if (!piece) return null;
                return {
                    type: piece.type,
                    color: piece.color
                };
            })
        );
    }

    static _arePositionsEqual(position1, position2) {
        // Compare two 8x8 matrices element by element
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece1 = position1[row][col];
                const piece2 = position2[row][col];
                
                // Both null - positions match
                if (!piece1 && !piece2) continue;
                
                // One is null, other is not - positions don't match
                if (!piece1 || !piece2) return false;
                
                // Both have pieces - compare type and color
                if (piece1.type !== piece2.type || piece1.color !== piece2.color) {
                    return false;
                }
            }
        }
        
        return true;
    }

    static checkForThreefoldRepetitionsAfterMove(positionHistory) {
        const currentPosition = positionHistory[positionHistory.length - 1];
        
        let occurrenceCount = 0;
        for (let i = 0; i < positionHistory.length; i++) {
            if (this._arePositionsEqual(positionHistory[i], currentPosition)) {
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
        return this.checkForThreefoldRepetitionsAfterMove(positionHistory) ||
        this.checkForFiftyMoveRuleAfterMove(moveHistory) ||
        this.checkForCheckmateOrStalemateAfterMove(currentTurn, board) ||
        this.isInsufficientMaterial(board) || null;
    }
}

module.exports = GameEndDetector;
