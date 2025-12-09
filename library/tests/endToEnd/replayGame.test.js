const fs = require('fs');
const path = require('path');
const Game = require('../../src/Game');
const GameEndDetector = require('../../src/board/GameEndDetector');

function arePositionsEqual(position1, position2) {
    if (!position1 || !position2) return false;
    if (position1.length !== 8 || position2.length !== 8) return false;
    
    for (let row = 0; row < 8; row++) {
        if (position1[row].length !== 8 || position2[row].length !== 8) {
            return false;
        }
        
        for (let col = 0; col < 8; col++) {
            const piece1 = position1[row][col];
            const piece2 = position2[row][col];
            
            if (!piece1 && !piece2) continue;
            
            if (!piece1 || !piece2) return false;
            
            if (piece1.type !== piece2.type || piece1.color !== piece2.color) {
                return false;
            }
        }
    }
    
    return true;
}

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

