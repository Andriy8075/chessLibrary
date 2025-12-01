export function generateMockBoardFile({
    fileName,
    activeTab,
    pieces,
    validMoves,
    mainPiece,
    extraInfo
}) {
    // Generate pieces array
    const piecesArray = pieces.map(p =>
        `        {type: '${p.type}', color: '${p.color}', position: {row: ${p.position.row}, col: ${p.position.col}}}`
    ).join(',\n');

    // Capitalize first letter for variable name
    const varName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

    // Simple board tab: only pieces
    if (activeTab === 'simple') {
        return `${varName} = {
    pieces: [
${piecesArray}
    ]
}

module.exports = ${varName};
`;
    }

    const moves = validMoves;

    // Generate mainPiecePosition if main piece is selected
    let mainPiecePositionStr = '';
    if (mainPiece) {
        mainPiecePositionStr = `    mainPiecePosition: {row: ${mainPiece.position.row}, col: ${mainPiece.position.col}},\n`;
    }

    // Generate moves array only if main piece is selected
    let movesStr = '';
    if (mainPiece) {
        const movesArray = moves.map(m =>
            `        {row: ${m.row}, col: ${m.col}}`
        ).join(',\n');
        movesStr = `    moves: [
${movesArray}
    ]`;
    }

    // Generate extraInfo if any is set
    let extraInfoStr = '';
    const hasEnPassant = extraInfo.enPassantTarget !== null;
    const hasPiecesMoved = Object.values(extraInfo.piecesMadeMoves).some(v => v === true);

    if (hasEnPassant || hasPiecesMoved) {
        extraInfoStr = '    extraInfo: {\n';

        if (hasEnPassant) {
            const ep = extraInfo.enPassantTarget;
            extraInfoStr += `        enPassantTarget: {row: ${ep.row}, col: ${ep.col}},\n`;
        }

        if (hasPiecesMoved) {
            extraInfoStr += '        piecesMadeMoves: {\n';
            const piecesMovedEntries = [];
            if (extraInfo.piecesMadeMoves.whiteKing) {
                piecesMovedEntries.push('            whiteKing: true');
            }
            if (extraInfo.piecesMadeMoves.blackKing) {
                piecesMovedEntries.push('            blackKing: true');
            }
            if (extraInfo.piecesMadeMoves.whiteKingsideRook) {
                piecesMovedEntries.push('            whiteKingsideRook: true');
            }
            if (extraInfo.piecesMadeMoves.whiteQueensideRook) {
                piecesMovedEntries.push('            whiteQueensideRook: true');
            }
            if (extraInfo.piecesMadeMoves.blackKingsideRook) {
                piecesMovedEntries.push('            blackKingsideRook: true');
            }
            if (extraInfo.piecesMadeMoves.blackQueensideRook) {
                piecesMovedEntries.push('            blackQueensideRook: true');
            }
            extraInfoStr += piecesMovedEntries.join(',\n');
            extraInfoStr += '\n        }\n';
        }

        extraInfoStr += '    }';
    }

    // Build the file content
    let fileContent = `${varName} = {
    pieces: [
${piecesArray}
    ]`;

    if (mainPiecePositionStr) {
        fileContent += `,\n${mainPiecePositionStr}${movesStr}`;
    }

    if (extraInfoStr) {
        fileContent += `,\n${extraInfoStr}`;
    }

    fileContent += `\n}\n\nmodule.exports = ${varName};\n`;

    return fileContent;
}


