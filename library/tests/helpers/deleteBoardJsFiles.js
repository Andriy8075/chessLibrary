const fs = require('fs');
const path = require('path');

const boardsRoot = path.join(__dirname, '../boards');

async function walkAndDeleteJs(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await walkAndDeleteJs(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.js')) {
            console.log(`Deleting ${fullPath}`);
            await fs.promises.unlink(fullPath);
        }
    }
}

async function main() {
    console.log(`Deleting all .js files under: ${boardsRoot}`);
    await walkAndDeleteJs(boardsRoot);
    console.log('Done.');
}

main().catch(err => {
    console.error('Error while deleting .js files:', err);
    process.exit(1);
});


