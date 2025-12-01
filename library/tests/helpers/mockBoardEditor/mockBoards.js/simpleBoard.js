export class MockBoardEditor {
    constructor() {
        this.selectedPiece = null;
        this.selectedColor = null;
        this.mode = 'place';
        this.modes = {
            place: () => {
                if (this.selectedPiece === 'remove') {
                    this.removePiece(cell);
                } else if (this.selectedPiece && this.selectedColor) {
                    this.placePiece(cell, this.selectedPiece, this.selectedColor);
                }
            },
        };
        this.resetBoardState();
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.updateTabVisibility();
        this.updateInfo();
    }

    resetBoardState() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        this.selectedColor = null;
        this.selectedPiece = null;
        this.mode = 'place';
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

    transferPiecesFrom(sourceEditor) {        
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

        // Copy extraInfo (en passant, pieces made moves) - shared across all board types
        this.extraInfo = sourceEditor.extraInfo;

        this.selectedColor = null;
        this.selectedPiece = null;
        this.mode = 'place';
    }

    handleSquareClick(row, col) {
        const cell = { row, col };

        const func = this.modes[this.mode];
        if (func) {
            func(cell);
        }
    }

    placePiece(cell, type, color) {
        const existingPiece = this.getPiece(cell);
        if (existingPiece) {
            this.removePiece(cell);
        }

        this.board[cell.row - 1][cell.col - 1] = { type, color, position: cell };
        this.updateBoardDisplay();
    }

    removePiece(cell) {
        this.board[cell.row - 1][cell.col - 1] = null;
    }

    getPiece(cell) {
        return this.board[cell.row - 1][cell.col - 1];
    }
}