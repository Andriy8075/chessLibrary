import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { chdir } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
chdir(__dirname);

let viteProcess = null;

function startVite() {
    if (viteProcess) {
        console.log('Restarting Vite dev server...');
        viteProcess.kill('SIGTERM');
        viteProcess = null;
    }
    
    console.log('Starting Vite dev server...');
    viteProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });
    
    viteProcess.on('exit', (code, signal) => {
        if (signal !== 'SIGTERM' && code !== 0 && code !== null) {
            console.error(`Vite exited with code ${code}`);
        }
    });
}

// Start Vite initially
startVite();

// Handle termination
process.on('SIGTERM', () => {
    if (viteProcess) {
        viteProcess.kill('SIGTERM');
    }
    process.exit(0);
});

process.on('SIGINT', () => {
    if (viteProcess) {
        viteProcess.kill('SIGTERM');
    }
    process.exit(0);
});

