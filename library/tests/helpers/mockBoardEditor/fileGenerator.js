export function generateMockBoardFile({
    fileName,
    activeTab,
    pieces,
    validMoves,
    mainPiece,
    extraInfo
}) {
    // Board types now match tab names directly
    const boardType = activeTab || 'findAllPossibleMoves';

    const data = {
        boardType,
        pieces: pieces.map(p => ({
            type: p.type,
            color: p.color,
            position: {
                row: p.position.row,
                col: p.position.col
            }
        }))
    };

    // For simple board we keep only pieces and boardType
    if (activeTab !== 'simpleBoard') {
        if (mainPiece) {
            data.mainPiecePosition = {
                row: mainPiece.position.row,
                col: mainPiece.position.col
            };
            data.moves = validMoves.map(m => ({
                row: m.row,
                col: m.col
            }));
        }

        const hasEnPassant = extraInfo.enPassantTarget !== null;
        const hasPiecesMoved = Object.values(extraInfo.piecesMadeMoves).some(v => v === true);

        if (hasEnPassant || hasPiecesMoved) {
            data.extraInfo = {};

            if (hasEnPassant) {
                data.extraInfo.enPassantTarget = {
                    row: extraInfo.enPassantTarget.row,
                    col: extraInfo.enPassantTarget.col
                };
            }

            if (hasPiecesMoved) {
                data.extraInfo.piecesMadeMoves = {};
                Object.keys(extraInfo.piecesMadeMoves).forEach(key => {
                    if (extraInfo.piecesMadeMoves[key]) {
                        data.extraInfo.piecesMadeMoves[key] = true;
                    }
                });
            }
        }
    }

    // Pretty-printed JSON
    return JSON.stringify(data, null, 4);
}



