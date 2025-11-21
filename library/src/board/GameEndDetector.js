const CheckDetector = require('./CheckDetector');

/**
 * Game end condition detection utilities
 */
class GameEndDetector {
    /**
     * Checks if a player has any legal moves
     * @param {string} color - 'white' or 'black'
     * @param {Board} board - Board instance
     * @returns {boolean} True if player has legal moves
     */
    static hasLegalMoves(color, board) {
        const arrangement = board.getArrangement();
        
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = arrangement[row - 1][col - 1];
                if (piece && piece.color === color) {
                    const possibleMoves = piece.findAllPossibleMoves(board);
                    for (const move of possibleMoves) {
                        // Check if this move is legal (doesn't leave king in check)
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

    /**
     * Checks if move results in checkmate
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {Board} board - Board instance
     * @returns {boolean} True if move results in checkmate
     */
    static checkForCheckmateAfterMove(cellFrom, cellTo, board) {
        // Temporarily make the move
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        const movingColor = piece.color;
        const opponentColor = movingColor === 'white' ? 'black' : 'white';
        
        board._movePiece(cellFrom, cellTo);
        
        // Check if opponent's king is in check
        const kingInCheck = CheckDetector.isKingInCheck(opponentColor, board);
        
        // Check if opponent has any legal moves
        const hasMoves = this.hasLegalMoves(opponentColor, board);
        
        // Undo move
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return kingInCheck && !hasMoves;
    }

    /**
     * Checks if move results in stalemate
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {Board} board - Board instance
     * @returns {boolean} True if move results in stalemate
     */
    static checkForStalemateAfterMove(cellFrom, cellTo, board) {
        // Temporarily make the move
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        const movingColor = piece.color;
        const opponentColor = movingColor === 'white' ? 'black' : 'white';
        
        board._movePiece(cellFrom, cellTo);
        
        // Check if opponent's king is in check
        const kingInCheck = CheckDetector.isKingInCheck(opponentColor, board);
        
        // Check if opponent has any legal moves
        const hasMoves = this.hasLegalMoves(opponentColor, board);
        
        // Undo move
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return !kingInCheck && !hasMoves;
    }

    /**
     * Checks if there are enough pieces to continue the game after a move
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {Board} board - Board instance
     * @returns {boolean} True if there are enough pieces to continue
     */
    static enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo, board) {
        // Temporarily make the move
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        
        board._movePiece(cellFrom, cellTo);
        if (capturedPiece) {
            board._removePiece(cellTo);
        }
        
        // Count pieces
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
        
        // Undo move
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        // Insufficient material: only kings, or king + minor piece(s)
        if (pieces.length <= 2) {
            return false; // Only kings
        }
        
        // Check for insufficient material patterns
        const whitePieces = pieces.filter(p => p.color === 'white');
        const blackPieces = pieces.filter(p => p.color === 'black');
        
        // King vs King + Bishop/Knight
        if (whitePieces.length === 1 && blackPieces.length === 2) {
            const minorPiece = blackPieces.find(p => p.constructor.name === 'Bishop' || p.constructor.name === 'Knight');
            if (minorPiece) return false;
        }
        if (blackPieces.length === 1 && whitePieces.length === 2) {
            const minorPiece = whitePieces.find(p => p.constructor.name === 'Bishop' || p.constructor.name === 'Knight');
            if (minorPiece) return false;
        }
        
        // King + Bishop vs King + Bishop (same color bishops)
        if (whitePieces.length === 2 && blackPieces.length === 2) {
            const whiteBishop = whitePieces.find(p => p.constructor.name === 'Bishop');
            const blackBishop = blackPieces.find(p => p.constructor.name === 'Bishop');
            if (whiteBishop && blackBishop) {
                // Check if bishops are on same color squares
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

