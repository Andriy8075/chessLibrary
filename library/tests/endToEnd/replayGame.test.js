const fs = require('fs');
const path = require('path');
const Game = require('../../src/Game');
const GameEndDetector = require('../../src/board/GameEndDetector');
const { arePositionsEqual } = require('./helpers');

const testCasesDir = path.join(__dirname, 'testCases');

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
            
            const request = {
                type: moveData.type,
                from: moveData.cellFrom,
                to: moveData.cellTo,
                color: moveData.color
            };
            
            if (moveData.promotionPiece) {
                request.promotion = moveData.promotionPiece;
            }
            
            const result = game.processRequest(request);

            expect(result.success).toBe(true);
            
            if (!result.success) {
                throw new Error(`Move ${number} failed: ${result.error || 'Unknown error'}`);
            }
            
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
        });
    });
});

