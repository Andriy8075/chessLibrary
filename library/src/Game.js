const Board = require('./board/Board');
const { isValidCell, createCell } = require('./utils/Cell');

/**
 * Main Game class that manages chess game state and processes requests
 */
class Game {
    /**
     * Creates a new chess game with standard starting position
     */
    constructor() {
        this.state = {
            board: new Board(),
            currentTurn: 'white',
            lastMove: null,
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true }
            },
            enPassantTarget: null,
            gameStatus: 'active', // 'active', 'checkmate', 'stalemate', 'draw', 'resigned'
            winner: null, // 'white', 'black', or null
            drawProposed: null, // 'white', 'black', or null
            moveHistory: []
        };
    }

    /**
     * Gets the current game state
     * @returns {Object} Current game state
     */
    getState() {
        return this.state;
    }

    /**
     * Processes a game request (move, draw proposal, resign, etc.)
     * @param {Object} request - Request object
     * @param {string} request.type - Request type: 'move', 'proposeDraw', 'acceptDraw', 'resign'
     * @param {{row: number, col: number}} [request.from] - Source cell for moves
     * @param {{row: number, col: number}} [request.to] - Target cell for moves
     * @param {string} [request.promotion] - Promotion piece for pawn promotion: 'queen', 'rook', 'bishop', 'knight'
     * @returns {Object} Result object with success status and updated state
     */
    processRequest(request) {
        if (!request || !request.type) {
            return {
                success: false,
                error: 'Invalid request: missing type',
                state: this.state
            };
        }

        // Handle different request types
        switch (request.type) {
            case 'move':
                return this._processMove(request);
            case 'proposeDraw':
                return this._processProposeDraw();
            case 'acceptDraw':
                return this._processAcceptDraw();
            case 'resign':
                return this._processResign();
            default:
                return {
                    success: false,
                    error: `Unknown request type: ${request.type}`,
                    state: this.state
                };
        }
    }

    /**
     * Processes a move request
     * @param {Object} request - Move request
     * @private
     */
    _processMove(request) {
        // Validate request
        if (!request.from || !request.to) {
            return {
                success: false,
                error: 'Move request must include from and to cells',
                state: this.state
            };
        }

        const cellFrom = createCell(request.from.row, request.from.col);
        const cellTo = createCell(request.to.row, request.to.col);

        // Check if game is still active
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }

        // Check if it's the correct player's turn
        const piece = this.state.board.getPieceOnCell(cellFrom);
        if (!piece) {
            return {
                success: false,
                error: 'No piece at source cell',
                state: this.state
            };
        }

        if (piece.color !== this.state.currentTurn) {
            return {
                success: false,
                error: `It is ${this.state.currentTurn}'s turn, not ${piece.color}'s`,
                state: this.state
            };
        }

        // Try to make the move
        const promotionPiece = request.promotion || null;
        const moveSuccess = this.state.board.tryToMove(cellFrom, cellTo, promotionPiece);

        if (!moveSuccess) {
            return {
                success: false,
                error: 'Invalid move',
                state: this.state
            };
        }

        // Update game state
        const movedPiece = this.state.board.getPieceOnCell(cellTo);
        this.state.lastMove = {
            from: cellFrom,
            to: cellTo,
            piece: movedPiece
        };

        // Update castling rights
        this._updateCastlingRights();

        // Update en passant target
        this.state.enPassantTarget = this.state.board.getEnPassantTarget();

        // Add to move history
        this.state.moveHistory.push({
            from: cellFrom,
            to: cellTo,
            piece: movedPiece.constructor.name,
            color: movedPiece.color
        });

        // Check for check
        const opponentColor = this.state.currentTurn === 'white' ? 'black' : 'white';
        const isCheck = this.state.board.isKingInCheck(opponentColor);

        // Check for checkmate
        const isCheckmate = this.state.board.checkForCheckmateAfterMove(cellFrom, cellTo);

        // Check for stalemate
        const isStalemate = this.state.board.checkForStalemateAfterMove(cellFrom, cellTo);

        // Check for insufficient material
        const enoughPieces = this.state.board.enoughPiecesAfterMoveToContinueGame(cellFrom, cellTo);

        // Determine game status
        if (isCheckmate) {
            this.state.gameStatus = 'checkmate';
            this.state.winner = this.state.currentTurn;
        } else if (isStalemate) {
            this.state.gameStatus = 'draw'; // Stalemate is a draw
        } else if (!enoughPieces) {
            this.state.gameStatus = 'draw';
        }

        // Switch turns if game is still active
        if (this.state.gameStatus === 'active') {
            this.state.currentTurn = opponentColor;
        }

        // Build result
        const result = {
            success: true,
            state: this.state
        };

        if (isCheck) {
            result.check = true;
        }

        if (isCheckmate) {
            result.checkmate = true;
        }

        if (isStalemate) {
            result.stalemate = true;
        }

        if (!enoughPieces) {
            result.draw = true;
        }

        return result;
    }

    /**
     * Processes a draw proposal
     * @private
     */
    _processProposeDraw() {
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }

        this.state.drawProposed = this.state.currentTurn;

        return {
            success: true,
            state: this.state
        };
    }

    /**
     * Processes draw acceptance
     * @private
     */
    _processAcceptDraw() {
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }

        if (!this.state.drawProposed) {
            return {
                success: false,
                error: 'No draw proposal to accept',
                state: this.state
            };
        }

        if (this.state.drawProposed === this.state.currentTurn) {
            return {
                success: false,
                error: 'Cannot accept your own draw proposal',
                state: this.state
            };
        }

        this.state.gameStatus = 'draw';
        this.state.drawProposed = null;

        return {
            success: true,
            draw: true,
            state: this.state
        };
    }

    /**
     * Processes resignation
     * @private
     */
    _processResign() {
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }

        this.state.gameStatus = 'resigned';
        this.state.winner = this.state.currentTurn === 'white' ? 'black' : 'white';

        return {
            success: true,
            state: this.state
        };
    }

    /**
     * Updates castling rights based on current board state
     * @private
     */
    _updateCastlingRights() {
        this.state.castlingRights.white.kingSide = 
            !this.state.board.hasPieceMoved('white', 'king') &&
            !this.state.board.hasPieceMoved('white', 'kingsideRook');

        this.state.castlingRights.white.queenSide = 
            !this.state.board.hasPieceMoved('white', 'king') &&
            !this.state.board.hasPieceMoved('white', 'queensideRook');

        this.state.castlingRights.black.kingSide = 
            !this.state.board.hasPieceMoved('black', 'king') &&
            !this.state.board.hasPieceMoved('black', 'kingsideRook');

        this.state.castlingRights.black.queenSide = 
            !this.state.board.hasPieceMoved('black', 'king') &&
            !this.state.board.hasPieceMoved('black', 'queensideRook');
    }
}

module.exports = Game;

