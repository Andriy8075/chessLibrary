const fs = require('fs');
const path = require('path');
const Game = require('../../src/Game');
const GameEndDetector = require('../../src/board/GameEndDetector');
const { arePositionsEqual } = require('../endToEnd/helpers');
const { assertSuccessWithRequest, assertPositionWithMove, assertGameStatusWithMove } = require('../helpers/testAssertions');

const testCasesDir = path.join(__dirname, '../boards/GameClassTests');

const testCaseFolders = fs.readdirSync(testCasesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

testCaseFolders.forEach(testCaseName => {
    test(`replay game: ${testCaseName}`, () => {
        const testCaseDir = path.join(testCasesDir, testCaseName);
        
        const files = fs.readdirSync(testCaseDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const number = parseInt(file.replace('.json', ''), 10);
                if (isNaN(number)) return null;
                return { number, file };
            })
            .filter(item => item !== null)
            .sort((a, b) => a.number - b.number);
        
        if (files.length === 0) {
            throw new Error(`No move files found in test case: ${testCaseName}`);
        }
        
        const game = new Game();
        
        files.forEach(({ file, number }) => {
            const filePath = path.join(testCaseDir, file);
            const moveData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Build request based on the type in moveData
            const request = {
                type: moveData.type,
                color: moveData.color
            };
            
            // Only add move-specific fields if it's a move request
            if (moveData.type === 'move') {
                request.from = moveData.cellFrom;
                request.to = moveData.cellTo;
                if (moveData.promotionPiece) {
                    request.promotion = moveData.promotionPiece;
                }
            }
            
            const result = game.processRequest(request);

            const expectedSuccess = moveData.success;
            assertSuccessWithRequest(result.success, expectedSuccess, request, number, testCaseName, result.error);
            
            if (result.success) {
                const currentPosition = GameEndDetector._getPositionMatrix(game.state.board);
                const currentGameStatus = game.state.gameStatus;
                
                assertPositionWithMove(
                    arePositionsEqual(currentPosition, moveData.position),
                    currentPosition,
                    moveData.position,
                    number,
                    testCaseName,
                    moveData,
                    request
                );
                
                assertGameStatusWithMove(
                    currentGameStatus,
                    moveData.gameStatus,
                    number,
                    testCaseName,
                    moveData,
                    request
                );
            }
        });
    });
});

