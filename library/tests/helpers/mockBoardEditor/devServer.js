import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mockBoardsFolder from '../mockBoardsFolder.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const boardsRoot = mockBoardsFolder;
const rootDir = __dirname;
const port = process.env.MOCK_EDITOR_PORT ? parseInt(process.env.MOCK_EDITOR_PORT, 10) : 3002;

const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
    console.error('ERROR: Production build not found. Please run "npm run build" first.');
    console.error(`Expected build directory: ${distDir}`);
    process.exit(1);
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('ERROR: Production build is incomplete. index.html not found in dist folder.');
    console.error(`Expected file: ${path.join(distDir, 'index.html')}`);
    process.exit(1);
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html':
            return 'text/html; charset=utf-8';
        case '.js':
        case '.mjs':
            return 'application/javascript; charset=utf-8';
        case '.jsx':
            return 'application/javascript; charset=utf-8';
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

function sendJson(res, status, data) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
}

function sendError(res, status, message) {
    sendJson(res, status, { error: message });
}

function safeBoardsPath(relPath) {
    const normalized = path
        .normalize(relPath || '')
        .replace(/^(\.\.[/\\])+/, '');
    return path.join(boardsRoot, normalized);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
            if (data.length > 1e6) {
                req.connection.destroy();
                reject(new Error('Body too large'));
            }
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

async function buildTree(dir, basePath = '') {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const children = [];

    for (const dirent of dirents) {
        const fullPath = path.join(dir, dirent.name);
        const relPath = basePath ? `${basePath}/${dirent.name}` : dirent.name;

        if (dirent.isDirectory()) {
            const node = {
                name: dirent.name,
                path: relPath,
                kind: 'directory',
                children: await buildTree(fullPath, relPath)
            };
            children.push(node);
        } else {
            children.push({
                name: dirent.name,
                path: relPath,
                kind: 'file'
            });
        }
    }

    return children;
}

async function handleBoardsApi(req, res, pathname, parsedUrl) {
    if (req.method === 'GET' && pathname === '/api/boards/tree') {
        try {
            const rootName = path.basename(boardsRoot);
            const children = await buildTree(boardsRoot, '');
            sendJson(res, 200, {
                root: {
                    name: rootName,
                    path: '',
                    kind: 'directory',
                    children
                }
            });
        } catch (e) {
            console.error(e);
            sendError(res, 500, 'Failed to read boards tree');
        }
        return;
    }

    if (req.method === 'GET' && pathname === '/api/boards/file') {
        const query = new URLSearchParams(parsedUrl.query || '');
        const relPath = query.get('path') || '';
        const filePath = safeBoardsPath(relPath);
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            sendJson(res, 200, { path: relPath, content });
        } catch (e) {
            console.error(e);
            sendError(res, 404, 'File not found');
        }
        return;
    }

    if (req.method === 'POST' && pathname === '/api/boards/folder') {
        try {
            const body = await readBody(req);
            const { parentPath = '', name } = JSON.parse(body || '{}');
            if (!name) {
                sendError(res, 400, 'Missing folder name');
                return;
            }
            const parentDir = safeBoardsPath(parentPath);
            const target = path.join(parentDir, name);
            await fs.promises.mkdir(target, { recursive: true });
            sendJson(res, 200, { ok: true });
        } catch (e) {
            console.error(e);
            sendError(res, 500, 'Failed to create folder');
        }
        return;
    }

    if (req.method === 'POST' && pathname === '/api/boards/file') {
        try {
            const body = await readBody(req);
            const { parentPath = '', name, content = '' } = JSON.parse(body || '{}');
            if (!name) {
                sendError(res, 400, 'Missing file name');
                return;
            }
            const parentDir = safeBoardsPath(parentPath);
            const target = path.join(parentDir, name);
            await fs.promises.writeFile(target, content, 'utf8');
            sendJson(res, 200, { ok: true });
        } catch (e) {
            console.error(e);
            sendError(res, 500, 'Failed to create file');
        }
        return;
    }

    if (req.method === 'PUT' && pathname === '/api/boards/file') {
        try {
            const body = await readBody(req);
            const { path: relPath = '', content = '' } = JSON.parse(body || '{}');
            const filePath = safeBoardsPath(relPath);
            await fs.promises.writeFile(filePath, content, 'utf8');
            sendJson(res, 200, { ok: true });
        } catch (e) {
            console.error(e);
            sendError(res, 500, 'Failed to save file');
        }
        return;
    }

    if (req.method === 'DELETE' && pathname === '/api/boards/entry') {
        try {
            const body = await readBody(req);
            const { path: relPath = '' } = JSON.parse(body || '{}');
            const targetPath = safeBoardsPath(relPath);

            const stat = await fs.promises.stat(targetPath);

            if (stat.isDirectory()) {
                await fs.promises.rm(targetPath, { recursive: true, force: true });
            } else {
                await fs.promises.unlink(targetPath);
            }

            sendJson(res, 200, { ok: true });
        } catch (e) {
            console.error(e);
            sendError(res, 500, 'Failed to delete entry');
        }
        return;
    }

    if (req.method === 'PATCH' && pathname === '/api/boards/entry') {
        try {
            const body = await readBody(req);
            const { path: relPath = '', newName } = JSON.parse(body || '{}');
            
            if (!newName) {
                sendError(res, 400, 'Missing new name');
                return;
            }

            const targetPath = safeBoardsPath(relPath);
            const parts = relPath.split('/');
            parts.pop();
            const parentPath = parts.join('/');
            const newPath = parentPath ? `${parentPath}/${newName}` : newName;
            const newTargetPath = safeBoardsPath(newPath);

            try {
                await fs.promises.stat(targetPath);
            } catch (e) {
                if (e.code === 'ENOENT') {
                    sendError(res, 404, 'File or folder not found');
                    return;
                }
                throw e;
            }

            try {
                await fs.promises.stat(newTargetPath);
                sendError(res, 409, 'A file or folder with that name already exists');
                return;
            } catch (e) {
            }

            await fs.promises.rename(targetPath, newTargetPath);

            try {
                await fs.promises.stat(targetPath);
                sendError(res, 500, 'Rename operation failed - old file still exists');
                return;
            } catch (e) {
            }

            try {
                await fs.promises.stat(newTargetPath);
            } catch (e) {
                sendError(res, 500, 'Rename operation failed - new file does not exist');
                return;
            }

            sendJson(res, 200, { ok: true, newPath });
        } catch (e) {
            console.error(e);
            if (e.code === 'ENOENT') {
                sendError(res, 404, 'File or folder not found');
            } else {
                sendError(res, 500, 'Failed to rename entry');
            }
        }
        return;
    }

    sendError(res, 404, 'Unknown boards API endpoint');
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname || '/';

    if (pathname.startsWith('/api/boards')) {
        handleBoardsApi(req, res, pathname, parsedUrl);
        return;
    }

    let filePath;
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const safePath = path
        .normalize(pathname)
        .replace(/^(\.\.[/\\])+/, '');
    filePath = path.join(distDir, safePath);

    fs.stat(filePath, (err, stats) => {
        if ((err || !stats.isFile()) && !pathname.startsWith('/api/')) {
            const indexPath = path.join(distDir, 'index.html');
            fs.stat(indexPath, (indexErr, indexStats) => {
                if (indexErr || !indexStats.isFile()) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end('Not found');
                    return;
                }
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                const stream = fs.createReadStream(indexPath);
                stream.on('error', () => {
                    res.statusCode = 500;
                    res.end('Internal server error');
                });
                stream.pipe(res);
            });
            return;
        }
        
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

