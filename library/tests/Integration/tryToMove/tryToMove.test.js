const loadMockBoards = require('../../helpers/loadMockBoards');

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

        try {
            expect(success).toBe(testCase.expectedResult);
        } catch (error) {
            const moveDetails = {
                cellFrom: testCase.cellFrom,
                cellTo: testCase.cellTo,
                promotionPiece: testCase.promotionPiece || null,
                expectedResult: testCase.expectedResult,
                actualResult: success,
                error: result.error || null
            };
            console.error('Move details:', JSON.stringify(moveDetails, null, 2));
            console.error('Board pieces before move:', JSON.stringify(testCase.pieces, null, 2));
            throw new Error(
                `Move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)} ` +
                `should ${testCase.expectedResult ? 'succeed' : 'fail'}. Got ${success}, expected ${testCase.expectedResult}. ` +
                `${testCase.promotionPiece ? `Promotion piece: ${testCase.promotionPiece}. ` : ''}` +
                `${result.error ? `Error: ${result.error}. ` : ''}${error.message}`
            );
        }

        if (success) {
            const actualPieces = boardToPiecesArray(testCase.board);
            const expectedPieces = testCase.piecesAfter;
            try {
                expect(compareBoardArrangements(actualPieces, expectedPieces)).toBe(true);
            } catch (error) {
                console.error(`Move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)}`);
                console.error('Expected pieces after move:', JSON.stringify(expectedPieces, null, 2));
                console.error('Actual pieces after move:', JSON.stringify(actualPieces, null, 2));
                throw new Error(
                    `Board arrangement after successful move from ${JSON.stringify(testCase.cellFrom)} ` +
                    `to ${JSON.stringify(testCase.cellTo)} should match expected. ${error.message}`
                );
            }
            
            const actualExtraInfo = testCase.board.extraInfo;
            const expectedExtraInfo = testCase.extraInfoAfter;
            try {
                expect(compareExtraInfo(actualExtraInfo, expectedExtraInfo)).toBe(true);
            } catch (error) {
                console.error(`Move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)}`);
                console.error('Expected extraInfo:', JSON.stringify(expectedExtraInfo, null, 2));
                console.error('Actual extraInfo:', JSON.stringify(actualExtraInfo, null, 2));
                throw new Error(
                    `Extra info (enPassantTarget, piecesMadeMoves) after successful move from ${JSON.stringify(testCase.cellFrom)} ` +
                    `to ${JSON.stringify(testCase.cellTo)} should match expected. ${error.message}`
                );
            }
        } else {
            const actualPieces = boardToPiecesArray(testCase.board);
            const expectedPieces = testCase.pieces;
            try {
                expect(compareBoardArrangements(actualPieces, expectedPieces)).toBe(true);
            } catch (error) {
                console.error(`Failed move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)}`);
                console.error('Expected pieces (should be unchanged):', JSON.stringify(expectedPieces, null, 2));
                console.error('Actual pieces:', JSON.stringify(actualPieces, null, 2));
                throw new Error(
                    `Board arrangement should remain unchanged after failed move from ${JSON.stringify(testCase.cellFrom)} ` +
                    `to ${JSON.stringify(testCase.cellTo)}. ${error.message}`
                );
            }
            
            const actualExtraInfo = testCase.board.extraInfo;
            const expectedExtraInfo = testCase.extraInfo;
            try {
                expect(compareExtraInfo(actualExtraInfo, expectedExtraInfo)).toBe(true);
            } catch (error) {
                console.error(`Failed move from ${JSON.stringify(testCase.cellFrom)} to ${JSON.stringify(testCase.cellTo)}`);
                console.error('Expected extraInfo (should be unchanged):', JSON.stringify(expectedExtraInfo, null, 2));
                console.error('Actual extraInfo:', JSON.stringify(actualExtraInfo, null, 2));
                throw new Error(
                    `Extra info should remain unchanged after failed move from ${JSON.stringify(testCase.cellFrom)} ` +
                    `to ${JSON.stringify(testCase.cellTo)}. ${error.message}`
                );
            }
        }
    }
});