const fs = require('fs');
const path = require('path');
const Game = require('../../src/Game');
const GameEndDetector = require('../../src/board/GameEndDetector');
const { arePositionsEqual } = require('../endToEnd/helpers');

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

            // Check if success field exists in moveData, if so, compare with expected value
            const expectedSuccess = moveData.success;
            expect(result.success).toBe(expectedSuccess);
            
            if (result.success !== expectedSuccess) {
                throw new Error(
                    `Move ${number} success mismatch: expected ${expectedSuccess}, got ${result.success}. ` +
                    `Error: ${result.error || 'None'}`
                );
            }
            
            // Only check position and gameStatus if the move was successful
            if (result.success) {
                const currentPosition = GameEndDetector._getPositionMatrix(game.state.board);
                const currentGameStatus = game.state.gameStatus;
                
                expect(arePositionsEqual(currentPosition, moveData.position)).toBe(true);
                
                if (!arePositionsEqual(currentPosition, moveData.position)) {
                    console.error(`Position mismatch at move ${number}:`);
                    console.error('Expected:', JSON.stringify(moveData.position, null, 2));
                    console.error('Actual:', JSON.stringify(currentPosition, null, 2));
                    throw new Error(`Position mismatch at move ${number}`);
                }
                
                expect(currentGameStatus).toBe(moveData.gameStatus);
                
                if (currentGameStatus !== moveData.gameStatus) {
                    throw new Error(
                        `Game status mismatch at move ${number}: ` +
                        `expected "${moveData.gameStatus}", got "${currentGameStatus}"`
                    );
                }
            }
        });
    });
});

