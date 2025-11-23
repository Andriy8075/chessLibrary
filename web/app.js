let socket;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    socket = new WebSocket(wsUrl);
    
    setupSocketHandlers();
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
