const CheckDetector = require('./CheckDetector');
const King = require('../pieces/King');
const Pawn = require('../pieces/Pawn');

class MoveValidator {
    static validateMove(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        if (!piece) {
            return { valid: false, error: 'No piece at source cell' };
        }

        if (!piece.canMove(cellTo)) {
            return { valid: false, error: 'Piece cannot move to target cell' };
        }

        if (piece instanceof Pawn) {
            const { rowDiff } = this._getDistance(cellFrom, cellTo);
            const isForwardMove = piece.color === 'white' ? rowDiff > 0 : rowDiff < 0;
            const isSameColumn = cellFrom.col === cellTo.col;
            const targetPiece = board.getPieceOnCell(cellTo);
            
            if (isForwardMove && isSameColumn && targetPiece) {
                return { valid: false, error: 'Pawn cannot move forward to occupied square' };
            }
            
            if (!isSameColumn && !targetPiece && !piece.canEnPassant(cellTo)) {
                return { valid: false, error: 'Pawn can only move diagonally to capture' };
            }
        }

        if (this.wouldMoveCauseCheck(cellFrom, cellTo, piece.color, board)) {
            return { valid: false, error: 'Move would leave king in check' };
        }

        return { valid: true };
    }

    static wouldMoveCauseCheck(cellFrom, cellTo, movingColor, board) {
        const capturedPiece = board.getPieceOnCell(cellTo);
        
        board._movePiece(cellFrom, cellTo);
        
        const inCheck = CheckDetector.isKingInCheck(movingColor, board);
        
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return inCheck;
    }

    static validateCastling(cellFrom, cellTo, board) {
        const king = board.getPieceOnCell(cellFrom);
        if (!(king instanceof King)) {
            return { valid: false, error: 'Only king can castle' };
        }

        if (!king.tryCastle(cellTo)) {
            return { valid: false, error: 'Castling is not allowed' };
        }

        return { valid: true };
    }

    static validateEnPassant(cellFrom, cellTo, board) {
        const pawn = board.getPieceOnCell(cellFrom);
        if (!(pawn instanceof Pawn)) {
            return { valid: false, error: 'Only pawn can perform en passant' };
        }

        if (!pawn.canEnPassant(cellTo)) {
            return { valid: false, error: 'En passant is not possible' };
        }

        return { valid: true };
    }

    static _getDistance(cell1, cell2) {
        return {
            rowDiff: cell2.row - cell1.row,
            colDiff: cell2.col - cell1.col
        };
    }
}

module.exports = MoveValidator;
