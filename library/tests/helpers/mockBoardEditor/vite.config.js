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
      host: isDocker ? 'localhost' : 'localhost',
      port: 3001,
      protocol: 'ws'
    },
    proxy: {
      // Only proxy /api routes, explicitly exclude Vite internal paths
      '^/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            // Don't log connection errors repeatedly - they're expected if API server isn't running
            if (err.code !== 'ECONNREFUSED') {
              console.error('Proxy error:', err.message);
            }
          });
        },
        // Better error handling when backend is not available
        timeout: 5000,
        proxyTimeout: 5000
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
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: false // Set to true to force re-optimization if needed
  }
});

