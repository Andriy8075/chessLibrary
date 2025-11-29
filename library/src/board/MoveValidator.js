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

        if (this.wouldMoveCauseCheck(cellFrom, cellTo, board)) {
            return { valid: false, error: 'Move would leave king in check' };
        }

        return { valid: true };
    }

    static wouldMoveCauseCheck(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        
        const movingColor = piece.color;

        const capturedPiece = board.getPieceOnCell(cellTo);
        
        board._movePiece(cellFrom, cellTo);
        
        const inCheck = CheckDetector.isKingInCheck(movingColor, board);
        
        board._movePiece(cellTo, cellFrom);
        if (capturedPiece) {
            board._placePiece(capturedPiece, cellTo);
        }
        
        return inCheck;
    }

    static _getDistance(cell1, cell2) {
        return {
            rowDiff: cell2.row - cell1.row,
            colDiff: cell2.col - cell1.col
        };
    }
}

module.exports = MoveValidator;
