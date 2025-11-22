class CheckDetector {
    static isSquareAttacked(cell, attackingColor, board) {
        const arrangement = board.getArrangement();
        
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = arrangement[row - 1][col - 1];
                if (piece && piece.color === attackingColor) {
                    const pieceType = piece.constructor.name;
                    
                    if (pieceType === 'Pawn') {
                        if (piece.canCaptureAt && piece.canCaptureAt(cell)) {
                            return true;
                        }
                        continue;
                    }
                    
                    if (piece.canMoveToCellOnEmptyBoard && piece.canMoveToCellOnEmptyBoard(cell)) {
                        if (pieceType === 'Bishop' || pieceType === 'Rook' || pieceType === 'Queen') {
                            if (board.isPathClear(piece.cell, cell)) {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }

    static isKingInCheck(kingColor, board) {
        const king = board.getKing(kingColor);
        if (!king) return false;

        const attackingColor = kingColor === 'white' ? 'black' : 'white';
        return this.isSquareAttacked(king.cell, attackingColor, board);
    }
}

module.exports = CheckDetector;
