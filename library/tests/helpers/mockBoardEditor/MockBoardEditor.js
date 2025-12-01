export class MockBoardEditor {
    constructor(initialBoardType = 'findAllPossibleMoves') {
        this.selectedPiece = null;
        this.selectedColor = null;
        this.mode = 'place'; // 'place', 'main', 'moves', 'target', 'cellFrom', 'cellTo'
        this.activeTab = initialBoardType; // 'findAllPossibleMoves', 'enPassant', 'simpleBoard', 'isSquareAttacked', 'isKingInCheck', 'wouldMoveCauseCheck'
        this.currentBoardType = initialBoardType;

        // When true, we are editing an empty file that has no board type yet.
        // In this mode only the three tab buttons are shown until the user
        // chooses one, which sets the board type.
        this.awaitingBoardType = false;

        // Initialize board state
        this.resetBoardState();

        this.init();
    }

    resetBoardState() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
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
    }

    // Transfer pieces and relevant state from another editor instance
    transferPiecesFrom(sourceEditor) {
        if (!sourceEditor || !sourceEditor.board) {
            return;
        }

        // Copy board state (pieces positions)
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = sourceEditor.board[row][col];
                if (piece) {
                    this.board[row][col] = {
                        type: piece.type,
                        color: piece.color,
                        position: { row: row + 1, col: col + 1 }
                    };
                }
            }
        }

        // Rebuild pieces array
        this.updatePiecesList();

        // Copy extraInfo (en passant, pieces made moves) - shared across all board types
        if (sourceEditor.extraInfo) {
            this.extraInfo = {
                enPassantTarget: sourceEditor.extraInfo.enPassantTarget
                    ? { ...sourceEditor.extraInfo.enPassantTarget }
                    : null,
                piecesMadeMoves: { ...sourceEditor.extraInfo.piecesMadeMoves }
            };
        }

        // Copy UI state
        this.selectedPiece = sourceEditor.selectedPiece;
        this.selectedColor = sourceEditor.selectedColor;
        this.mode = sourceEditor.mode;
        this.awaitingBoardType = sourceEditor.awaitingBoardType;

        // Update display
        this.updateBoardDisplay();
    }

    setExpectedResult(value, trueRadioId, falseRadioId, propertyName) {
        if (value !== undefined && value !== null) {
            this[propertyName] = value === true;
            const trueRadio = document.getElementById(trueRadioId);
            const falseRadio = document.getElementById(falseRadioId);
            if (trueRadio) trueRadio.checked = this[propertyName] === true;
            if (falseRadio) falseRadio.checked = this[propertyName] === false;
        } else {
            this[propertyName] = null;
        }
    }

    loadFromSchema(schema) {
        if (!schema || !Array.isArray(schema.pieces)) {
            return;
        }

        // We have a concrete schema, so we are no longer waiting for type
        this.awaitingBoardType = false;

        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel && editorPanel.classList.contains('hidden')) {
            editorPanel.classList.remove('hidden');
        }

        // Remember board type and determine tab
        // Board types now match tab names directly
        this.currentBoardType = schema.boardType || this.currentBoardType;
        // Types now match tab names directly
        this.activeTab = this.currentBoardType || 'findAllPossibleMoves';

        // Reset internal state for a fresh board
        this.resetBoardState();

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

        // Apply tab-specific UI and redraw board
        this.updateTabVisibility();
    }

    getCurrentSchema(boardTypeOverride) {
        // Board types now match tab names directly
        const boardType =
            boardTypeOverride ||
            this.currentBoardType ||
            this.activeTab;

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

        if (this.activeTab === 'isSquareAttacked') {
            if (this.targetSquare) {
                schema.targetSquare = {
                    row: this.targetSquare.row,
                    col: this.targetSquare.col
                };
            }
            if (this.expectedResult !== null && this.expectedResult !== undefined) {
                schema.expectedResult = this.expectedResult === true;
            }
            if (this.attackingColor) {
                schema.attackingColor = this.attackingColor;
            }
        } else if (this.activeTab === 'isKingInCheck') {
            if (this.kingColor) {
                schema.color = this.kingColor;
            }
            if (this.kingCheckResult !== null && this.kingCheckResult !== undefined) {
                schema.expectedResult = this.kingCheckResult === true;
            }
        } else if (this.activeTab === 'wouldMoveCauseCheck') {
            if (this.cellFrom) {
                schema.cellFrom = {
                    row: this.cellFrom.row,
                    col: this.cellFrom.col
                };
            }
            if (this.cellTo) {
                schema.cellTo = {
                    row: this.cellTo.row,
                    col: this.cellTo.col
                };
            }
            if (this.wouldMoveCauseCheckResult !== null && this.wouldMoveCauseCheckResult !== undefined) {
                schema.expectedResult = this.wouldMoveCauseCheckResult === true;
            }
        } else if (this.activeTab !== 'simpleBoard') {
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

                square.addEventListener('click', () => {
                    const editor = window.currentEditor || this;
                    editor.handleSquareClick(row, col);
                });

                boardElement.appendChild(square);
            }
        }
        this.updateBoardDisplay();
    }

    setupEventListeners() {
        // Tabs (board type selector)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentEditor = window.currentEditor || this;
                const newBoardType = btn.dataset.tab;
                
                // If switching to the same type, do nothing
                if (currentEditor.currentBoardType === newBoardType) {
                    return;
                }

                // Create a new editor instance of the correct type and transfer pieces
                if (window.createEditorForType) {
                    const newEditor = window.createEditorForType(newBoardType, currentEditor);
                    
                    // Replace the global editor reference
                    window.currentEditor = newEditor;

                    // Update tab buttons
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // If we were waiting for a type for a new file, we can now
                    // reveal the rest of the controls.
                    newEditor.awaitingBoardType = false;

                    newEditor.updateTabVisibility();
                } else {
                    // Fallback to old behavior if factory not available
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    this.activeTab = btn.dataset.tab;
                    this.currentBoardType = this.activeTab;
                    this.awaitingBoardType = false;
                    this.updateTabVisibility();
                }
            });
        });

        // Piece selection
        document.querySelectorAll('.piece-option').forEach(option => {
            option.addEventListener('click', () => {
                const editor = window.currentEditor || this;
                document.querySelectorAll('.piece-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                if (option.dataset.piece === 'remove') {
                    editor.selectedPiece = 'remove';
                    editor.selectedColor = null;
                } else {
                    editor.selectedPiece = option.dataset.piece;
                    editor.selectedColor = option.dataset.color;
                }
            });
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const editor = window.currentEditor || this;
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                editor.mode = btn.dataset.mode;
                editor.updateBoardDisplay();
            });
        });


        // En Passant controls
        document.getElementById('enPassantRow').addEventListener('input', () => {
            const editor = window.currentEditor || this;
            editor.updateEnPassant();
        });
        document.getElementById('enPassantCol').addEventListener('input', () => {
            const editor = window.currentEditor || this;
            editor.updateEnPassant();
        });
        document.getElementById('clearEnPassant').addEventListener('click', () => {
            const editor = window.currentEditor || this;
            editor.clearEnPassant();
        });

        // Pieces Made Moves checkboxes
        document.querySelectorAll('.pieces-moved-controls input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const editor = window.currentEditor || this;
                const key = checkbox.dataset.key;
                editor.extraInfo.piecesMadeMoves[key] = checkbox.checked;
            });
        });

        // Is Square Attacked controls
        const clearTargetSquareBtn = document.getElementById('clearTargetSquare');
        if (clearTargetSquareBtn) {
            clearTargetSquareBtn.addEventListener('click', () => {
                const editor = window.currentEditor || this;
                editor.clearTargetSquare();
            });
        }

        document.querySelectorAll('input[name="expectedResult"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const editor = window.currentEditor || this;
                if (radio.checked) {
                    editor.expectedResult = radio.value === 'true';
                }
            });
        });

        document.querySelectorAll('input[name="attackingColor"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const editor = window.currentEditor || this;
                if (radio.checked) {
                    editor.attackingColor = radio.value;
                }
            });
        });

        document.querySelectorAll('input[name="kingColor"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const editor = window.currentEditor || this;
                if (radio.checked) {
                    editor.kingColor = radio.value;
                }
            });
        });

        document.querySelectorAll('input[name="kingCheckResult"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const editor = window.currentEditor || this;
                if (radio.checked) {
                    editor.kingCheckResult = radio.value === 'true';
                }
            });
        });

        // Would Move Cause Check controls
        const clearCellFromBtn = document.getElementById('clearCellFrom');
        if (clearCellFromBtn) {
            clearCellFromBtn.addEventListener('click', () => {
                const editor = window.currentEditor || this;
                editor.clearCellFrom();
            });
        }

        const clearCellToBtn = document.getElementById('clearCellTo');
        if (clearCellToBtn) {
            clearCellToBtn.addEventListener('click', () => {
                const editor = window.currentEditor || this;
                editor.clearCellTo();
            });
        }

        document.querySelectorAll('input[name="wouldMoveCauseCheckResult"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const editor = window.currentEditor || this;
                if (radio.checked) {
                    editor.wouldMoveCauseCheckResult = radio.value === 'true';
                }
            });
        });
    }

    updateTabVisibility() {
        const controls = document.querySelector('.controls');
        const extraInfoPanel = document.querySelector('.extra-info-panel');
        const mainBtn = document.querySelector('.mode-btn[data-mode="main"]');
        const movesBtn = document.querySelector('.mode-btn[data-mode="moves"]');
        const placeBtn = document.querySelector('.mode-btn[data-mode="place"]');

        // If we are awaiting board type selection for a new, empty file,
        // hide all controls below the three tab buttons.
        if (this.awaitingBoardType) {
            if (controls) controls.style.display = 'none';
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';
            this.updateBoardDisplay();
            this.updateInfo();
            return;
        }

        // Otherwise ensure controls are visible
        if (controls) controls.style.display = '';

        const isSquareAttackedPanel = document.querySelector('.is-square-attacked-panel');
        const isKingInCheckPanel = document.querySelector('.is-king-in-check-panel');
        const wouldMoveCauseCheckPanel = document.querySelector('.would-move-cause-check-panel');

        // Delegate actual per-board-type visibility rules to subclasses.
        this.applyTabVisibility({
            controls,
            extraInfoPanel,
            mainBtn,
            movesBtn,
            placeBtn,
            isSquareAttackedPanel,
            isKingInCheckPanel,
            wouldMoveCauseCheckPanel
        });

        // Ensure board display matches current mode/tab
        this.updateBoardDisplay();
        this.updateInfo();
    }

    // Default tab-visibility behavior for "simpleBoard" – child editors override
    // this method to implement their own rules.
    applyTabVisibility({
        extraInfoPanel,
        mainBtn,
        movesBtn,
        placeBtn,
        isSquareAttackedPanel,
        isKingInCheckPanel,
        wouldMoveCauseCheckPanel
    }) {
        if (this.activeTab === 'simpleBoard') {
            // Simple board: only placing pieces
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';
            if (isSquareAttackedPanel) isSquareAttackedPanel.style.display = 'none';
            if (isKingInCheckPanel) isKingInCheckPanel.style.display = 'none';
            if (wouldMoveCauseCheckPanel) wouldMoveCauseCheckPanel.style.display = 'none';

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
        } else if (this.mode === 'target') {
            // Set target square for isSquareAttacked
            this.targetSquare = { row, col };
            this.updateTargetSquareDisplay();
            this.updateBoardDisplay();
        } else if (this.mode === 'cellFrom') {
            // Set cell from for wouldMoveCauseCheck
            this.cellFrom = { row, col };
            this.updateCellFromDisplay();
            this.updateBoardDisplay();
        } else if (this.mode === 'cellTo') {
            // Set cell to for wouldMoveCauseCheck
            this.cellTo = { row, col };
            this.updateCellToDisplay();
            this.updateBoardDisplay();
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
        if (this.targetSquare &&
            this.targetSquare.row === cell.row &&
            this.targetSquare.col === cell.col) {
            this.targetSquare = null;
            this.updateTargetSquareDisplay();
        }
        if (this.cellFrom &&
            this.cellFrom.row === cell.row &&
            this.cellFrom.col === cell.col) {
            this.cellFrom = null;
            this.updateCellFromDisplay();
        }
        if (this.cellTo &&
            this.cellTo.row === cell.row &&
            this.cellTo.col === cell.col) {
            this.cellTo = null;
            this.updateCellToDisplay();
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
                square.classList.remove('has-piece', 'main-piece', 'valid-move', 'target-square', 'cell-from', 'cell-to');
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

                // Mark target square for isSquareAttacked
                if (this.targetSquare &&
                    this.targetSquare.row === row &&
                    this.targetSquare.col === col) {
                    square.classList.add('target-square');
                }

                // Mark cell from for wouldMoveCauseCheck
                if (this.cellFrom &&
                    this.cellFrom.row === row &&
                    this.cellFrom.col === col) {
                    square.classList.add('cell-from');
                }

                // Mark cell to for wouldMoveCauseCheck
                if (this.cellTo &&
                    this.cellTo.row === row &&
                    this.cellTo.col === col) {
                    square.classList.add('cell-to');
                }
            }
        }
    }

    updateInfo() {
        // Board info panel removed - no UI to update
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

    // Called when opening a new, empty file that has no boardType yet.
    // Shows only the three tab buttons so the user can choose the type,
    // and hides the rest of the controls until that happens.
    beginNewBoardWithoutType() {
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel && editorPanel.classList.contains('hidden')) {
            editorPanel.classList.remove('hidden');
        }

        // Reset internal state to a blank board
        this.currentBoardType = 'findAllPossibleMoves';
        this.resetBoardState();

        // Clear extra-info inputs
        const rowInput = document.getElementById('enPassantRow');
        const colInput = document.getElementById('enPassantCol');
        if (rowInput) rowInput.value = '';
        if (colInput) colInput.value = '';
        document
            .querySelectorAll('.pieces-moved-controls input[type="checkbox"]')
            .forEach(cb => {
                cb.checked = false;
            });

        // Clear isSquareAttacked inputs
        this.updateTargetSquareDisplay();
        document.querySelectorAll('input[name="expectedResult"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll('input[name="attackingColor"]').forEach(radio => {
            radio.checked = false;
        });
        // Clear isKingInCheck inputs
        document.querySelectorAll('input[name="kingColor"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll('input[name="kingCheckResult"]').forEach(radio => {
            radio.checked = false;
        });

        // No board type yet; tabs act as selector
        this.currentBoardType = null;
        this.activeTab = 'findAllPossibleMoves';
        this.awaitingBoardType = true;

        // Remove any active styling from tabs so the user must choose
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        this.updateTabVisibility();
    }

    updateTargetSquareDisplay() {
        const displayEl = document.getElementById('targetSquareDisplay');
        if (displayEl) {
            if (this.targetSquare) {
                displayEl.textContent = `Row: ${this.targetSquare.row}, Col: ${this.targetSquare.col}`;
            } else {
                displayEl.textContent = 'No square selected';
            }
        }
    }

    clearTargetSquare() {
        this.targetSquare = null;
        this.updateTargetSquareDisplay();
        this.updateBoardDisplay();
    }

    updateCellFromDisplay() {
        const displayEl = document.getElementById('cellFromDisplay');
        if (displayEl) {
            if (this.cellFrom) {
                displayEl.textContent = `Row: ${this.cellFrom.row}, Col: ${this.cellFrom.col}`;
            } else {
                displayEl.textContent = 'No cell selected';
            }
        }
    }

    clearCellFrom() {
        this.cellFrom = null;
        this.updateCellFromDisplay();
        this.updateBoardDisplay();
    }

    updateCellToDisplay() {
        const displayEl = document.getElementById('cellToDisplay');
        if (displayEl) {
            if (this.cellTo) {
                displayEl.textContent = `Row: ${this.cellTo.row}, Col: ${this.cellTo.col}`;
            } else {
                displayEl.textContent = 'No cell selected';
            }
        }
    }

    clearCellTo() {
        this.cellTo = null;
        this.updateCellToDisplay();
        this.updateBoardDisplay();
    }

}

// Editor classes for specific board types. These extend the base editor but
// can be used when you want a type-specific editor instance in other code.
// They all share the common UI/controller logic from MockBoardEditor, but
// start with a fixed board type and can be augmented with extra helpers as
// needed per type.

export class SimpleBoardEditor extends MockBoardEditor {
    constructor() {
        super('simpleBoard');
    }
}

export class FindAllPossibleMovesBoardEditor extends MockBoardEditor {
    constructor() {
        super('findAllPossibleMoves');
    }

    applyTabVisibility({
        extraInfoPanel,
        mainBtn,
        movesBtn,
        placeBtn,
        isSquareAttackedPanel,
        isKingInCheckPanel,
        wouldMoveCauseCheckPanel
    }) {
        if (this.activeTab === 'findAllPossibleMoves') {
            // Full moves testing: place + main + moves, no extra info
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';
            if (isSquareAttackedPanel) isSquareAttackedPanel.style.display = 'none';
            if (isKingInCheckPanel) isKingInCheckPanel.style.display = 'none';
            if (wouldMoveCauseCheckPanel) wouldMoveCauseCheckPanel.style.display = 'none';

            [mainBtn, movesBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                }
            });
        } else {
            super.applyTabVisibility({
                extraInfoPanel,
                mainBtn,
                movesBtn,
                placeBtn,
                isSquareAttackedPanel,
                isKingInCheckPanel,
                wouldMoveCauseCheckPanel
            });
        }
    }
}

export class EnPassantBoardEditor extends MockBoardEditor {
    constructor() {
        super('enPassant');
    }

    applyTabVisibility({
        extraInfoPanel,
        mainBtn,
        movesBtn,
        placeBtn,
        isSquareAttackedPanel,
        isKingInCheckPanel,
        wouldMoveCauseCheckPanel
    }) {
        if (this.activeTab === 'enPassant') {
            // En passant testing: same as moves, but with extra info
            if (extraInfoPanel) extraInfoPanel.style.display = 'flex';
            if (isSquareAttackedPanel) isSquareAttackedPanel.style.display = 'none';
            if (isKingInCheckPanel) isKingInCheckPanel.style.display = 'none';
            if (wouldMoveCauseCheckPanel) wouldMoveCauseCheckPanel.style.display = 'none';

            [mainBtn, movesBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                }
            });
        } else {
            super.applyTabVisibility({
                extraInfoPanel,
                mainBtn,
                movesBtn,
                placeBtn,
                isSquareAttackedPanel,
                isKingInCheckPanel,
                wouldMoveCauseCheckPanel
            });
        }
    }
}

export class IsSquareAttackedBoardEditor extends MockBoardEditor {
    constructor() {
        super('isSquareAttacked');
    }

    // Properties specific to "isSquareAttacked" boards
    get targetSquare() {
        return this._targetSquare;
    }

    set targetSquare(value) {
        this._targetSquare = value;
    }

    get expectedResult() {
        return this._expectedResult;
    }

    set expectedResult(value) {
        this._expectedResult = value;
    }

    get attackingColor() {
        return this._attackingColor;
    }

    set attackingColor(value) {
        this._attackingColor = value;
    }

    setAttackingColor(color) {
        this.attackingColor = color;
    }

    applyTabVisibility({
        extraInfoPanel,
        mainBtn,
        movesBtn,
        placeBtn,
        isSquareAttackedPanel,
        isKingInCheckPanel,
        wouldMoveCauseCheckPanel
    }) {
        if (this.activeTab === 'isSquareAttacked') {
            // Is Square Attacked: only placing pieces + target square selection
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';
            if (isSquareAttackedPanel) isSquareAttackedPanel.style.display = 'flex';
            if (isKingInCheckPanel) isKingInCheckPanel.style.display = 'none';
            if (wouldMoveCauseCheckPanel) wouldMoveCauseCheckPanel.style.display = 'none';

            if (mainBtn) {
                mainBtn.disabled = true;
                mainBtn.classList.add('disabled');
            }
            if (movesBtn) {
                movesBtn.disabled = true;
                movesBtn.classList.add('disabled');
            }

            // Add target mode button if it doesn't exist
            let targetBtn = document.querySelector('.mode-btn[data-mode="target"]');
            if (!targetBtn) {
                const modeSelector = document.querySelector('.mode-selector');
                if (modeSelector) {
                    targetBtn = document.createElement('button');
                    targetBtn.className = 'mode-btn';
                    targetBtn.dataset.mode = 'target';
                    targetBtn.textContent = 'Select Target Square';
                    modeSelector.appendChild(targetBtn);
                    targetBtn.addEventListener('click', () => {
                        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                        targetBtn.classList.add('active');
                        this.mode = 'target';
                        this.updateBoardDisplay();
                    });
                }
            }

            // Force mode to place initially
            this.mode = 'place';
            if (placeBtn) {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                placeBtn.classList.add('active');
            }
        } else {
            super.applyTabVisibility({
                extraInfoPanel,
                mainBtn,
                movesBtn,
                placeBtn,
                isSquareAttackedPanel,
                isKingInCheckPanel,
                wouldMoveCauseCheckPanel
            });
        }
    }

    loadFromSchema(schema) {
        // Let the base class handle generic pieces, board type, etc.
        super.loadFromSchema(schema);

        if (!schema) {
            return;
        }

        // Target square and expected result for isSquareAttacked
        if (schema.targetSquare) {
            this.targetSquare = {
                row: schema.targetSquare.row,
                col: schema.targetSquare.col
            };
            this.updateTargetSquareDisplay();
        } else {
            this.targetSquare = null;
            this.updateTargetSquareDisplay();
        }

        this.setExpectedResult(
            schema.expectedResult,
            'expectedResultTrue',
            'expectedResultFalse',
            'expectedResult'
        );

        if (schema.attackingColor) {
            this.attackingColor = schema.attackingColor;
            const whiteRadio = document.getElementById('attackingColorWhite');
            const blackRadio = document.getElementById('attackingColorBlack');
            if (whiteRadio) whiteRadio.checked = this.attackingColor === 'white';
            if (blackRadio) blackRadio.checked = this.attackingColor === 'black';
        } else {
            this.attackingColor = null;
        }
    }
}

export class inKingInCheckBoardEditor extends MockBoardEditor {
    constructor() {
        super('isKingInCheck');
    }

    // Properties specific to "isKingInCheck" boards
    get kingColor() {
        return this._kingColor;
    }

    set kingColor(value) {
        this._kingColor = value;
    }

    get kingCheckResult() {
        return this._kingCheckResult;
    }

    set kingCheckResult(value) {
        this._kingCheckResult = value;
    }

    setKingColor(color) {
        this.kingColor = color;
    }

    applyTabVisibility({
        extraInfoPanel,
        mainBtn,
        movesBtn,
        placeBtn,
        isSquareAttackedPanel,
        isKingInCheckPanel,
        wouldMoveCauseCheckPanel
    }) {
        if (this.activeTab === 'isKingInCheck') {
            // Is King In Check: only placing pieces + king color selection
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';
            if (isSquareAttackedPanel) isSquareAttackedPanel.style.display = 'none';
            if (isKingInCheckPanel) isKingInCheckPanel.style.display = 'flex';
            if (wouldMoveCauseCheckPanel) wouldMoveCauseCheckPanel.style.display = 'none';

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
        } else {
            super.applyTabVisibility({
                extraInfoPanel,
                mainBtn,
                movesBtn,
                placeBtn,
                isSquareAttackedPanel,
                isKingInCheckPanel,
                wouldMoveCauseCheckPanel
            });
        }
    }
}

export class WouldMoveCauseCheckBoardEditor extends MockBoardEditor {
    constructor() {
        super('wouldMoveCauseCheck');
    }

    // Properties specific to "wouldMoveCauseCheck" boards
    get cellFrom() {
        return this._cellFrom;
    }

    set cellFrom(value) {
        this._cellFrom = value;
    }

    get cellTo() {
        return this._cellTo;
    }

    set cellTo(value) {
        this._cellTo = value;
    }

    get wouldMoveCauseCheckResult() {
        return this._wouldMoveCauseCheckResult;
    }

    set wouldMoveCauseCheckResult(value) {
        this._wouldMoveCauseCheckResult = value;
    }

    applyTabVisibility({
        extraInfoPanel,
        mainBtn,
        movesBtn,
        placeBtn,
        isSquareAttackedPanel,
        isKingInCheckPanel,
        wouldMoveCauseCheckPanel
    }) {
        if (this.activeTab === 'wouldMoveCauseCheck') {
            // Would Move Cause Check: only placing pieces + cell from/to selection
            if (extraInfoPanel) extraInfoPanel.style.display = 'none';
            if (isSquareAttackedPanel) isSquareAttackedPanel.style.display = 'none';
            if (isKingInCheckPanel) isKingInCheckPanel.style.display = 'none';
            if (wouldMoveCauseCheckPanel) wouldMoveCauseCheckPanel.style.display = 'flex';

            if (mainBtn) {
                mainBtn.disabled = true;
                mainBtn.classList.add('disabled');
            }
            if (movesBtn) {
                movesBtn.disabled = true;
                movesBtn.classList.add('disabled');
            }

            // Add cellFrom mode button if it doesn't exist
            let cellFromBtn = document.querySelector('.mode-btn[data-mode="cellFrom"]');
            if (!cellFromBtn) {
                const modeSelector = document.querySelector('.mode-selector');
                if (modeSelector) {
                    cellFromBtn = document.createElement('button');
                    cellFromBtn.className = 'mode-btn';
                    cellFromBtn.dataset.mode = 'cellFrom';
                    cellFromBtn.textContent = 'Select Cell From';
                    modeSelector.appendChild(cellFromBtn);
                    cellFromBtn.addEventListener('click', () => {
                        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                        cellFromBtn.classList.add('active');
                        this.mode = 'cellFrom';
                        this.updateBoardDisplay();
                    });
                }
            }

            // Add cellTo mode button if it doesn't exist
            let cellToBtn = document.querySelector('.mode-btn[data-mode="cellTo"]');
            if (!cellToBtn) {
                const modeSelector = document.querySelector('.mode-selector');
                if (modeSelector) {
                    cellToBtn = document.createElement('button');
                    cellToBtn.className = 'mode-btn';
                    cellToBtn.dataset.mode = 'cellTo';
                    cellToBtn.textContent = 'Select Cell To';
                    modeSelector.appendChild(cellToBtn);
                    cellToBtn.addEventListener('click', () => {
                        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                        cellToBtn.classList.add('active');
                        this.mode = 'cellTo';
                        this.updateBoardDisplay();
                    });
                }
            }

            // Force mode to place initially
            this.mode = 'place';
            if (placeBtn) {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                placeBtn.classList.add('active');
            }
        } else {
            super.applyTabVisibility({
                extraInfoPanel,
                mainBtn,
                movesBtn,
                placeBtn,
                isSquareAttackedPanel,
                isKingInCheckPanel,
                wouldMoveCauseCheckPanel
            });
        }
    }
}
