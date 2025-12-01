const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const rootDir = path.join(__dirname);
const port = process.env.MOCK_EDITOR_PORT ? parseInt(process.env.MOCK_EDITOR_PORT, 10) : 3001;

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html':
            return 'text/html; charset=utf-8';
        case '.js':
            return 'text/javascript; charset=utf-8';
        case '.css':
            return 'text/css; charset=utf-8';
        case '.json':
            return 'application/json; charset=utf-8';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        default:
            return 'text/plain; charset=utf-8';
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    if (!pathname || pathname === '/') {
        pathname = '/index.html';
    }

    const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(rootDir, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end('Not found');
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', getContentType(filePath));

        const stream = fs.createReadStream(filePath);
        stream.on('error', () => {
            res.statusCode = 500;
            res.end('Internal server error');
        });
        stream.pipe(res);
    });
});

server.listen(port, () => {
    console.log(`MockBoardEditor server listening on http://localhost:${port}`);
});


