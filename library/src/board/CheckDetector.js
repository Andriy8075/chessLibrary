/**
 * Check detection utilities
 */
class CheckDetector {
    /**
     * Checks if a square is attacked by pieces of the specified color
     * @param {{row: number, col: number}} cell - Cell to check
     * @param {string} attackingColor - 'white' or 'black'
     * @param {Board} board - Board instance
     * @returns {boolean} True if square is attacked
     */
    static isSquareAttacked(cell, attackingColor, board) {
        const arrangement = board.getArrangement();
        
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = arrangement[row - 1][col - 1];
                if (piece && piece.color === attackingColor) {
                    const pieceType = piece.constructor.name;
                    
                    // Pawns attack diagonally (not forward)
                    if (pieceType === 'Pawn') {
                        if (piece.canCaptureAt && piece.canCaptureAt(cell)) {
                            return true;
                        }
                        continue;
                    }
                    
                    // Check if this piece can attack the target cell
                    if (piece.canMoveToCellOnEmptyBoard && piece.canMoveToCellOnEmptyBoard(cell)) {
                        // For pieces that need path clearance, check it
                        if (pieceType === 'Bishop' || pieceType === 'Rook' || pieceType === 'Queen') {
                            if (board.isPathClear(piece.cell, cell)) {
                                return true;
                            }
                        } else {
                            // Knight and King don't need path clearance
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Checks if the king of the specified color is in check
     * @param {string} kingColor - 'white' or 'black'
     * @param {Board} board - Board instance
     * @returns {boolean} True if king is in check
     */
    static isKingInCheck(kingColor, board) {
        const king = board.getKing(kingColor);
        if (!king) return false;

        const attackingColor = kingColor === 'white' ? 'black' : 'white';
        return this.isSquareAttacked(king.cell, attackingColor, board);
    }
}

module.exports = CheckDetector;

