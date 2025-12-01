#!/bin/sh
cd "$(dirname "$0")"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Starting Vite dev server..."
exec npm run dev
