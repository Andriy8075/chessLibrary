const fs = require('fs');
const path = require('path');
const GameEndDetector = require('../../../../src/board/GameEndDetector');

// Convert arrangement (string format like 'whitePawn') to position matrix format ({type: 'pawn', color: 'white'})
function convertArrangementToPositionMatrix(arrangement) {
    return arrangement.map(row =>
        row.map(pieceString => {
            if (!pieceString) return null;
            
            // Parse string like 'whitePawn' or 'blackKing'
            const color = pieceString.startsWith('white') ? 'white' : 'black';
            const pieceType = pieceString.replace(/^(white|black)/, '');
            // Convert to lowercase to match getSerializedState format: 'Pawn' -> 'pawn', 'King' -> 'king'
            const type = pieceType.toLowerCase();
            
            return {
                type: type,
                color: color
            };
        })
    );
}

// Read all test case folders
const testCasesDir = path.join(__dirname, 'testCases');
const testCaseFolders = fs.readdirSync(testCasesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

testCaseFolders.forEach(testCaseName => {
    test(`test case: ${testCaseName}`, () => {
        const testCaseDir = path.join(testCasesDir, testCaseName);
        
        // Read all numbered files (0.js, 1.js, 2.js, ...), excluding result.js
        const files = fs.readdirSync(testCaseDir)
            .filter(file => file.endsWith('.js') && file !== 'result.js')
            .map(file => {
                const number = parseInt(file.replace('.js', ''), 10);
                return { number, file };
            })
            .sort((a, b) => a.number - b.number); // Sort by number
        
        // Load all positions and convert to position matrices
        const positionHistory = files.map(({ file }) => {
            const filePath = path.join(testCaseDir, file);
            const arrangement = require(filePath);
            return convertArrangementToPositionMatrix(arrangement);
        });
        
        // Load expected result from result.js
        const expectedResult = require(path.join(testCaseDir, 'result.js'));
        
        // Call the function with the position history
        const actualResult = GameEndDetector.checkForThreefoldRepetitionsAfterMove(positionHistory);
        
        // Assert that the result matches the expected result
        try {
            expect(actualResult).toBe(expectedResult);
        } catch (error) {
            throw new Error(`Test case "${testCaseName}": Expected threefold repetition result to be ${expectedResult}, but got ${actualResult}. ${error.message}`);
        }
    });
});