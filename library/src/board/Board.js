const King = require('../pieces/King');
const Queen = require('../pieces/Queen');
const Rook = require('../pieces/Rook');
const Bishop = require('../pieces/Bishop');
const Knight = require('../pieces/Knight');
const Pawn = require('../pieces/Pawn');
const MoveValidator = require('./MoveValidator');
const CheckDetector = require('./CheckDetector');
const GameEndDetector = require('./GameEndDetector');
const { cellsEqual, isValidCell } = require('../utils/Cell');

/**
 * Board class manages the chess board state and piece positions
 */
class Board {
    /**
     * Creates a new board with standard starting position
     */
    constructor() {
        // Initialize 8x8 matrix (0-indexed internally, but we use 1-indexed for cells)
        this.#arrangement = Array(8).fill(null).map(() => Array(8).fill(null));
        
        this.extraInfo = {
            piecesMadeMoves: {
                whiteKing: false,
                blackKing: false,
                whiteKingsideRook: false,
                whiteQueensideRook: false,
                blackKingsideRook: false,
                blackQueensideRook: false
            },
            enPassantTarget: null // Cell where en passant is possible
        };
        
        this._initializeBoard();
    }

    /**
     * Initialize board with standard starting position
     * @private
     */
    _initializeBoard() {
        // Place pawns
        for (let col = 1; col <= 8; col++) {
            this._placePiece(new Pawn('white', { row: 2, col }), { row: 2, col });
            this._placePiece(new Pawn('black', { row: 7, col }), { row: 7, col });
        }

        // Place rooks
        this._placePiece(new Rook('white', { row: 1, col: 1 }), { row: 1, col: 1 });
        this._placePiece(new Rook('white', { row: 1, col: 8 }), { row: 1, col: 8 });
        this._placePiece(new Rook('black', { row: 8, col: 1 }), { row: 8, col: 1 });
        this._placePiece(new Rook('black', { row: 8, col: 8 }), { row: 8, col: 8 });

        // Place knights
        this._placePiece(new Knight('white', { row: 1, col: 2 }), { row: 1, col: 2 });
        this._placePiece(new Knight('white', { row: 1, col: 7 }), { row: 1, col: 7 });
        this._placePiece(new Knight('black', { row: 8, col: 2 }), { row: 8, col: 2 });
        this._placePiece(new Knight('black', { row: 8, col: 7 }), { row: 8, col: 7 });

        // Place bishops
        this._placePiece(new Bishop('white', { row: 1, col: 3 }), { row: 1, col: 3 });
        this._placePiece(new Bishop('white', { row: 1, col: 6 }), { row: 1, col: 6 });
        this._placePiece(new Bishop('black', { row: 8, col: 3 }), { row: 8, col: 3 });
        this._placePiece(new Bishop('black', { row: 8, col: 6 }), { row: 8, col: 6 });

        // Place queens
        this._placePiece(new Queen('white', { row: 1, col: 4 }), { row: 1, col: 4 });
        this._placePiece(new Queen('black', { row: 8, col: 4 }), { row: 8, col: 4 });

        // Place kings
        this._placePiece(new King('white', { row: 1, col: 5 }), { row: 1, col: 5 });
        this._placePiece(new King('black', { row: 8, col: 5 }), { row: 8, col: 5 });
    }

    /**
     * Gets the board arrangement (for internal use)
     * @returns {Array<Array>} 8x8 matrix of pieces
     */
    getArrangement() {
        return this.#arrangement;
    }

    /**
     * Gets piece on a cell
     * @param {{row: number, col: number}} cell - Cell to check
     * @returns {Piece|null} Piece at cell or null
     */
    getPieceOnCell(cell) {
        if (!isValidCell(cell)) return null;
        return this.#arrangement[cell.row - 1][cell.col - 1];
    }

    /**
     * Gets the king of specified color
     * @param {string} color - 'white' or 'black'
     * @returns {King|null} King piece or null
     */
    getKing(color) {
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = this.#arrangement[row - 1][col - 1];
                if (piece instanceof King && piece.color === color) {
                    return piece;
                }
            }
        }
        return null;
    }

    /**
     * Checks if path between two cells is clear (for sliding pieces)
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if path is clear
     */
    isPathClear(cellFrom, cellTo) {
        const rowDiff = cellTo.row - cellFrom.row;
        const colDiff = cellTo.col - cellFrom.col;
        const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);

        let currentRow = cellFrom.row + rowStep;
        let currentCol = cellFrom.col + colStep;

        while (currentRow !== cellTo.row || currentCol !== cellTo.col) {
            if (this.#arrangement[currentRow - 1][currentCol - 1] !== null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }

    /**
     * Checks if a piece has moved
     * @param {string} color - 'white' or 'black'
     * @param {string} pieceType - 'king', 'kingsideRook', or 'queensideRook'
     * @returns {boolean} True if piece has moved
     */
    hasPieceMoved(color, pieceType) {
        const key = `${color}${pieceType.charAt(0).toUpperCase() + pieceType.slice(1)}`;
        return this.extraInfo.piecesMadeMoves[key] || false;
    }

    /**
     * Marks a piece as having moved
     * @param {string} color - 'white' or 'black'
     * @param {string} pieceType - 'king', 'kingsideRook', or 'queensideRook'
     * @private
     */
    _markPieceMoved(color, pieceType) {
        const key = `${color}${pieceType.charAt(0).toUpperCase() + pieceType.slice(1)}`;
        this.extraInfo.piecesMadeMoves[key] = true;
    }

    /**
     * Gets the en passant target cell
     * @returns {{row: number, col: number}|null} En passant target or null
     */
    getEnPassantTarget() {
        return this.extraInfo.enPassantTarget;
    }

    /**
     * Sets the en passant target cell
     * @param {{row: number, col: number}|null} cell - En passant target or null
     * @private
     */
    _setEnPassantTarget(cell) {
        this.extraInfo.enPassantTarget = cell;
    }

    /**
     * Checks if king is in check
     * @param {string} color - 'white' or 'black'
     * @returns {boolean} True if king is in check
     */
    isKingInCheck(color) {
        return CheckDetector.isKingInCheck(color, this);
    }

    /**
     * Checks if a square is attacked
     * @param {{row: number, col: number}} cell - Cell to check
     * @param {string} attackingColor - 'white' or 'black'
     * @returns {boolean} True if square is attacked
     */
    isSquareAttacked(cell, attackingColor) {
        return CheckDetector.isSquareAttacked(cell, attackingColor, this);
    }

    /**
     * Checks if move would cause check
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {string} movingColor - Color of moving piece
     * @returns {boolean} True if move would cause check
     */
    wouldMoveCauseCheck(cellFrom, cellTo, movingColor) {
        return MoveValidator.wouldMoveCauseCheck(cellFrom, cellTo, movingColor, this);
    }

    /**
     * Tries to make a move
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {string} promotionPiece - Optional: 'queen', 'rook', 'bishop', or 'knight' for pawn promotion
     * @returns {boolean} True if move was successful
     */
    tryToMove(cellFrom, cellTo, promotionPiece = null) {
        const piece = this.getPieceOnCell(cellFrom);
        if (!piece) return false;

        // Check for castling
        if (piece instanceof King && Math.abs(cellTo.col - cellFrom.col) === 2) {
            const validation = MoveValidator.validateCastling(cellFrom, cellTo, this);
            if (!validation.valid) return false;

            // Execute castling
            this._executeCastling(cellFrom, cellTo);
            return true;
        }

        // Check for en passant
        if (piece instanceof Pawn && piece.canEnPassant(cellTo, this)) {
            const validation = MoveValidator.validateEnPassant(cellFrom, cellTo, this);
            if (!validation.valid) return false;

            // Execute en passant
            this._executeEnPassant(cellFrom, cellTo);
            return true;
        }

        // Validate regular move
        const validation = MoveValidator.validateMove(cellFrom, cellTo, this);
        if (!validation.valid) return false;

        // Check for pawn promotion
        if (piece instanceof Pawn && piece.canPromote(cellTo)) {
            if (!promotionPiece) {
                promotionPiece = 'queen'; // Default to queen
            }
            this._executeMoveWithPromotion(cellFrom, cellTo, promotionPiece);
        } else {
            // Execute regular move
            this._executeMove(cellFrom, cellTo);
        }

        // Update en passant target for next move
        this._updateEnPassantTarget(piece, cellFrom, cellTo);

        return true;
    }

    /**
     * Executes a regular move
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @private
     */
    _executeMove(cellFrom, cellTo) {
        const piece = this.getPieceOnCell(cellFrom);
        const capturedPiece = this.getPieceOnCell(cellTo);

        // Remove captured piece if any
        if (capturedPiece) {
            this._removePiece(cellTo);
        }

        // Move piece
        this._movePiece(cellFrom, cellTo);

        // Update piece movement tracking
        this._updatePieceMovementTracking(piece, cellFrom);
    }

    /**
     * Executes a move with pawn promotion
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @param {string} promotionPiece - 'queen', 'rook', 'bishop', or 'knight'
     * @private
     */
    _executeMoveWithPromotion(cellFrom, cellTo, promotionPiece) {
        const pawn = this.getPieceOnCell(cellFrom);
        const capturedPiece = this.getPieceOnCell(cellTo);
        const color = pawn.color;

        // Remove pawn and captured piece
        this._removePiece(cellFrom);
        if (capturedPiece) {
            this._removePiece(cellTo);
        }

        // Create promoted piece
        let newPiece;
        switch (promotionPiece.toLowerCase()) {
            case 'queen':
                newPiece = new Queen(color, cellTo);
                break;
            case 'rook':
                newPiece = new Rook(color, cellTo);
                break;
            case 'bishop':
                newPiece = new Bishop(color, cellTo);
                break;
            case 'knight':
                newPiece = new Knight(color, cellTo);
                break;
            default:
                newPiece = new Queen(color, cellTo); // Default to queen
        }

        this._placePiece(newPiece, cellTo);
    }

    /**
     * Executes castling
     * @param {{row: number, col: number}} cellFrom - King's source cell
     * @param {{row: number, col: number}} cellTo - King's destination cell
     * @private
     */
    _executeCastling(cellFrom, cellTo) {
        const king = this.getPieceOnCell(cellFrom);
        const isKingside = cellTo.col > cellFrom.col;
        const rookCol = isKingside ? 8 : 1;
        const rookCell = { row: cellFrom.row, col: rookCol };
        const rook = this.getPieceOnCell(rookCell);

        // Move king
        this._movePiece(cellFrom, cellTo);

        // Move rook
        const newRookCol = isKingside ? 6 : 4;
        const newRookCell = { row: cellFrom.row, col: newRookCol };
        this._movePiece(rookCell, newRookCell);

        // Mark pieces as moved
        this._markPieceMoved(king.color, 'king');
        this._markPieceMoved(king.color, isKingside ? 'kingsideRook' : 'queensideRook');
    }

    /**
     * Executes en passant
     * @param {{row: number, col: number}} cellFrom - Pawn's source cell
     * @param {{row: number, col: number}} cellTo - Pawn's destination cell
     * @private
     */
    _executeEnPassant(cellFrom, cellTo) {
        const pawn = this.getPieceOnCell(cellFrom);
        const capturedPawnRow = pawn.color === 'white' ? cellTo.row - 1 : cellTo.row + 1;
        const capturedPawnCell = { row: capturedPawnRow, col: cellTo.col };

        // Move pawn
        this._movePiece(cellFrom, cellTo);

        // Remove captured pawn
        this._removePiece(capturedPawnCell);
    }

    /**
     * Updates en passant target based on pawn move
     * @param {Piece} piece - Piece that moved
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @private
     */
    _updateEnPassantTarget(piece, cellFrom, cellTo) {
        // Reset en passant target
        this._setEnPassantTarget(null);

        // If pawn moved two squares, set en passant target
        if (piece instanceof Pawn) {
            const rowDiff = Math.abs(cellTo.row - cellFrom.row);
            if (rowDiff === 2) {
                const enPassantRow = piece.color === 'white' ? cellFrom.row + 1 : cellFrom.row - 1;
                this._setEnPassantTarget({ row: enPassantRow, col: cellFrom.col });
            }
        }
    }

    /**
     * Updates piece movement tracking
     * @param {Piece} piece - Piece that moved
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @private
     */
    _updatePieceMovementTracking(piece, cellFrom) {
        if (piece instanceof King) {
            this._markPieceMoved(piece.color, 'king');
        } else if (piece instanceof Rook) {
            if (piece.color === 'white') {
                if (cellFrom.col === 1) {
                    this._markPieceMoved('white', 'queensideRook');
                } else if (cellFrom.col === 8) {
                    this._markPieceMoved('white', 'kingsideRook');
                }
            } else {
                if (cellFrom.col === 1) {
                    this._markPieceMoved('black', 'queensideRook');
                } else if (cellFrom.col === 8) {
                    this._markPieceMoved('black', 'kingsideRook');
                }
            }
        }
    }

    /**
     * Checks for stalemate after move
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if move results in stalemate
     */
    checkForStalemateAfterMove(cellFrom, cellTo) {
        return GameEndDetector.checkForStalemateAfterMove(cellFrom, cellTo, this);
    }

    /**
     * Checks for checkmate after move
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if move results in checkmate
     */
    checkForCheckmateAfterMove(cellFrom, cellTo) {
        return GameEndDetector.checkForCheckmateAfterMove(cellFrom, cellTo, this);
    }

    /**
     * Checks if there are enough pieces to continue game after move
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @returns {boolean} True if there are enough pieces
     */
    enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo) {
        return GameEndDetector.enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo, this);
    }

    /**
     * Moves a piece internally
     * @param {{row: number, col: number}} cellFrom - Source cell
     * @param {{row: number, col: number}} cellTo - Target cell
     * @private
     */
    _movePiece(cellFrom, cellTo) {
        const piece = this.#arrangement[cellFrom.row - 1][cellFrom.col - 1];
        this.#arrangement[cellFrom.row - 1][cellFrom.col - 1] = null;
        this.#arrangement[cellTo.row - 1][cellTo.col - 1] = piece;
        piece.updatePosition(cellTo);
    }

    /**
     * Places a piece on the board
     * @param {Piece} piece - Piece to place
     * @param {{row: number, col: number}} cell - Cell to place piece
     * @private
     */
    _placePiece(piece, cell) {
        this.#arrangement[cell.row - 1][cell.col - 1] = piece;
        piece.updatePosition(cell);
    }

    /**
     * Removes a piece from the board
     * @param {{row: number, col: number}} cell - Cell to remove piece from
     * @private
     */
    _removePiece(cell) {
        this.#arrangement[cell.row - 1][cell.col - 1] = null;
    }

    #arrangement; // Private field for board arrangement
}

module.exports = Board;

