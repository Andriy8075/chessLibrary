function ensureCorrectPromotion(board) {
    const cellFrom = board.cellFrom;
    const cellTo = board.cellTo;
    const movedPiece = board.board.getPieceOnCell(board.cellTo);
    const promotionPiece = board.promotionPiece;

    if (movedPiece.constructor.name.toLowerCase() === 'pawn' &&
    cellTo.row === (cellFrom.color === 'white' ? 8 : 1)) {
        expect(movedPiece.constructor.name.toLowerCase()).toBe(promotionPiece ? promotionPiece.toLowerCase() : 'queen');
    }
}

module.exports = ensureCorrectPromotion;

