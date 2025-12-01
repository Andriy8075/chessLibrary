const fs = require('fs');
const path = require('path');

const boardsRoot = path.join(__dirname, '../boards');

function detectBoardType(relativePath) {
    // relativePath like "findAllPossibleMoves/Rook/rookOnTheEdge.js"
    const parts = relativePath.split(path.sep);
    const top = parts[0] || '';

    if (top.toLowerCase().includes('passant')) {
        return 'enPassant';
    }

    if (top.toLowerCase().includes('simple')) {
        return 'simpleBoard';
    }

    // Default: use the top-level folder name as boardType
    return top || 'unknown';
}

async function walk(dir, files = []) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walk(fullPath, files);
        } else if (entry.isFile() && fullPath.endsWith('.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function convert() {
    console.log(`Scanning boards in: ${boardsRoot}`);
    const jsFiles = await walk(boardsRoot);

    for (const filePath of jsFiles) {
        const rel = path.relative(boardsRoot, filePath);
        const boardType = detectBoardType(rel);

        const jsonPath = filePath.replace(/\.js$/, '.json');

        // Load the existing JS module (CommonJS)
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const schema = require(filePath);

        const jsonData = {
            boardType,
            ...schema
        };

        const jsonString = JSON.stringify(jsonData, null, 4);

        await fs.promises.writeFile(jsonPath, jsonString, 'utf8');
        console.log(`Converted ${rel} -> ${path.relative(boardsRoot, jsonPath)} (boardType="${boardType}")`);
    }

    console.log('Conversion complete.');
}

convert().catch(err => {
    console.error('Error during conversion:', err);
    process.exit(1);
});


