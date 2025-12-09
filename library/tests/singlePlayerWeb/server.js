const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const Game = require('../../src/Game');
const GameEndDetector = require('../../src/board/GameEndDetector');

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory game instance and move history
let game = new Game();
let moveHistory = [];

// Initialize game state
function initializeGame() {
    game = new Game();
    moveHistory = [];
}

// Endpoint to get initial game state
app.get('/api/game-state', (req, res) => {
    const serializedState = game.getSerializedState();
    res.json({ success: true, state: serializedState });
});

// Endpoint to process move
app.post('/api/move', (req, res) => {
    const request = req.body;
    
    // Add color from currentTurn if not provided
    if (!request.color) {
        request.color = game.getState().currentTurn;
    }
    
    const result = game.processRequest(request);
    
    // If move was successful, save move data
    if (result.success && result.state) {
        const state = game.getState();
        const positionMatrix = GameEndDetector._getPositionMatrix(state.board);
        
        const moveData = {
            cellTo: request.to,
            cellFrom: request.from,
            promotionPiece: request.promotion || null,
            color: request.color,
            type: request.type,
            position: positionMatrix,
            gameStatus: state.gameStatus
        };
        
        moveHistory.push(moveData);
        
        // Serialize state for response
        result.state = game.getSerializedState();
    }
    
    res.json(result);
});

// Endpoint to save game
app.post('/api/save-game', (req, res) => {
    const { testCaseName } = req.body;
    
    if (!testCaseName || typeof testCaseName !== 'string' || testCaseName.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            error: 'Test case name is required' 
        });
    }
    
    const sanitizedName = testCaseName.trim();
    const testCasesDir = path.join(__dirname, '../endToEnd/testCases');
    const testCaseDir = path.join(testCasesDir, sanitizedName);
    
    // Check if folder already exists
    if (fs.existsSync(testCaseDir)) {
        return res.status(400).json({ 
            success: false, 
            error: `Test case folder "${sanitizedName}" already exists. Please choose a different name.` 
        });
    }
    
    // Create directory
    try {
        fs.mkdirSync(testCaseDir, { recursive: true });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: `Failed to create directory: ${error.message}` 
        });
    }
    
    // Save each move as a numbered JSON file
    try {
        const moveCount = moveHistory.length;
        
        if (moveCount === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No moves to save. Make at least one move before saving.' 
            });
        }
        
        console.log(`Saving ${moveCount} moves to: ${testCaseDir}`);
        
        moveHistory.forEach((moveData, index) => {
            const filePath = path.join(testCaseDir, `${index}.json`);
            fs.writeFileSync(filePath, JSON.stringify(moveData, null, 2), 'utf8');
            console.log(`Saved move ${index} to: ${filePath}`);
        });
        
        // Clear move history after saving
        moveHistory = [];
        
        res.json({ 
            success: true, 
            message: `Game saved successfully as "${sanitizedName}" with ${moveCount} moves` 
        });
    } catch (error) {
        console.error('Error saving files:', error);
        return res.status(500).json({ 
            success: false, 
            error: `Failed to save files: ${error.message}` 
        });
    }
});

// Endpoint to reset game
app.post('/api/reset-game', (req, res) => {
    initializeGame();
    const serializedState = game.getSerializedState();
    res.json({ success: true, state: serializedState });
});

app.listen(port, () => {
    console.log(`Single Player Chess Server running on port ${port}`);
    console.log(`HTTP: http://localhost:${port}`);
});

