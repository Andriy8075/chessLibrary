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
            try {
                expect(result.success).toBe(expectedSuccess);
            } catch (error) {
                throw new Error(
                    `Move ${number} in test case "${testCaseName}": expected success to be ${expectedSuccess}, got ${result.success}. ` +
                    `Error: ${result.error || 'None'}. ${error.message}\n` +
                    `Request: ${JSON.stringify(request, null, 2)}`
                );
            }
            
            // Only check position and gameStatus if the move was successful
            if (result.success) {
                const currentPosition = GameEndDetector._getPositionMatrix(game.state.board);
                const currentGameStatus = game.state.gameStatus;
                
                try {
                    expect(arePositionsEqual(currentPosition, moveData.position)).toBe(true);
                } catch (error) {
                    console.error(`Position mismatch at move ${number} in test case "${testCaseName}":`);
                    if (moveData.type === 'move') {
                        console.error(`Move from: ${JSON.stringify(moveData.cellFrom)} to: ${JSON.stringify(moveData.cellTo)}`);
                        if (moveData.promotionPiece) {
                            console.error(`Promotion piece: ${moveData.promotionPiece}`);
                        }
                    }
                    console.error('Request:', JSON.stringify(request, null, 2));
                    console.error('Expected position:', JSON.stringify(moveData.position, null, 2));
                    console.error('Actual position:', JSON.stringify(currentPosition, null, 2));
                    throw new Error(
                        `Position mismatch at move ${number} in test case "${testCaseName}". ` +
                        `Move from ${JSON.stringify(moveData.cellFrom || 'N/A')} to ${JSON.stringify(moveData.cellTo || 'N/A')}. ${error.message}`
                    );
                }
                
                try {
                    expect(currentGameStatus).toBe(moveData.gameStatus);
                } catch (error) {
                    const moveInfo = moveData.type === 'move' 
                        ? `Move from ${JSON.stringify(moveData.cellFrom)} to ${JSON.stringify(moveData.cellTo)}`
                        : `Request type: ${moveData.type}`;
                    throw new Error(
                        `Game status mismatch at move ${number} in test case "${testCaseName}": ` +
                        `expected "${moveData.gameStatus}", got "${currentGameStatus}". ` +
                        `${moveInfo}. Request: ${JSON.stringify(request, null, 2)}. ${error.message}`
                    );
                }
            }
        });
    });
});

