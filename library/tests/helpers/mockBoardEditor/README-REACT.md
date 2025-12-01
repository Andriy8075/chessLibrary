# Mock Board Editor - React Version

This is the React rewrite of the Mock Board Editor with routing and reusable components.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development servers:

**Option 1: Use Vite dev server (recommended for development)**
```bash
# Terminal 1: Start the API server (on port 3002)
node devServer.js

# Terminal 2: Start Vite dev server (on port 3001)
npm run dev
```

The React app will be available at `http://localhost:3001`. The Vite dev server will proxy API requests to the Node.js server on port 3002.

**Option 2: Use Node.js server only (for production build)**
```bash
# Build the React app first
npm run build

# Then start the Node.js server (it will serve the built files)
node devServer.js
```

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main app component with routing
├── hooks/
│   └── useBoardEditor.js # Custom hook for board state management
├── components/
│   ├── ChessBoard.jsx    # Chess board display component
│   ├── PieceSelector.jsx # Piece selection component
│   ├── ModeSelector.jsx  # Mode selection component
│   ├── FileExplorer.jsx  # File explorer component
│   ├── ExpectedResult.jsx # Reusable expected result radio buttons
│   ├── ColorSelector.jsx  # Reusable color selector
│   ├── EnPassantInfo.jsx  # En passant info component
│   └── BoardTypeSelector.jsx # Board type selection
└── routes/
    ├── FindAllPossibleMoves.jsx
    ├── EnPassant.jsx
    ├── SimpleBoard.jsx
    ├── IsSquareAttacked.jsx
    ├── IsKingInCheck.jsx
    └── WouldMoveCauseCheck.jsx
```

## Features

- **React Router**: Each board type has its own route (`/findAllPossibleMoves`, `/enPassant`, etc.)
- **Reusable Components**: 
  - `ExpectedResult`: Radio buttons for true/false results
  - `ColorSelector`: Radio buttons for white/black selection
  - `EnPassantInfo`: En passant target and pieces moved info
- **State Management**: Custom `useBoardEditor` hook manages all board state
- **File Explorer**: Integrated file explorer for managing board files

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Integration with Existing Server

The React app uses the same API endpoints (`/api/boards/*`) as the vanilla JS version. The `devServer.js` should continue to work, but you may want to update it to serve the React app's built files or proxy to Vite's dev server.

