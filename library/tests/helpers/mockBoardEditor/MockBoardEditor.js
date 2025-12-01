import { generateMockBoardFile } from './fileGenerator.js';

export class MockBoardEditor {
    constructor() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.selectedPiece = null;
        this.selectedColor = null;
        this.mode = 'place'; // 'place', 'main', 'moves'
        this.activeTab = 'moves'; // 'moves', 'enPassant', 'simple'
        this.currentBoardType = 'findAllPossibleMoves';
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

    loadFromSchema(schema) {
        if (!schema || !Array.isArray(schema.pieces)) {
            return;
        }

        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel && editorPanel.classList.contains('hidden')) {
            editorPanel.classList.remove('hidden');
        }

        // Reset internal state
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
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

        // Remember board type and determine tab
        this.currentBoardType = schema.boardType || this.currentBoardType;
        const type = this.currentBoardType || '';
        if (type === 'simpleBoard') {
            this.activeTab = 'simple';
        } else if (type === 'enPassant') {
            this.activeTab = 'enPassant';
        } else {
            this.activeTab = 'moves';
        }

        // Update tab buttons to match the active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.activeTab);
        });

        // Place pieces
        (schema.pieces || []).forEach(p => {
            if (!p.position) return;
            const row = p.position.row;
            const col = p.position.col;
            if (row < 1 || row > 8 || col < 1 || col > 8) return;
            const cell = { row, col };
            this.board[row - 1][col - 1] = {
                type: p.type,
                color: p.color,
                position: cell
            };
        });

        // Rebuild pieces array from board
        this.updatePiecesList();

        // Main piece & moves for non-simple boards
        if (this.activeTab !== 'simple') {
            if (schema.mainPiecePosition) {
                const cell = {
                    row: schema.mainPiecePosition.row,
                    col: schema.mainPiecePosition.col
                };
                const piece = this.getPiece(cell);
                if (piece) {
                    this.mainPiece = { ...piece, position: cell };
                }
            }

            if (Array.isArray(schema.moves)) {
                this.validMoves = schema.moves.map(m => ({
                    row: m.row,
                    col: m.col
                }));
            }
        }

        // Extra info (en passant, pieces made moves)
        if (schema.extraInfo) {
            if (schema.extraInfo.enPassantTarget) {
                this.extraInfo.enPassantTarget = {
                    row: schema.extraInfo.enPassantTarget.row,
                    col: schema.extraInfo.enPassantTarget.col
                };

                const rowInput = document.getElementById('enPassantRow');
                const colInput = document.getElementById('enPassantCol');
                if (rowInput) rowInput.value = this.extraInfo.enPassantTarget.row;
                if (colInput) colInput.value = this.extraInfo.enPassantTarget.col;
            } else {
                const rowInput = document.getElementById('enPassantRow');
                const colInput = document.getElementById('enPassantCol');
                if (rowInput) rowInput.value = '';
                if (colInput) colInput.value = '';
            }

            if (schema.extraInfo.piecesMadeMoves) {
                Object.keys(this.extraInfo.piecesMadeMoves).forEach(key => {
                    this.extraInfo.piecesMadeMoves[key] = !!schema.extraInfo.piecesMadeMoves[key];
                    const checkbox = document.querySelector(`.pieces-moved-controls input[data-key="${key}"]`);
                    if (checkbox) {
                        checkbox.checked = this.extraInfo.piecesMadeMoves[key];
                    }
                });
            }
        }

        // Apply tab-specific UI and redraw board
        this.updateTabVisibility();
    }

    getCurrentSchema(boardTypeOverride) {
        const boardType =
            boardTypeOverride ||
            this.currentBoardType ||
            (this.activeTab === 'simple'
                ? 'simpleBoard'
                : this.activeTab === 'enPassant'
                    ? 'enPassant'
                    : 'findAllPossibleMoves');

        const schema = {
            boardType,
            pieces: this.pieces.map(p => ({
                type: p.type,
                color: p.color,
                position: {
                    row: p.position.row,
                    col: p.position.col
                }
            }))
        };

        if (this.activeTab !== 'simple') {
            if (this.mainPiece && this.mainPiece.position) {
                schema.mainPiecePosition = {
                    row: this.mainPiece.position.row,
                    col: this.mainPiece.position.col
                };
            }

            if (this.validMoves && this.validMoves.length > 0) {
                schema.moves = this.validMoves.map(m => ({
                    row: m.row,
                    col: m.col
                }));
            }
        }

        const hasEnPassant = this.extraInfo.enPassantTarget !== null;
        const hasPiecesMoved = Object.values(this.extraInfo.piecesMadeMoves || {}).some(v => v === true);

        if (hasEnPassant || hasPiecesMoved) {
            schema.extraInfo = {};

            if (hasEnPassant) {
                schema.extraInfo.enPassantTarget = {
                    row: this.extraInfo.enPassantTarget.row,
                    col: this.extraInfo.enPassantTarget.col
                };
            }

            if (hasPiecesMoved) {
                schema.extraInfo.piecesMadeMoves = {};
                Object.keys(this.extraInfo.piecesMadeMoves).forEach(key => {
                    if (this.extraInfo.piecesMadeMoves[key]) {
                        schema.extraInfo.piecesMadeMoves[key] = true;
                    }
                });
            }
        }

        return schema;
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.updateTabVisibility();
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
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTab = btn.dataset.tab;
                this.updateTabVisibility();
            });
        });

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

    updateTabVisibility() {
        const extraInfoPanel = document.querySelector('.extra-info-panel');
        const mainBtn = document.querySelector('.mode-btn[data-mode="main"]');
        const movesBtn = document.querySelector('.mode-btn[data-mode="moves"]');
        const placeBtn = document.querySelector('.mode-btn[data-mode="place"]');

        if (this.activeTab === 'moves') {
            // Full moves testing: place + main + moves, no extra info
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';

            [mainBtn, movesBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                }
            });
        } else if (this.activeTab === 'enPassant') {
            // En passant testing: same as moves, but with extra info
            if (extraInfoPanel) extraInfoPanel.style.display = 'flex';

            [mainBtn, movesBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                }
            });
        } else if (this.activeTab === 'simple') {
            // Simple board: only placing pieces
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';

            if (mainBtn) {
                mainBtn.disabled = true;
                mainBtn.classList.add('disabled');
            }
            if (movesBtn) {
                movesBtn.disabled = true;
                movesBtn.classList.add('disabled');
            }

            // Force mode to place
            this.mode = 'place';
            if (placeBtn) {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                placeBtn.classList.add('active');
            }
        }

        // Ensure board display matches current mode/tab
        this.updateBoardDisplay();
        this.updateInfo();
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
                    img.src = `images/${piece.color}${piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}.png`;
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
        return generateMockBoardFile({
            fileName,
            activeTab: this.activeTab,
            pieces: this.pieces,
            validMoves: this.validMoves,
            mainPiece: this.mainPiece,
            extraInfo: this.extraInfo
        });
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
            const blob = new Blob([fileContent], { type: 'application/json' });

            // Try to use File System Access API (modern browsers)
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: `${sanitizedFileName}.json`,
                        types: [{
                            description: 'JSON files',
                            accept: { 'application/json': ['.json'] }
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
                a.download = `${sanitizedFileName}.json`;
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


