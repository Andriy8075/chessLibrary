const fs = require('fs');
const path = require('path');
const Game = require('../../src/Game');

const concurrentGames = 1000;

function loadGameMoves(testCaseDir) {
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
        throw new Error(`No move files found in test case: ${testCaseDir}`);
    }
    
    return files.map(({ file }) => {
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
        
        return request;
    });
}

function playGame(moves) {
    const game = new Game();
    
    for (const move of moves) {
        const result = game.processRequest(move);
        
        if (!result.success) {
            throw new Error(`Move failed: ${result.error || 'Unknown error'}`);
        }
    }
    
    return game;
}

async function runBenchmark() {
    const testCaseDir = path.join(__dirname, '../boards/GameClassTests/realGame');
    const moves = loadGameMoves(testCaseDir);
    
    console.log(`\n=== Starting Benchmark ===`);
    console.log(`Loading game with ${moves.length} moves...`);
    
    const startTime = Date.now();
    
    // Create promises, each playing the game simultaneously
    // Since JavaScript is single-threaded, they'll execute sequentially but as fast as possible
    const gamePromises = Array.from({ length: concurrentGames }, () => Promise.resolve(playGame(moves)));
    
    // Wait for all games to complete
    await Promise.all(gamePromises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n=== Benchmark Results ===`);
    console.log(`Games played: ${concurrentGames}`);
    console.log(`Moves per game: ${moves.length}`);
    console.log(`Total time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`Average time per game: ${(duration / concurrentGames).toFixed(2)}ms`);
    console.log(`Games per second: ${(concurrentGames / (duration / 1000)).toFixed(2)}`);
    console.log(`========================\n`);
}

// Run the benchmark
runBenchmark().catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
});

