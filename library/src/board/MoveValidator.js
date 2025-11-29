const CheckDetector = require('./CheckDetector');

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

    static wouldEnPassantMoveCauseCheck(cellFrom, cellTo, board) {
        const piece = board.getPieceOnCell(cellFrom);
        
        const movingColor = piece.color;

        const targetRow = piece.color === 'white' ? cellTo.row - 1 : cellTo.row + 1;
        const targetCell = { row: targetRow, col: cellTo.col };
        const capturedPiece = board.getPieceOnCell(targetCell);

        board._movePiece(cellFrom, cellTo);
        board._removePiece(targetCell);

        const inCheck = CheckDetector.isKingInCheck(movingColor, board);

        board._movePiece(cellTo, cellFrom);
        board._placePiece(capturedPiece, targetCell);

        return inCheck;
    }
}

module.exports = MoveValidator;
