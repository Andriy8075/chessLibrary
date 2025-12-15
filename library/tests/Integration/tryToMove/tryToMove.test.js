const loadMockBoards = require('../../helpers/loadMockBoards');
const { assertMoveResult, assertBoardArrangement, assertExtraInfo } = require('../../helpers/testAssertions');

function boardToPiecesArray(board) {
    const pieces = [];
    const arrangement = board.getArrangement();
    
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const piece = arrangement[row - 1][col - 1];
            if (piece) {
                pieces.push({
                    type: piece.constructor.name.toLowerCase(),
                    color: piece.color,
                    position: { row, col }
                });
            }
        }
    }
    
    return pieces;
}

function compareBoardArrangements(actualPieces, expectedPieces) {
    if (actualPieces.length !== expectedPieces.length) {
        return false;
    }
    
    const actualMap = new Map();
    const expectedMap = new Map();
    
    actualPieces.forEach(piece => {
        const key = `${piece.position.row},${piece.position.col}`;
        actualMap.set(key, piece);
    });
    
    expectedPieces.forEach(piece => {
        const key = `${piece.position.row},${piece.position.col}`;
        expectedMap.set(key, piece);
    });
    
    for (const [key, expectedPiece] of expectedMap) {
        const actualPiece = actualMap.get(key);
        if (!actualPiece) {
            return false;
        }
        if (actualPiece.type !== expectedPiece.type || actualPiece.color !== expectedPiece.color) {
            return false;
        }
    }
    
    for (const key of actualMap.keys()) {
        if (!expectedMap.has(key)) {
            return false;
        }
    }
    
    return true;
}

function compareExtraInfo(actualExtraInfo, expectedExtraInfo) {
    
    const actualEnPassant = actualExtraInfo.enPassantTarget;
    const expectedEnPassant = expectedExtraInfo.enPassantTarget;
    
    const actualIsNull = actualEnPassant === null || actualEnPassant === undefined;
    const expectedIsNull = expectedEnPassant === null || expectedEnPassant === undefined;
    
    if (actualIsNull && expectedIsNull) {
    } else if (actualIsNull || expectedIsNull) {
        return false;
    } else if (actualEnPassant.row !== expectedEnPassant.row || actualEnPassant.col !== expectedEnPassant.col) {
        return false;
    }
    
    const actualPiecesMoved = actualExtraInfo.piecesMadeMoves || {};
    const expectedPiecesMoved = expectedExtraInfo.piecesMadeMoves || {};
    
    const allKeys = new Set([
        ...Object.keys(actualPiecesMoved),
        ...Object.keys(expectedPiecesMoved)
    ]);
    
    for (const key of allKeys) {
        const actualValue = actualPiecesMoved[key] || false;
        const expectedValue = expectedPiecesMoved[key] || false;
        if (actualValue !== expectedValue) {
            return false;
        }
    }
    
    return true;
}

test('board cases', () => {
    const testCases = loadMockBoards('tryToMove');
    for (const testCase of testCases) {
        let result
        if (testCase.promotionPiece) {
            result = testCase.board.tryToMove(testCase.cellFrom, testCase.cellTo, testCase.promotionPiece);
            success = result.success;
        } else {
            result = testCase.board.tryToMove(testCase.cellFrom, testCase.cellTo);
            success = result.success;
        }

        assertMoveResult(
            success,
            testCase.expectedResult,
            testCase.cellFrom,
            testCase.cellTo,
            {
                promotionPiece: testCase.promotionPiece || null,
                error: result.error || null,
                boardPiecesBefore: testCase.pieces
            }
        );

        if (success) {
            const actualPieces = boardToPiecesArray(testCase.board);
            const expectedPieces = testCase.piecesAfter;
            assertBoardArrangement(
                compareBoardArrangements(actualPieces, expectedPieces),
                actualPieces,
                expectedPieces,
                testCase.cellFrom,
                testCase.cellTo,
                'Board arrangement after successful move'
            );
            
            const actualExtraInfo = testCase.board.extraInfo;
            const expectedExtraInfo = testCase.extraInfoAfter;
            assertExtraInfo(
                compareExtraInfo(actualExtraInfo, expectedExtraInfo),
                actualExtraInfo,
                expectedExtraInfo,
                testCase.cellFrom,
                testCase.cellTo,
                'Extra info (enPassantTarget, piecesMadeMoves) after successful move'
            );
        } else {
            const actualPieces = boardToPiecesArray(testCase.board);
            const expectedPieces = testCase.pieces;
            assertBoardArrangement(
                compareBoardArrangements(actualPieces, expectedPieces),
                actualPieces,
                expectedPieces,
                testCase.cellFrom,
                testCase.cellTo,
                'Board arrangement (should remain unchanged after failed move)'
            );
            
            const actualExtraInfo = testCase.board.extraInfo;
            const expectedExtraInfo = testCase.extraInfo;
            assertExtraInfo(
                compareExtraInfo(actualExtraInfo, expectedExtraInfo),
                actualExtraInfo,
                expectedExtraInfo,
                testCase.cellFrom,
                testCase.cellTo,
                'Extra info (should remain unchanged after failed move)'
            );
        }
    }
});