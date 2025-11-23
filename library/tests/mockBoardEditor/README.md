# Mock Board Editor

A serverless web-based tool for creating and saving mock chess boards for testing.

## Features

- **Place Pieces**: Click on a piece type and color, then click on the board to place it
- **Remove Pieces**: Select "Remove" and click on pieces to delete them
- **Select Main Piece**: Switch to "Select Main Piece" mode and click on a piece to mark it as the main piece being tested
- **Mark Moves**: Switch to "Mark Moves" mode and click on squares to mark where the main piece can move
- **Download File**: Download the mock board file and save it to `library/tests/mockBoards/`

## Usage

### Opening the Editor

Simply open `index.html` in your web browser. You can:
- Double-click the file to open it
- Or use a local file server if needed (for CORS reasons with images)

### Using the Editor

1. **Place Pieces**: 
   - Select a piece type and color from the piece selector
   - Click on any square on the board to place the piece

2. **Remove Pieces**:
   - Click the "Remove" option
   - Click on any piece on the board to remove it

3. **Select Main Piece**:
   - Click the "Select Main Piece" mode button
   - Click on a piece on the board to mark it as the main piece

4. **Mark Valid Moves**:
   - First select a main piece (see step 3)
   - Click the "Mark Moves" mode button
   - Click on squares to mark/unmark them as valid moves for the main piece

5. **Download**:
   - Enter a file name (e.g., "MyBoard")
   - Click "Download File"
   - In modern browsers, you'll get a file picker to save directly
   - In older browsers, the file will download automatically
   - Save the file to `library/tests/mockBoards/YourFileName.js`

## Generated File Format

The saved file will follow this format:

```javascript
const MockBoard = require('../Unit/canMove/MockBoard');

const YourFileName = {
    board: new MockBoard([
        {type: 'knight', color: 'black', position: {row: 4, col: 3}},
        {type: 'pawn', color: 'white', position: {row: 5, col: 4}}
    ]),
    moves: [
        {row: 6, col: 4},
        {row: 6, col: 2}
    ]
}

module.exports = YourFileName;
```

## Browser Compatibility

- **Modern browsers** (Chrome, Edge, Firefox, Safari): Supports File System Access API for direct file saving
- **Older browsers**: Falls back to automatic file download
- All functionality works without any server - just open the HTML file!

## File Structure

```
library/tests/mockBoardEditor/
├── index.html      # Main HTML file
├── style.css       # Stylesheet
├── app.js          # JavaScript application
└── README.md       # This file
```

