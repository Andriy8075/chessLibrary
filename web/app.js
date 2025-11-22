let socket;

async function connectWebSocket() {
    try {
        const response = await fetch('/config');
        const config = await response.json();
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:${config.wsPort}/ws`;
        socket = new WebSocket(wsUrl);
        
        setupSocketHandlers();
    } catch (error) {
        console.error('Failed to get WebSocket config:', error);
    }
}

function setupSocketHandlers() {
    socket.onopen = function(event) {
        console.log('Connected to WebSocket server');
        socket.send('Hello Server!');
    };

    socket.onmessage = function(event) {
        console.log('Message from server:', event.data);
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

connectWebSocket();
