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

class Board {
    constructor() {
        this.arrangement = Array(8).fill(null).map(() => Array(8).fill(null));
        
        this.extraInfo = {
            piecesMadeMoves: {
                whiteKing: false,
                blackKing: false,
                whiteKingsideRook: false,
                whiteQueensideRook: false,
                blackKingsideRook: false,
                blackQueensideRook: false
            },
            enPassantTarget: null
        };
        
        this._initializeBoard();
    }

    _initializeBoard() {
        for (let col = 1; col <= 8; col++) {
            this._placePiece(new Pawn('white', { row: 2, col }, this), { row: 2, col });
            this._placePiece(new Pawn('black', { row: 7, col }, this), { row: 7, col });
        }

        this._placePiece(new Rook('white', { row: 1, col: 1 }, this), { row: 1, col: 1 });
        this._placePiece(new Rook('white', { row: 1, col: 8 }, this), { row: 1, col: 8 });
        this._placePiece(new Rook('black', { row: 8, col: 1 }, this), { row: 8, col: 1 });
        this._placePiece(new Rook('black', { row: 8, col: 8 }, this), { row: 8, col: 8 });

        this._placePiece(new Knight('white', { row: 1, col: 2 }, this), { row: 1, col: 2 });
        this._placePiece(new Knight('white', { row: 1, col: 7 }, this), { row: 1, col: 7 });
        this._placePiece(new Knight('black', { row: 8, col: 2 }, this), { row: 8, col: 2 });
        this._placePiece(new Knight('black', { row: 8, col: 7 }, this), { row: 8, col: 7 });

        this._placePiece(new Bishop('white', { row: 1, col: 3 }, this), { row: 1, col: 3 });
        this._placePiece(new Bishop('white', { row: 1, col: 6 }, this), { row: 1, col: 6 });
        this._placePiece(new Bishop('black', { row: 8, col: 3 }, this), { row: 8, col: 3 });
        this._placePiece(new Bishop('black', { row: 8, col: 6 }, this), { row: 8, col: 6 });

        this._placePiece(new King('white', { row: 1, col: 4 }, this), { row: 1, col: 4 });
        this._placePiece(new King('black', { row: 8, col: 4 }, this), { row: 8, col: 4 });

        this._placePiece(new Queen('white', { row: 1, col: 5 }, this), { row: 1, col: 5 });
        this._placePiece(new Queen('black', { row: 8, col: 5 }, this), { row: 8, col: 5 });
    }

    getArrangement() {
        return this.arrangement;
    }

    getSerializedState() {
        return this.arrangement.map(row => 
            row.map(piece => {
                if (!piece) return null;
                return {
                    type: piece.constructor.name.toLowerCase(),
                    color: piece.color,
                    position: piece.position
                };
            })
        );
    }

    toJSON() {
        // Prevent circular reference when serializing Board
        // Use getSerializedState() instead of including arrangement directly
        return {
            arrangement: this.getSerializedState(),
            extraInfo: this.extraInfo
        };
    }

    getPieceOnCell(cell) {
        if (!isValidCell(cell)) return null;
        return this.arrangement[cell.row - 1][cell.col - 1];
    }

    getKing(color) {
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = this.arrangement[row - 1][col - 1];
                if (piece instanceof King && piece.color === color) {
                    return piece;
                }
            }
        }
        return null;
    }

    isPathClear(cellFrom, cellTo) {
        const rowDiff = cellTo.row - cellFrom.row;
        const colDiff = cellTo.col - cellFrom.col;
        const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
        const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);

        let currentRow = cellFrom.row + rowStep;
        let currentCol = cellFrom.col + colStep;

        while (currentRow !== cellTo.row || currentCol !== cellTo.col) {
            if (this.arrangement[currentRow - 1][currentCol - 1] !== null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }

    hasPieceMoved(color, pieceType) {
        const key = `${color}${pieceType.charAt(0).toUpperCase() + pieceType.slice(1)}`;
        return this.extraInfo.piecesMadeMoves[key] || false;
    }

    _markPieceMoved(color, pieceType) {
        const key = `${color}${pieceType.charAt(0).toUpperCase() + pieceType.slice(1)}`;
        this.extraInfo.piecesMadeMoves[key] = true;
    }

    getEnPassantTarget() {
        return this.extraInfo.enPassantTarget;
    }

    _setEnPassantTarget(cell) {
        this.extraInfo.enPassantTarget = cell;
    }

    isKingInCheck(color) {
        return CheckDetector.isKingInCheck(color, this);
    }

    isSquareAttacked(cell, attackingColor) {
        return CheckDetector.isSquareAttacked(cell, attackingColor, this);
    }

    wouldMoveCauseCheck(cellFrom, cellTo) {
        return MoveValidator.wouldMoveCauseCheck(cellFrom, cellTo, this);
    }

    tryToMove(cellFrom, cellTo, promotionPiece = null) {
        const piece = this.getPieceOnCell(cellFrom);
        if (!piece) return false;

        if (piece instanceof King && Math.abs(cellTo.col - cellFrom.col) === 2) {
            const validation = MoveValidator.validateCastling(cellFrom, cellTo, this);
            if (!validation.valid) return false;
            this._executeCastling(cellFrom, cellTo);
            return true;
        }

        if (piece instanceof Pawn && piece.canEnPassant(cellTo)) {
            const validation = MoveValidator.validateEnPassant(cellFrom, cellTo, this);
            if (!validation.valid) return false;

            this._executeEnPassant(cellFrom, cellTo);
            return true;
        }

        const validation = MoveValidator.validateMove(cellFrom, cellTo, this);
        if (!validation.valid) return false;

        if (piece instanceof Pawn && piece.canPromote(cellTo)) {
            if (!promotionPiece) {
                promotionPiece = 'queen';
            }
            this._executeMoveWithPromotion(cellFrom, cellTo, promotionPiece);
        } else {
            this._executeMove(cellFrom, cellTo);
        }

        this._updateEnPassantTarget(piece, cellFrom, cellTo);

        return true;
    }

    _executeMove(cellFrom, cellTo) {
        const piece = this.getPieceOnCell(cellFrom);
        const capturedPiece = this.getPieceOnCell(cellTo);

        if (capturedPiece) {
            this._removePiece(cellTo);
        }

        this._movePiece(cellFrom, cellTo);

        this._updatePieceMovementTracking(piece, cellFrom);
    }

    _executeMoveWithPromotion(cellFrom, cellTo, promotionPiece) {
        const pawn = this.getPieceOnCell(cellFrom);
        const capturedPiece = this.getPieceOnCell(cellTo);
        const color = pawn.color;

        this._removePiece(cellFrom);
        if (capturedPiece) {
            this._removePiece(cellTo);
        }

        let newPiece;
        switch (promotionPiece.toLowerCase()) {
            case 'queen':
                newPiece = new Queen(color, cellTo, this);
                break;
            case 'rook':
                newPiece = new Rook(color, cellTo, this);
                break;
            case 'bishop':
                newPiece = new Bishop(color, cellTo, this);
                break;
            case 'knight':
                newPiece = new Knight(color, cellTo, this);
                break;
            default:
                newPiece = new Queen(color, cellTo, this);
        }

        this._placePiece(newPiece, cellTo);
    }

    _executeCastling(cellFrom, cellTo) {
        const king = this.getPieceOnCell(cellFrom);
        const isKingside = cellTo.col < cellFrom.col;
        const rookCol = isKingside ? 1 : 8;
        const rookCell = { row: cellFrom.row, col: rookCol };

        this._movePiece(cellFrom, cellTo);

        const newRookCol = isKingside ? 3 : 5;
        const newRookCell = { row: cellFrom.row, col: newRookCol };
        this._movePiece(rookCell, newRookCell);

        this._markPieceMoved(king.color, 'king');
        this._markPieceMoved(king.color, isKingside ? 'kingsideRook' : 'queensideRook');
    }

    _executeEnPassant(cellFrom, cellTo) {
        const pawn = this.getPieceOnCell(cellFrom);
        const capturedPawnRow = pawn.color === 'white' ? cellTo.row - 1 : cellTo.row + 1;
        const capturedPawnCell = { row: capturedPawnRow, col: cellTo.col };

        this._movePiece(cellFrom, cellTo);

        this._removePiece(capturedPawnCell);
    }

    _updateEnPassantTarget(piece, cellFrom, cellTo) {
        this._setEnPassantTarget(null);

        if (piece instanceof Pawn) {
            const rowDiff = Math.abs(cellTo.row - cellFrom.row);
            if (rowDiff === 2) {
                const enPassantRow = piece.color === 'white' ? cellFrom.row + 1 : cellFrom.row - 1;
                this._setEnPassantTarget({ row: enPassantRow, col: cellFrom.col });
            }
        }
    }

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

    checkForStalemateAfterMove(cellFrom, cellTo) {
        return GameEndDetector.checkForStalemateAfterMove(cellFrom, cellTo, this);
    }

    checkForCheckmateAfterMove(cellFrom, cellTo) {
        return GameEndDetector.checkForCheckmateAfterMove(cellFrom, cellTo, this);
    }

    enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo) {
        return GameEndDetector.enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo, this);
    }

    _movePiece(cellFrom, cellTo) {
        const piece = this.arrangement[cellFrom.row - 1][cellFrom.col - 1];
        this.arrangement[cellFrom.row - 1][cellFrom.col - 1] = null;
        this.arrangement[cellTo.row - 1][cellTo.col - 1] = piece;
        piece.updatePosition(cellTo);
    }

    _placePiece(piece, cell) {
        this.arrangement[cell.row - 1][cell.col - 1] = piece;
        piece.updatePosition(cell);
    }

    _removePiece(cell) {
        this.arrangement[cell.row - 1][cell.col - 1] = null;
    }

    arrangement;
}

module.exports = Board;
