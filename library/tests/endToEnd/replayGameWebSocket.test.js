const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { arePositionsEqual } = require('./helpers');

function convertBoardToPositionMatrix(board) {
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
            });
        });
    }

    handleMessage(message) {
        this.messageQueue.push(message);
        
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
        this.messageQueue = this.messageQueue.filter(m => m.type !== messageType);
    }

    waitForMessage(messageType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            
            const handler = (message) => {
                if (message.type === messageType) {
                    this.messageHandlers.delete(messageType);
                    clearTimeout(timeoutId);
                    this.messageQueue = this.messageQueue.filter(m => m !== message);
                    resolve(message);
                }
            };
            
            this.messageHandlers.set(messageType, handler);
            
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

const testCasesDir = path.join(__dirname, 'testCases');

const testCaseFolders = fs.readdirSync(testCasesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

testCaseFolders.forEach(testCaseName => {
    test(`replay game via WebSocket: ${testCaseName}`, async () => {
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
        
        const client1 = new ChessClient('ws://localhost:3000/ws');
        const client2 = new ChessClient('ws://localhost:3000/ws');
        
        try {
            await Promise.all([
                client1.connect(),
                client2.connect()
            ]);
            
            client1.send({ type: 'findGame' });
            const waitingMessage = await client1.waitForMessage('waitingForOpponent');
            expect(waitingMessage.type).toBe('waitingForOpponent');
            
            client2.send({ type: 'findGame' });
            
            const [gameFound1, gameFound2] = await Promise.all([
                client1.waitForMessage('gameFound'),
                client2.waitForMessage('gameFound')
            ]);
            
            const whiteClient = gameFound1.data.color === 'white' ? client1 : client2;
            const blackClient = gameFound1.data.color === 'white' ? client2 : client1;
            
            whiteClient.color = 'white';
            blackClient.color = 'black';
            whiteClient.gameUUID = gameFound1.data.gameUUID;
            blackClient.gameUUID = gameFound2.data.gameUUID;
            
            for (const { file, number } of files) {
                const filePath = path.join(testCaseDir, file);
                const moveData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                const sendingClient = moveData.color === 'white' ? whiteClient : blackClient;
                
                const gameRequest = {
                    type: 'move',
                    from: moveData.cellFrom,
                    to: moveData.cellTo
                };
                
                if (moveData.promotionPiece) {
                    gameRequest.promotion = moveData.promotionPiece;
                }
                
                whiteClient.clearMessages('gameResponse');
                
                sendingClient.send({
                    type: 'gameRequest',
                    gameRequest: gameRequest
                });
                
                const gameResponse = await whiteClient.waitForMessage('gameResponse', 10000);
                
                expect(gameResponse.data.success).toBe(true);
                
                if (!gameResponse.data.success) {
                    throw new Error(`Move ${number} failed: ${gameResponse.data.error || 'Unknown error'}`);
                }
                
                const currentPosition = convertBoardToPositionMatrix(gameResponse.data.state.board);
                const currentGameStatus = gameResponse.data.state.gameStatus;
                
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
        } finally {
            client1.close();
            client2.close();
        }
    });
});
