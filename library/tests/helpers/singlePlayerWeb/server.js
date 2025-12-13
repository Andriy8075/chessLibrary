const express = require('express');
const path = require('path');
const fs = require('fs');
const Game = require('../../../src/Game');
const GameEndDetector = require('../../../src/board/GameEndDetector');

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

// Helper function to check if a move is a pawn to promotion row
function isPawnMoveToPromotionRow(cellFrom, cellTo, board) {
    const piece = board.getPieceOnCell(cellFrom);
    if (!piece || piece.constructor.name !== 'Pawn') {
        return false;
    }
    // Promotion row is row 8 for white, row 1 for black
    return (piece.color === 'white' && cellTo.row === 8) || 
           (piece.color === 'black' && cellTo.row === 1);
}

// Endpoint to process move
app.post('/api/move', (req, res) => {
    const request = req.body;
    
    // Add color from currentTurn if not provided
    if (!request.color) {
        request.color = game.getState().currentTurn;
    }
    
    const result = game.processRequest(request);
    
    // Check if promotion is required - if so, we need to send state back
    const isPromotionRequired = result.state && result.state.promotionRequired === true;
    
    // Save ALL requests (successful and failed) to moveHistory
    const state = game.getState();
    const positionMatrix = GameEndDetector._getPositionMatrix(state.board);
    
    const moveData = {
        color: request.color,
        type: request.type,
        position: positionMatrix,
        gameStatus: state.gameStatus,
        success: result.success
    };
    
    // Add move-specific fields if it's a move request
    if (request.type === 'move') {
        moveData.cellTo = request.to;
        moveData.cellFrom = request.from;
        moveData.promotionPiece = request.promotion || null;
    }
    
    // Add error message if request failed
    if (!result.success && result.error) {
        moveData.error = result.error;
    }
    
    // Add additional fields based on request type and result
    if (request.type === 'resign' && state.winner) {
        moveData.winner = state.winner;
    }
    
    if (request.type === 'proposeDraw' && state.pendingDrawProposal !== undefined) {
        moveData.pendingDrawProposal = state.pendingDrawProposal;
    }
    
    moveHistory.push(moveData);
    
    // Handle state for response
    if (result.success && result.state) {
        // Serialize state for response
        result.state = game.getSerializedState();
    } else if (isPromotionRequired) {
        // Promotion required - send state so client can show promotion UI
        result.state = game.getSerializedState();
    } else {
        // Don't send state for other failed moves - client should keep current state
        delete result.state;
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
    const testCasesDir = path.join(__dirname, '../../boards/GameClassTests');
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

// Endpoint to process resign
app.post('/api/resign', (req, res) => {
    const request = req.body;
    request.type = 'resign';
    
    // Add color from currentTurn if not provided
    if (!request.color) {
        request.color = game.getState().currentTurn;
    }
    
    const result = game.processRequest(request);
    
    // Save ALL resign requests (successful and failed)
    const state = game.getState();
    const positionMatrix = GameEndDetector._getPositionMatrix(state.board);
    
    const moveData = {
        color: request.color,
        type: request.type,
        position: positionMatrix,
        gameStatus: state.gameStatus,
        success: result.success
    };
    
    if (state.winner) {
        moveData.winner = state.winner;
    }
    
    if (!result.success && result.error) {
        moveData.error = result.error;
    }
    
    moveHistory.push(moveData);
    
    if (result.state) {
        result.state = game.getSerializedState();
    }
    
    res.json(result);
});

// Endpoint to process propose draw
app.post('/api/propose-draw', (req, res) => {
    const request = req.body;
    request.type = 'proposeDraw';
    
    // Add color from currentTurn if not provided
    if (!request.color) {
        request.color = game.getState().currentTurn;
    }
    
    const result = game.processRequest(request);
    
    // Save ALL propose draw requests (successful and failed)
    const state = game.getState();
    const positionMatrix = GameEndDetector._getPositionMatrix(state.board);
    
    const moveData = {
        color: request.color,
        type: request.type,
        position: positionMatrix,
        gameStatus: state.gameStatus,
        success: result.success
    };
    
    if (state.pendingDrawProposal !== undefined) {
        moveData.pendingDrawProposal = state.pendingDrawProposal;
    }
    
    if (!result.success && result.error) {
        moveData.error = result.error;
    }
    
    moveHistory.push(moveData);
    
    if (result.state) {
        result.state = game.getSerializedState();
    }
    
    res.json(result);
});

// Endpoint to process accept draw
app.post('/api/accept-draw', (req, res) => {
    const request = req.body;
    request.type = 'acceptDraw';
    
    // Add color from currentTurn if not provided
    if (!request.color) {
        request.color = game.getState().currentTurn;
    }
    
    const result = game.processRequest(request);
    
    // Save ALL accept draw requests (successful and failed)
    const state = game.getState();
    const positionMatrix = GameEndDetector._getPositionMatrix(state.board);
    
    const moveData = {
        color: request.color,
        type: request.type,
        position: positionMatrix,
        gameStatus: state.gameStatus,
        success: result.success
    };
    
    if (!result.success && result.error) {
        moveData.error = result.error;
    }
    
    moveHistory.push(moveData);
    
    if (result.state) {
        result.state = game.getSerializedState();
    }
    
    res.json(result);
});

app.post('/api/reset-game', (req, res) => {
    initializeGame();
    const serializedState = game.getSerializedState();
    res.json({ success: true, state: serializedState });
});

app.listen(port, () => {
    console.log(`Single Player Chess Server running on port ${port}`);
    console.log(`HTTP: http://localhost:${port}`);
});

