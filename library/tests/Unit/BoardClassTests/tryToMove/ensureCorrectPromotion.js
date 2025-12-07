function wasPromotion(testCase) {
    const movedPiece = testCase.board.getPieceOnCell(testCase.cellTo);
    const { cellTo, cellFrom } = testCase;
    return movedPiece.constructor.name.toLowerCase() === 'pawn' &&
        cellTo.row === (cellFrom.color === 'white' ? 8 : 1);
}

function ensureCorrectPromotion(testCase) {
    const movedPiece = testCase.board.getPieceOnCell(testCase.cellTo);
    const promotionPiece = testCase.promotionPiece;
    
    expect(movedPiece.constructor.name.toLowerCase()).toBe(promotionPiece ? promotionPiece.toLowerCase() : 'queen');
}

module.exports = {wasPromotion, ensureCorrectPromotion};

