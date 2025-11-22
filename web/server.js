const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.static(path.join(__dirname)));

app.get('/config', (req, res) => {
    res.json({ wsPort: port });
});

const wss = new WebSocket.Server({ server: server, path: '/ws' });

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        ws.send(`Echo: ${message}`);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`HTTP: http://localhost:${port}`);
    console.log(`WebSocket: ws://localhost:${port}/ws`);
});
