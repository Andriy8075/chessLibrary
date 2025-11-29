function sortMoves(possibleMoves, expectedMoves) {
    const sortMoves = (a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    };
    
    const sortedPossibleMoves = [...possibleMoves].sort(sortMoves);
    const sortedExpectedMoves = [...expectedMoves].sort(sortMoves);
    return { sortedPossibleMoves, sortedExpectedMoves };
}

module.exports = sortMoves;