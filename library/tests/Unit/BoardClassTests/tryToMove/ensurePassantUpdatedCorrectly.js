function ensurePassantUpdatedCorrectly(board) {
    const movedPiece = board.board.getPieceOnCell(board.cellTo);
    if (movedPiece.constructor.name.toLowerCase() === 'pawn' &&
        Math.abs(board.cellTo.row - board.cellFrom.row) === 2) {
        const realEnPassantTarget = board.board.getEnPassantTarget();
        const expectedEnPassantTarget = {
            row: board.cellTo.row + (board.board.getPieceOnCell(board.cellTo).color === 'white' ? -1 : 1),
            col: board.cellTo.col
        };
        expect(realEnPassantTarget).toEqual(expectedEnPassantTarget);
    }
}

module.exports = ensurePassantUpdatedCorrectly;

