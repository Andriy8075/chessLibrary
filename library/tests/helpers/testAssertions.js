function assertPieceAtDestination(board, cellTo, expectedPiece, cellFrom, moveType = 'move') {
    try {
        expect(board.getPieceOnCell(cellTo)).toBe(expectedPiece);
    } catch (error) {
        const details = { cellFrom, cellTo, moveType };
        if (expectedPiece) {
            details.pieceType = expectedPiece.constructor.name;
            details.pieceColor = expectedPiece.color;
        }
        console.error(`${moveType} details:`, JSON.stringify(details, null, 2));
        throw new Error(
            `Piece should be at destination cell ${JSON.stringify(cellTo)} after ${moveType} from ${JSON.stringify(cellFrom)}. ${error.message}`
        );
    }
}

function assertSourceCellEmpty(board, cellFrom, cellTo, moveType = 'move') {
    try {
        expect(board.getPieceOnCell(cellFrom)).toBeNull();
    } catch (error) {
        const actualPiece = board.getPieceOnCell(cellFrom);
        const details = {
            cellFrom,
            cellTo,
            moveType,
            actualPiece: actualPiece ? { type: actualPiece.constructor.name, color: actualPiece.color } : null
        };
        console.error(`${moveType} details:`, JSON.stringify(details, null, 2));
        throw new Error(
            `Source cell ${JSON.stringify(cellFrom)} should be empty after ${moveType} to ${JSON.stringify(cellTo)}. ${error.message}`
        );
    }
}

function assertPieceCellProperty(piece, expectedCell, cellFrom, moveType = 'move') {
    try {
        expect(piece.cell).toStrictEqual(expectedCell);
    } catch (error) {
        const details = {
            cellFrom,
            expectedCell,
            actualPieceCell: piece.cell,
            moveType,
            pieceType: piece.constructor.name,
            pieceColor: piece.color
        };
        console.error(`${moveType} details:`, JSON.stringify(details, null, 2));
        throw new Error(
            `Piece cell property should be ${JSON.stringify(expectedCell)} after ${moveType} from ${JSON.stringify(cellFrom)}. ${error.message}`
        );
    }
}

function assertCapturedCellEmpty(board, capturedCell, cellFrom, cellTo, moveType = 'capture') {
    try {
        expect(board.getPieceOnCell(capturedCell)).toBeNull();
    } catch (error) {
        const actualPiece = board.getPieceOnCell(capturedCell);
        const details = {
            cellFrom,
            cellTo,
            capturedCell,
            moveType,
            actualPieceAtCaptured: actualPiece ? { type: actualPiece.constructor.name, color: actualPiece.color } : null
        };
        console.error(`${moveType} details:`, JSON.stringify(details, null, 2));
        throw new Error(
            `Captured cell ${JSON.stringify(capturedCell)} should be empty after ${moveType} from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)}. ${error.message}`
        );
    }
}

function assertEnPassantMove(board, cellFrom, cellTo, capturedCell, movingPiece, color) {
    const enPassantDetails = {
        cellFrom,
        cellTo,
        capturedCell,
        enPassantTarget: board.extraInfo?.enPassantTarget || null,
        color
    };

    try {
        expect(board.getPieceOnCell(cellTo)).toBe(movingPiece);
    } catch (error) {
        console.error('En passant details:', JSON.stringify(enPassantDetails, null, 2));
        throw new Error(
            `${color} pawn should be at ${JSON.stringify(cellTo)} after en passant from ${JSON.stringify(cellFrom)}. ${error.message}`
        );
    }

    try {
        expect(board.getPieceOnCell(cellFrom)).toBeNull();
    } catch (error) {
        console.error('En passant details:', JSON.stringify({ cellFrom, cellTo, ...enPassantDetails }, null, 2));
        throw new Error(
            `Source cell ${JSON.stringify(cellFrom)} should be empty after en passant to ${JSON.stringify(cellTo)}. ${error.message}`
        );
    }

    try {
        expect(board.getPieceOnCell(capturedCell)).toBeNull();
    } catch (error) {
        console.error('En passant details:', JSON.stringify({ cellFrom, cellTo, capturedCell, ...enPassantDetails }, null, 2));
        throw new Error(
            `Captured pawn cell ${JSON.stringify(capturedCell)} should be empty after en passant. ${error.message}`
        );
    }
}

function assertCastlingMove(board, kingFrom, kingTo, rookFrom, rookTo, king, rook, side, color, intermediateCells = []) {
    const castlingDetails = {
        kingFrom,
        kingTo,
        rookFrom,
        rookTo,
        side,
        color
    };

    try {
        expect(board.getPieceOnCell(kingTo)).toBe(king);
    } catch (error) {
        console.error('Castling details:', JSON.stringify(castlingDetails, null, 2));
        throw new Error(
            `King should be at ${JSON.stringify(kingTo)} after ${side} castling from ${JSON.stringify(kingFrom)}. ${error.message}`
        );
    }

    try {
        expect(board.getPieceOnCell(rookFrom)).toBeNull();
    } catch (error) {
        console.error('Castling details:', JSON.stringify({ rookFrom, ...castlingDetails }, null, 2));
        throw new Error(
            `Rook source cell ${JSON.stringify(rookFrom)} should be empty after castling. ${error.message}`
        );
    }

    intermediateCells.forEach(intermediateCell => {
        try {
            expect(board.getPieceOnCell(intermediateCell)).toBeNull();
        } catch (error) {
            console.error('Castling details:', JSON.stringify({ intermediateCell, ...castlingDetails }, null, 2));
            throw new Error(
                `Intermediate cell ${JSON.stringify(intermediateCell)} should be empty after ${side} castling. ${error.message}`
            );
        }
    });

    try {
        expect(board.getPieceOnCell(rookTo)).toBe(rook);
    } catch (error) {
        console.error('Castling details:', JSON.stringify({ rookFrom, rookTo, ...castlingDetails }, null, 2));
        throw new Error(
            `Rook should be at ${JSON.stringify(rookTo)} after castling from ${JSON.stringify(rookFrom)}. ${error.message}`
        );
    }

    try {
        expect(board.getPieceOnCell(kingFrom)).toBeNull();
    } catch (error) {
        console.error('Castling details:', JSON.stringify({ kingFrom, ...castlingDetails }, null, 2));
        throw new Error(
            `King source cell ${JSON.stringify(kingFrom)} should be empty after castling. ${error.message}`
        );
    }
}

function assertBasicMove(board, cellFrom, cellTo, piece, moveType = 'move') {
    assertPieceAtDestination(board, cellTo, piece, cellFrom, moveType);
    assertSourceCellEmpty(board, cellFrom, cellTo, moveType);
    assertPieceCellProperty(piece, cellTo, cellFrom, moveType);
}

function assertCaptureMove(board, cellFrom, cellTo, capturedCell, piece, moveType = 'capture') {
    assertPieceAtDestination(board, cellTo, piece, cellFrom, moveType);
    assertCapturedCellEmpty(board, capturedCell, cellFrom, cellTo, moveType);
    assertPieceCellProperty(piece, cellTo, cellFrom, moveType);
}

function assertSuccessWithRequest(actualSuccess, expectedSuccess, request, moveNumber, testCaseName, resultError) {
    try {
        expect(actualSuccess).toBe(expectedSuccess);
    } catch (error) {
        throw new Error(
            `Move ${moveNumber} in test case "${testCaseName}": expected success to be ${expectedSuccess}, got ${actualSuccess}. ` +
            `Error: ${resultError || 'None'}. ${error.message}\n` +
            `Request: ${JSON.stringify(request, null, 2)}`
        );
    }
}

function assertPositionWithMove(areEqual, currentPosition, expectedPosition, moveNumber, testCaseName, moveData, request) {
    try {
        expect(areEqual).toBe(true);
    } catch (error) {
        console.error(`Position mismatch at move ${moveNumber} in test case "${testCaseName}":`);
        if (moveData.type === 'move') {
            console.error(`Move from: ${JSON.stringify(moveData.cellFrom)} to: ${JSON.stringify(moveData.cellTo)}`);
            if (moveData.promotionPiece) {
                console.error(`Promotion piece: ${moveData.promotionPiece}`);
            }
        }
        console.error('Request:', JSON.stringify(request, null, 2));
        console.error('Expected position:', JSON.stringify(expectedPosition, null, 2));
        console.error('Actual position:', JSON.stringify(currentPosition, null, 2));
        throw new Error(
            `Position mismatch at move ${moveNumber} in test case "${testCaseName}". ` +
            `Move from ${JSON.stringify(moveData.cellFrom || 'N/A')} to ${JSON.stringify(moveData.cellTo || 'N/A')}. ${error.message}`
        );
    }
}

function assertGameStatusWithMove(actualStatus, expectedStatus, moveNumber, testCaseName, moveData, request) {
    try {
        expect(actualStatus).toBe(expectedStatus);
    } catch (error) {
        const moveInfo = moveData.type === 'move' 
            ? `Move from ${JSON.stringify(moveData.cellFrom)} to ${JSON.stringify(moveData.cellTo)}`
            : `Request type: ${moveData.type}`;
        throw new Error(
            `Game status mismatch at move ${moveNumber} in test case "${testCaseName}": ` +
            `expected "${expectedStatus}", got "${actualStatus}". ` +
            `${moveInfo}. Request: ${JSON.stringify(request, null, 2)}. ${error.message}`
        );
    }
}

function assertMoveResult(actual, expected, cellFrom, cellTo, additionalContext = {}) {
    try {
        expect(actual).toBe(expected);
    } catch (error) {
        const details = {
            cellFrom,
            cellTo,
            expectedResult: expected,
            actualResult: actual,
            ...additionalContext
        };
        console.error('Move details:', JSON.stringify(details, null, 2));
        if (additionalContext.boardPiecesBefore) {
            console.error('Board pieces before move:', JSON.stringify(additionalContext.boardPiecesBefore, null, 2));
        }
        const shouldText = expected ? 'succeed' : 'fail';
        const additionalInfo = [
            additionalContext.promotionPiece ? `Promotion piece: ${additionalContext.promotionPiece}.` : '',
            additionalContext.error ? `Error: ${additionalContext.error}.` : ''
        ].filter(Boolean).join(' ');
        throw new Error(
            `Move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)} should ${shouldText}. ` +
            `Got ${actual}, expected ${expected}. ${additionalInfo}${error.message}`
        );
    }
}

function assertBooleanWithMoveContext(actual, expected, cellFrom, cellTo, description, additionalContext = {}) {
    try {
        expect(actual).toBe(expected);
    } catch (error) {
        const details = {
            cellFrom: cellFrom || 'N/A',
            cellTo,
            expectedResult: expected,
            actualResult: actual,
            ...additionalContext
        };
        console.error('Move details:', JSON.stringify(details, null, 2));
        const shouldNot = expected ? '' : 'not ';
        const moveInfo = cellFrom ? 
            `Move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)}` :
            `Move to ${JSON.stringify(cellTo)}`;
        throw new Error(
            `${description || 'Move'} ${moveInfo} should ${shouldNot}${additionalContext.action || 'match expected'}. ` +
            `Got ${actual}, expected ${expected}. ${error.message}`
        );
    }
}

function assertCanMoveResult(actual, expected, cellFrom, cellTo, pieceInfo, folderName, additionalContext = {}) {
    try {
        expect(actual).toBe(expected);
    } catch (error) {
        const details = {
            piece: pieceInfo,
            from: cellFrom,
            to: cellTo,
            expectedResult: expected,
            actualResult: actual,
            folder: folderName,
            ...additionalContext
        };
        console.error('Move attempt details:', JSON.stringify(details, null, 2));
        throw new Error(
            `Piece at ${JSON.stringify(cellFrom)} should ${expected ? '' : 'not '}be able to move to ${JSON.stringify(cellTo)} in folder ${folderName}. ` +
            `Got ${actual}, expected ${expected}. ${error.message}`
        );
    }
}

function assertBoardArrangement(comparisonResult, actualPieces, expectedPieces, cellFrom, cellTo, description = 'Board arrangement') {
    try {
        expect(comparisonResult).toBe(true);
    } catch (error) {
        console.error(`Move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)}`);
        console.error(`Expected ${description.toLowerCase()}:`, JSON.stringify(expectedPieces, null, 2));
        console.error(`Actual ${description.toLowerCase()}:`, JSON.stringify(actualPieces, null, 2));
        throw new Error(
            `${description} after move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)} should match expected. ${error.message}`
        );
    }
}

function assertExtraInfo(comparisonResult, actualExtraInfo, expectedExtraInfo, cellFrom, cellTo, description = 'Extra info') {
    try {
        expect(comparisonResult).toBe(true);
    } catch (error) {
        console.error(`Move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)}`);
        console.error(`Expected ${description.toLowerCase()}:`, JSON.stringify(expectedExtraInfo, null, 2));
        console.error(`Actual ${description.toLowerCase()}:`, JSON.stringify(actualExtraInfo, null, 2));
        throw new Error(
            `${description} after move from ${JSON.stringify(cellFrom)} to ${JSON.stringify(cellTo)} should match expected. ${error.message}`
        );
    }
}

module.exports = {
    assertPieceAtDestination,
    assertSourceCellEmpty,
    assertPieceCellProperty,
    assertCapturedCellEmpty,
    assertEnPassantMove,
    assertCastlingMove,
    assertBasicMove,
    assertCaptureMove,
    assertSuccessWithRequest,
    assertPositionWithMove,
    assertGameStatusWithMove,
    assertMoveResult,
    assertBooleanWithMoveContext,
    assertCanMoveResult,
    assertBoardArrangement,
    assertExtraInfo
};
