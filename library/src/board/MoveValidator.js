const CheckDetector = require('./CheckDetector');
const { cellsEqual } = require('../utils/Cell');
const King = require('../pieces/King');
const Rook = require('../pieces/Rook');
const Pawn = require('../pieces/Pawn');

/**
 * Move validation utilities
 */
class MoveValidator {
    /**
     * Validates if a move is legal
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {Board} board - Board instance
     * @returns {{valid: boolean, error?: string}} Validation result
     */
    static validateMove(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        if (!piece) {
            return { valid: false, error: 'No piece at source cell' };
        }

        // Check if piece can move to target on empty board
        if (!piece.canMoveToCellOnEmptyBoard(cellTo)) {
            return { valid: false, error: 'Piece cannot move to target cell' };
        }

        // Check path clearance for sliding pieces
        if (piece.constructor.name === 'Bishop' || 
            piece.constructor.name === 'Rook' || 
            piece.constructor.name === 'Queen') {
            if (!board.isPathClear(cellFrom, cellTo)) {
                return { valid: false, error: 'Path is not clear' };
            }
        }

        // Check if target cell has friendly piece
        const targetPiece = board.getPieceOnCell(cellTo);
        if (targetPiece && targetPiece.color === piece.color) {
            return { valid: false, error: 'Cannot capture own piece' };
        }

        // Special handling for pawns
        if (piece instanceof Pawn) {
            // Pawn forward moves require empty target
            const { rowDiff } = this._getDistance(cellFrom, cellTo);
            const isForwardMove = piece.color === 'white' ? rowDiff > 0 : rowDiff < 0;
            const isSameColumn = cellFrom.col === cellTo.col;
            
            if (isForwardMove && isSameColumn && targetPiece) {
                return { valid: false, error: 'Pawn cannot move forward to occupied square' };
            }
            
            // Pawn diagonal moves require enemy piece (or en passant)
            if (!isSameColumn && !targetPiece && !piece.canEnPassant(cellTo, board)) {
                return { valid: false, error: 'Pawn can only move diagonally to capture' };
            }
        }

        // Check if move would leave own king in check
        if (this.wouldMoveCauseCheck(cellFrom, cellTo, piece.color, board)) {
            return { valid: false, error: 'Move would leave king in check' };
        }

        return { valid: true };
    }

    /**
     * Checks if a move would cause the moving player's king to be in check
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {string} movingColor - Color of the moving piece
     * @param {Board} board - Board instance
     * @returns {boolean} True if move would cause check
     */
    static wouldMoveCauseCheck(cellFrom, cellTo, movingColor, board) {
        // Temporarily make the move
        const piece = board.getPieceOnCell(cellFrom);
        const capturedPiece = board.getPieceOnCell(cellTo);
        
        // Move piece
        board._movePiece(cellFrom, cellTo);
        
        // Check if king is in check
        const inCheck = CheckDetector.isKingInCheck(movingColor, board);
        
        // Undo move
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return inCheck;
    }

    /**
     * Validates castling move
     * @param {{row: number, col: number}} cellFrom - King's current cell
     * @param {{row: number, col: number}} cellTo - King's destination cell
     * @param {Board} board - Board instance
     * @returns {{valid: boolean, error?: string}} Validation result
     */
    static validateCastling(cellFrom, cellTo, board) {
        const king = board.getPieceOnCell(cellFrom);
        if (!(king instanceof King)) {
            return { valid: false, error: 'Only king can castle' };
        }

        if (!king.tryCastle(cellTo, board)) {
            return { valid: false, error: 'Castling is not allowed' };
        }

        return { valid: true };
    }

    /**
     * Validates en passant move
     * @param {{row: number, col: number}} cellFrom - Pawn's current cell
     * @param {{row: number, col: number}} cellTo - Pawn's destination cell
     * @param {Board} board - Board instance
     * @returns {{valid: boolean, error?: string}} Validation result
     */
    static validateEnPassant(cellFrom, cellTo, board) {
        const pawn = board.getPieceOnCell(cellFrom);
        if (!(pawn instanceof Pawn)) {
            return { valid: false, error: 'Only pawn can perform en passant' };
        }

        if (!pawn.canEnPassant(cellTo, board)) {
            return { valid: false, error: 'En passant is not possible' };
        }

        return { valid: true };
    }

    /**
     * Helper to get distance between two cells
     * @private
     */
    static _getDistance(cell1, cell2) {
        return {
            rowDiff: cell2.row - cell1.row,
            colDiff: cell2.col - cell1.col
        };
    }
}

module.exports = MoveValidator;

