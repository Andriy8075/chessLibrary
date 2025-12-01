import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { watch } from 'chokidar';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Get paths relative to project root (4 levels up from mockBoardEditor)
const projectRoot = path.resolve(__dirname, '../../../../');
const librarySrc = path.resolve(projectRoot, 'library/src');
const webDir = path.resolve(projectRoot, 'web');
const libraryTestsBoards = path.resolve(projectRoot, 'library/tests/boards').replace(/\\/g, '/');

// Detect if running in Docker (check for common Docker indicators)
const isDocker = process.env.DOCKER === 'true' || 
                 (process.platform === 'linux' && existsSync('/.dockerenv'));

// Custom plugin to watch external directories and trigger HMR
function watchExternalFiles() {
  return {
    name: 'watch-external-files',
    configureServer(server) {
      // Watch entire project root except library/tests/boards
      const watcher = watch([
        path.join(projectRoot, '**/*'),
      ], {
        ignored: [
          '**/node_modules/**',
          '**/coverage/**',
          '**/*.log',
          // Ignore library/tests/boards specifically
          path.join(projectRoot, 'library/tests/boards/**').replace(/\\/g, '/')
        ],
        ignoreInitial: true,
        persistent: true,
        // Enable polling in Docker for file watching to work with volume mounts
        usePolling: isDocker,
        interval: isDocker ? 1000 : undefined
      });

      watcher.on('change', (filePath) => {
        console.log(`External file changed: ${filePath}`);
        // Trigger full page reload for external file changes
        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      });

      watcher.on('add', (filePath) => {
        console.log(`External file added: ${filePath}`);
        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    watchExternalFiles()
  ],
  root: '.',
  publicDir: 'images',
  server: {
    host: '0.0.0.0', // Allow access from outside Docker container
    port: 3001,
    watch: {
      // Watch library source and web directories
      ignored: [
        '**/node_modules/**',
        '**/coverage/**',
        '**/*.log',
        // Ignore library/tests/boards specifically
        libraryTestsBoards + '/**'
      ],
      // Enable polling in Docker for file watching to work with volume mounts
      usePolling: isDocker,
      interval: isDocker ? 1000 : undefined
    },
    hmr: {
      host: 'localhost',
      port: 3001
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    },
    // Allow serving files from parent directories if needed
    fs: {
      allow: ['..', '../..', '../../..', '../../../..']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index-react.html')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});

