function ensureCorrectPromotion(testCase) {
    const cellFrom = testCase.cellFrom;
    const cellTo = testCase.cellTo;
    const movedPiece = testCase.board.getPieceOnCell(testCase.cellTo);
    const promotionPiece = testCase.promotionPiece;

    if (movedPiece.constructor.name.toLowerCase() === 'pawn' &&
    cellTo.row === (cellFrom.color === 'white' ? 8 : 1)) {
        expect(movedPiece.constructor.name.toLowerCase()).toBe(promotionPiece ? promotionPiece.toLowerCase() : 'queen');
    }
}

module.exports = ensureCorrectPromotion;

