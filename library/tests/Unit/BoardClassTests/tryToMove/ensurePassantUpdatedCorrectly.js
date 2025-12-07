function ensurePassantUpdatedCorrectly(testCase) {
    const movedPiece = testCase.board.getPieceOnCell(testCase.cellTo);
    if (movedPiece.constructor.name.toLowerCase() === 'pawn' &&
        Math.abs(testCase.cellTo.row - testCase.cellFrom.row) === 2) {
        const realEnPassantTarget = testCase.board.getEnPassantTarget();
        const expectedEnPassantTarget = {
            row: testCase.cellTo.row + (testCase.board.getPieceOnCell(testCase.cellTo).color === 'white' ? -1 : 1),
            col: testCase.cellTo.col
        };
        expect(realEnPassantTarget).toEqual(expectedEnPassantTarget);
    }
}

module.exports = ensurePassantUpdatedCorrectly;

