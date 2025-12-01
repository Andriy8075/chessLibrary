class MockBoardEditor {
    constructor() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.selectedPiece = null;
        this.selectedColor = null;
        this.mode = 'place'; // 'place', 'main', 'moves'
        this.mainPiece = null;
        this.validMoves = [];
        this.pieces = [];
        this.extraInfo = {
            enPassantTarget: null,
            piecesMadeMoves: {
                whiteKing: false,
                blackKing: false,
                whiteKingsideRook: false,
                whiteQueensideRook: false,
                blackKingsideRook: false,
                blackQueensideRook: false
            }
        };
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.updateInfo();
    }

    createBoard() {
        const boardElement = document.getElementById('chessBoard');
        boardElement.innerHTML = '';

        for (let row = 8; row >= 1; row--) {
            for (let col = 1; col <= 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                boardElement.appendChild(square);
            }
        }
        this.updateBoardDisplay();
    }

    setupEventListeners() {
        // Piece selection
        document.querySelectorAll('.piece-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.piece-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                if (option.dataset.piece === 'remove') {
                    this.selectedPiece = 'remove';
                    this.selectedColor = null;
                } else {
                    this.selectedPiece = option.dataset.piece;
                    this.selectedColor = option.dataset.color;
                }
            });
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                this.updateBoardDisplay();
            });
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => this.saveMockBoard());

        // En Passant controls
        document.getElementById('enPassantRow').addEventListener('input', () => this.updateEnPassant());
        document.getElementById('enPassantCol').addEventListener('input', () => this.updateEnPassant());
        document.getElementById('clearEnPassant').addEventListener('click', () => this.clearEnPassant());

        // Pieces Made Moves checkboxes
        document.querySelectorAll('.pieces-moved-controls input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const key = checkbox.dataset.key;
                this.extraInfo.piecesMadeMoves[key] = checkbox.checked;
            });
        });
    }

    handleSquareClick(row, col) {
        const cell = { row, col };
        
        if (this.mode === 'place') {
            if (this.selectedPiece === 'remove') {
                this.removePiece(cell);
            } else if (this.selectedPiece && this.selectedColor) {
                this.placePiece(cell, this.selectedPiece, this.selectedColor);
            }
        } else if (this.mode === 'main') {
            const piece = this.getPiece(cell);
            if (piece) {
                this.mainPiece = { ...piece, position: cell };
                this.updateInfo();
                this.updateBoardDisplay();
            }
        } else if (this.mode === 'moves') {
            if (this.mainPiece) {
                this.toggleValidMove(cell);
            } else {
                alert('Please select a main piece first!');
            }
        }
    }

    placePiece(cell, type, color) {
        const existingPiece = this.getPiece(cell);
        if (existingPiece) {
            this.removePiece(cell);
        }
        
        this.board[cell.row - 1][cell.col - 1] = { type, color, position: cell };
        this.updatePiecesList();
        this.updateInfo();
        this.updateBoardDisplay();
    }

    removePiece(cell) {
        this.board[cell.row - 1][cell.col - 1] = null;
        if (this.mainPiece && 
            this.mainPiece.position.row === cell.row && 
            this.mainPiece.position.col === cell.col) {
            this.mainPiece = null;
            this.validMoves = [];
        }
        this.updatePiecesList();
        this.updateInfo();
        this.updateBoardDisplay();
    }

    getPiece(cell) {
        return this.board[cell.row - 1][cell.col - 1];
    }

    toggleValidMove(cell) {
        const index = this.validMoves.findIndex(
            m => m.row === cell.row && m.col === cell.col
        );
        
        if (index >= 0) {
            this.validMoves.splice(index, 1);
        } else {
            this.validMoves.push({ row: cell.row, col: cell.col });
        }
        
        this.updateInfo();
        this.updateBoardDisplay();
    }

    updatePiecesList() {
        this.pieces = [];
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = this.getPiece({ row, col });
                if (piece) {
                    this.pieces.push({
                        type: piece.type,
                        color: piece.color,
                        position: { row, col }
                    });
                }
            }
        }
    }

    updateBoardDisplay() {
        for (let row = 8; row >= 1; row--) {
            for (let col = 1; col <= 8; col++) {
                const square = document.querySelector(
                    `.square[data-row="${row}"][data-col="${col}"]`
                );
                const piece = this.getPiece({ row, col });
                
                // Clear previous state
                square.classList.remove('has-piece', 'main-piece', 'valid-move');
                square.innerHTML = '';
                
                // Add piece if exists
                if (piece) {
                    square.classList.add('has-piece');
                    const img = document.createElement('img');
                    img.src = `../../../../web/images/${piece.color}${piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}.png`;
                    img.alt = `${piece.color} ${piece.type}`;
                    square.appendChild(img);
                }
                
                // Mark main piece
                if (this.mainPiece && 
                    this.mainPiece.position.row === row && 
                    this.mainPiece.position.col === col) {
                    square.classList.add('main-piece');
                }
                
                // Mark valid moves
                if (this.validMoves.some(m => m.row === row && m.col === col)) {
                    square.classList.add('valid-move');
                }
            }
        }
    }

    updateInfo() {
        document.getElementById('mainPieceInfo').textContent = 
            this.mainPiece 
                ? `Main Piece: ${this.mainPiece.color} ${this.mainPiece.type} at (${this.mainPiece.position.row}, ${this.mainPiece.position.col})`
                : 'Main Piece: None';
        
        document.getElementById('piecesCount').textContent = 
            `Pieces: ${this.pieces.length}`;
        
        document.getElementById('movesCount').textContent = 
            `Moves: ${this.validMoves.length}`;
    }

    updateEnPassant() {
        const row = parseInt(document.getElementById('enPassantRow').value);
        const col = parseInt(document.getElementById('enPassantCol').value);
        
        if (row >= 1 && row <= 8 && col >= 1 && col <= 8) {
            this.extraInfo.enPassantTarget = { row, col };
        } else {
            this.extraInfo.enPassantTarget = null;
        }
    }

    clearEnPassant() {
        document.getElementById('enPassantRow').value = '';
        document.getElementById('enPassantCol').value = '';
        this.extraInfo.enPassantTarget = null;
    }

    generateMockBoardFile(fileName) {
        const { pieces, moves } = {
            pieces: this.pieces,
            moves: this.validMoves
        };
        
        // Generate pieces array
        const piecesArray = pieces.map(p => 
            `        {type: '${p.type}', color: '${p.color}', position: {row: ${p.position.row}, col: ${p.position.col}}}`
        ).join(',\n');

        // Capitalize first letter for variable name
        const varName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

        // Generate mainPiecePosition if main piece is selected
        let mainPiecePositionStr = '';
        if (this.mainPiece) {
            mainPiecePositionStr = `    mainPiecePosition: {row: ${this.mainPiece.position.row}, col: ${this.mainPiece.position.col}},\n`;
        }

        // Generate moves array only if main piece is selected
        let movesStr = '';
        if (this.mainPiece) {
            const movesArray = moves.map(m => 
                `        {row: ${m.row}, col: ${m.col}}`
            ).join(',\n');
            movesStr = `    moves: [
${movesArray}
    ]`;
        }

        // Generate extraInfo if any is set
        let extraInfoStr = '';
        const hasEnPassant = this.extraInfo.enPassantTarget !== null;
        const hasPiecesMoved = Object.values(this.extraInfo.piecesMadeMoves).some(v => v === true);
        
        if (hasEnPassant || hasPiecesMoved) {
            extraInfoStr = '    extraInfo: {\n';
            
            if (hasEnPassant) {
                const ep = this.extraInfo.enPassantTarget;
                extraInfoStr += `        enPassantTarget: {row: ${ep.row}, col: ${ep.col}},\n`;
            }
            
            if (hasPiecesMoved) {
                extraInfoStr += '        piecesMadeMoves: {\n';
                const piecesMovedEntries = [];
                if (this.extraInfo.piecesMadeMoves.whiteKing) {
                    piecesMovedEntries.push('            whiteKing: true');
                }
                if (this.extraInfo.piecesMadeMoves.blackKing) {
                    piecesMovedEntries.push('            blackKing: true');
                }
                if (this.extraInfo.piecesMadeMoves.whiteKingsideRook) {
                    piecesMovedEntries.push('            whiteKingsideRook: true');
                }
                if (this.extraInfo.piecesMadeMoves.whiteQueensideRook) {
                    piecesMovedEntries.push('            whiteQueensideRook: true');
                }
                if (this.extraInfo.piecesMadeMoves.blackKingsideRook) {
                    piecesMovedEntries.push('            blackKingsideRook: true');
                }
                if (this.extraInfo.piecesMadeMoves.blackQueensideRook) {
                    piecesMovedEntries.push('            blackQueensideRook: true');
                }
                extraInfoStr += piecesMovedEntries.join(',\n');
                extraInfoStr += '\n        }\n';
            }
            
            extraInfoStr += '    }';
        }

        // Build the file content
        let fileContent = `${varName} = {
    pieces: [
${piecesArray}
    ]`;
        
        if (mainPiecePositionStr) {
            fileContent += `,\n${mainPiecePositionStr}${movesStr}`;
        }
        
        if (extraInfoStr) {
            fileContent += `,\n${extraInfoStr}`;
        }
        
        fileContent += `\n}\n\nmodule.exports = ${varName};\n`;
        
        return fileContent;
    }

    async saveMockBoard() {
        const fileName = document.getElementById('fileName').value.trim();
        const statusDiv = document.getElementById('saveStatus');
        
        if (!fileName) {
            statusDiv.textContent = 'Please enter a file name';
            statusDiv.className = 'error';
            return;
        }

        if (this.pieces.length === 0) {
            statusDiv.textContent = 'Please add at least one piece to the board';
            statusDiv.className = 'error';
            return;
        }

        // Sanitize file name
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '');
        if (!sanitizedFileName) {
            statusDiv.textContent = 'Invalid file name';
            statusDiv.className = 'error';
            return;
        }

        statusDiv.textContent = 'Generating file...';
        statusDiv.className = '';

        try {
            const fileContent = this.generateMockBoardFile(sanitizedFileName);
            const blob = new Blob([fileContent], { type: 'text/javascript' });
            
            // Try to use File System Access API (modern browsers)
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: `${sanitizedFileName}.js`,
                        types: [{
                            description: 'JavaScript files',
                            accept: { 'text/javascript': ['.js'] }
                        }]
                    });
                    
                    const writable = await fileHandle.createWritable();
                    await writable.write(fileContent);
                    await writable.close();
                    
                    statusDiv.textContent = 'File saved successfully!';
                    statusDiv.className = 'success';
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        throw err;
                    }
                    // User cancelled, fall through to download
                }
            } else {
                // Fallback: download file
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${sanitizedFileName}.js`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                statusDiv.textContent = 'File downloaded! Save it to library/tests/mockBoards/';
                statusDiv.className = 'success';
            }
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'error';
        }
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MockBoardEditor();
});

