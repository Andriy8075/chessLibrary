const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Helper function to compare position matrices
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
            
            // Both null - positions match
            if (!piece1 && !piece2) continue;
            
            // One is null, other is not - positions don't match
            if (!piece1 || !piece2) return false;
            
            // Both have pieces - compare type and color
            if (piece1.type !== piece2.type || piece1.color !== piece2.color) {
                return false;
            }
        }
    }
    
    return true;
}

// Convert serialized board state to position matrix format
function convertBoardToPositionMatrix(board) {
    // board is already in serialized format (array of arrays with {type, color} or null)
    return board.map(row => 
        row.map(piece => {
            if (!piece) return null;
            return {
                type: piece.type,
                color: piece.color
            };
        })
    );
}

// WebSocket client helper class
class ChessClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.color = null;
        this.gameUUID = null;
        this.messageQueue = [];
        this.messageHandlers = new Map();
    }

    async connect(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Connection timeout: Could not connect to ${this.url}. Make sure the server is running on port 3000.`));
            }, timeout);
            
            this.ws = new WebSocket(this.url);
            
            this.ws.on('open', () => {
                clearTimeout(timeoutId);
                resolve();
            });
            
            this.ws.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(new Error(`WebSocket connection error: ${error.message}. Make sure the server is running on port 3000.`));
            });
            
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Failed to parse message:', error);
                }
            });
            
            this.ws.on('close', () => {
                // Connection closed
            });
        });
    }

    handleMessage(message) {
        // Store message in queue
        this.messageQueue.push(message);
        
        // Call registered handlers
        if (this.messageHandlers.has(message.type)) {
            const handler = this.messageHandlers.get(message.type);
            handler(message);
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            throw new Error('WebSocket is not connected');
        }
    }

    clearMessages(messageType) {
        // Remove all messages of the specified type from the queue
        this.messageQueue = this.messageQueue.filter(m => m.type !== messageType);
    }

    waitForMessage(messageType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            // Don't check queue - we want to wait for a NEW message
            // This prevents getting stale messages from previous moves
            
            // Set up handler
            const handler = (message) => {
                if (message.type === messageType) {
                    this.messageHandlers.delete(messageType);
                    clearTimeout(timeoutId);
                    // Remove this message from queue if it's there
                    this.messageQueue = this.messageQueue.filter(m => m !== message);
                    resolve(message);
                }
            };
            
            this.messageHandlers.set(messageType, handler);
            
            // Set timeout
            const timeoutId = setTimeout(() => {
                this.messageHandlers.delete(messageType);
                reject(new Error(`Timeout waiting for message type: ${messageType}`));
            }, timeout);
        });
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Read all test case folders
const testCasesDir = path.join(__dirname, 'testCases');

// Check if testCases directory exists
if (!fs.existsSync(testCasesDir)) {
    console.log('No test cases directory found. Skipping WebSocket end-to-end tests.');
    test('WebSocket end-to-end tests', () => {
        expect(true).toBe(true); // Placeholder test
    });
} else {
    const testCaseFolders = fs.readdirSync(testCasesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    if (testCaseFolders.length === 0) {
        test('WebSocket end-to-end tests', () => {
            expect(true).toBe(true); // Placeholder test when no test cases exist
        });
    } else {
        testCaseFolders.forEach(testCaseName => {
            test(`replay game via WebSocket: ${testCaseName}`, async () => {
                const testCaseDir = path.join(testCasesDir, testCaseName);
                
                // Read all numbered JSON files (0.json, 1.json, ...)
                const files = fs.readdirSync(testCaseDir)
                    .filter(file => file.endsWith('.json'))
                    .map(file => {
                        const number = parseInt(file.replace('.json', ''), 10);
                        if (isNaN(number)) return null;
                        return { number, file };
                    })
                    .filter(item => item !== null)
                    .sort((a, b) => a.number - b.number); // Sort by number
                
                if (files.length === 0) {
                    throw new Error(`No move files found in test case: ${testCaseName}`);
                }
                
                // Create two WebSocket clients
                const client1 = new ChessClient('ws://localhost:3000/ws');
                const client2 = new ChessClient('ws://localhost:3000/ws');
                
                try {
                    // Connect both clients
                    await Promise.all([
                        client1.connect(),
                        client2.connect()
                    ]);
                    
                    // Client 1 finds game (will wait)
                    client1.send({ type: 'findGame' });
                    const waitingMessage = await client1.waitForMessage('waitingForOpponent');
                    expect(waitingMessage.type).toBe('waitingForOpponent');
                    
                    // Client 2 finds game (will match with client 1)
                    client2.send({ type: 'findGame' });
                    
                    // Both clients should receive gameFound
                    const [gameFound1, gameFound2] = await Promise.all([
                        client1.waitForMessage('gameFound'),
                        client2.waitForMessage('gameFound')
                    ]);
                    
                    // Determine which client is which color
                    const whiteClient = gameFound1.data.color === 'white' ? client1 : client2;
                    const blackClient = gameFound1.data.color === 'white' ? client2 : client1;
                    
                    whiteClient.color = 'white';
                    blackClient.color = 'black';
                    whiteClient.gameUUID = gameFound1.data.gameUUID;
                    blackClient.gameUUID = gameFound2.data.gameUUID;
                    
                    // Replay each move
                    // IMPORTANT: Only white client receives and compares responses to avoid async issues
                    // Black client only sends moves, we don't wait for or compare its responses
                    for (const { file, number } of files) {
                        const filePath = path.join(testCaseDir, file);
                        const moveData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        
                        // Determine which client should send this move
                        const sendingClient = moveData.color === 'white' ? whiteClient : blackClient;
                        
                        // Construct the game request
                        const gameRequest = {
                            type: 'move',
                            from: moveData.cellFrom,
                            to: moveData.cellTo
                        };
                        
                        if (moveData.promotionPiece) {
                            gameRequest.promotion = moveData.promotionPiece;
                        }
                        
                        // Clear any pending gameResponse messages from white client's queue
                        // This ensures we get the response for THIS move, not a previous one
                        whiteClient.clearMessages('gameResponse');
                        
                        // Send the move from the appropriate client
                        sendingClient.send({
                            type: 'gameRequest',
                            gameRequest: gameRequest
                        });
                        
                        // Always wait for response from white client (white receives all game state updates)
                        // This avoids async issues - we only use one client for receiving/comparing
                        const gameResponse = await whiteClient.waitForMessage('gameResponse', 10000);
                        
                        // Verify the move was successful
                        expect(gameResponse.data.success).toBe(true);
                        
                        if (!gameResponse.data.success) {
                            throw new Error(`Move ${number} failed: ${gameResponse.data.error || 'Unknown error'}`);
                        }
                        
                        // Convert board state to position matrix
                        const currentPosition = convertBoardToPositionMatrix(gameResponse.data.state.board);
                        const currentGameStatus = gameResponse.data.state.gameStatus;
                        
                        // Compare position matrix
                        const equal = arePositionsEqual(currentPosition, moveData.position);
                        if (!equal) {
                            console.log('currentPosition', currentPosition);
                            console.log('moveData.position', moveData.position);
                        }
                        expect(arePositionsEqual(currentPosition, moveData.position)).toBe(true);
                        
                        if (!arePositionsEqual(currentPosition, moveData.position)) {
                            console.error(`Position mismatch at move ${number}:`);
                            console.error('Expected:', JSON.stringify(moveData.position, null, 2));
                            console.error('Actual:', JSON.stringify(currentPosition, null, 2));
                            throw new Error(`Position mismatch at move ${number}`);
                        }
                        
                        // Compare game status
                        expect(currentGameStatus).toBe(moveData.gameStatus);
                        
                        if (currentGameStatus !== moveData.gameStatus) {
                            throw new Error(
                                `Game status mismatch at move ${number}: ` +
                                `expected "${moveData.gameStatus}", got "${currentGameStatus}"`
                            );
                        }
                    }
                } finally {
                    // Cleanup: close both connections
                    client1.close();
                    client2.close();
                }
            });
        });
    }
}

