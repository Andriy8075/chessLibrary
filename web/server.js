const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Game = require('../library/src/Game');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const port = 3000;

app.use(express.static(path.join(__dirname)));

const wss = new WebSocket.Server({ server: server, path: '/ws' });

const games = {};
let waitingPlayer = null;
const mesasges = {
    findGame: (ws, message) => {
        if (waitingPlayer === null) {
            waitingPlayer = ws;
            waitingPlayer.send(JSON.stringify({
                type: 'waitingForOpponent',
            }))
        }
        else {
            const game = new Game();
            const gameUUID = uuidv4();
            games[gameUUID] = game;
            const serializedState = game.getSerializedState();
            const waitingPlayerMessage = JSON.stringify({
                type: 'gameFound',
                data: {
                    gameUUID: gameUUID,
                    gameState: serializedState,
                    color: 'black',
                }
            })
            const wsMessage = JSON.stringify({
                type: 'gameFound',
                data: {
                    gameUUID: gameUUID,
                    gameState: serializedState,
                    color: 'white',
                }
            })
            waitingPlayer.send(waitingPlayerMessage);
            ws.send(wsMessage);
            ws.data = ws.data || {};
            waitingPlayer.data = waitingPlayer.data || {};
            ws.data.color = 'white';
            waitingPlayer.data.color = 'black';
            waitingPlayer.data.gameUUID = gameUUID;
            ws.data.gameUUID = gameUUID;
            waitingPlayer.data.opponent = ws;
            ws.data.opponent = waitingPlayer;
            waitingPlayer = null;
        }
    },
    gameRequest: (ws, message) => {
        const gameUUID = ws.data.gameUUID;
        const game = games[gameUUID];
        const gameRequest = message.gameRequest;
        gameRequest.color = ws.data.color;
        const result = game.processRequest(gameRequest);
        
        if (result.state) {
            result.state = game.getSerializedState();
        }
        
        const toSend = JSON.stringify({
            type: 'gameResponse',
            data: result
        })
        ws.send(toSend);
        if (result.success) {
            const opponent = ws.data.opponent;
            opponent.send(toSend);
        }
    }
};

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        try {
            const messageString = Buffer.isBuffer(message) ? message.toString('utf8') : message;
            const parsedMessage = JSON.parse(messageString);
            const func = parsedMessage.type;
            if (func && func in mesasges) {
                mesasges[func](ws, parsedMessage);
            }
        } catch (e) {
            console.error('Failed to parse message:', e);
        }
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`HTTP: http://localhost:${port}`);
    console.log(`WebSocket: ws://localhost:${port}/ws`);
});
