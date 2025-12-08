const Board = require('./board/Board');
const validateMoveRequest = require('./validators/moveRequestValidator');
const GameEnd = require('./utils/GameEnd');
const GameEndDetector = require('./board/GameEndDetector');

class Game {
    constructor() {
        this.state = {
            board: new Board(),
            currentTurn: 'white',
            lastMove: null,
            gameStatus: 'active',
            winner: null,
            drawProposed: null,
            moveHistory: [],
            positionHistory: []
        };
        
        // Initialize position history with starting position
        const initialPosition = GameEndDetector._getPositionMatrix(this.state.board);
        this.state.positionHistory.push(initialPosition);
    }

    getState() {
        return this.state;
    }

    getSerializedState() {
        return {
            board: this.state.board.getSerializedState(),
            currentTurn: this.state.currentTurn,
            lastMove: this.state.lastMove,
            gameStatus: this.state.gameStatus,
            winner: this.state.winner,
            drawProposed: this.state.drawProposed,
            moveHistory: this.state.moveHistory
        };
    }

    processRequest(request) {
        if (!request || !request.type) {
            return {
                success: false,
                error: 'Invalid request: missing type',
                state: this.state
            };
        }

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

    _processMove(request) {
        const { valid, error } = validateMoveRequest(request);
        if (!valid) {
                return {
                success: false,
                error,
                state: this.state
            };
        }

        const cellFrom = request.from;
        const cellTo = request.to;
        const color = request.color;

        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }

        if (this.state.currentTurn !== color) {
            return {
                success: false,
                error: `It is ${this.state.currentTurn}'s turn, not ${color}'s`,
                state: this.state
            };
        }

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

        const promotionPiece = request.promotion;
        
        // Check for capture before move is executed
        const capturedPiece = this.state.board.getPieceOnCell(cellTo);
        const pieceAtFrom = this.state.board.getPieceOnCell(cellFrom);
        const wasPawnMove = pieceAtFrom && pieceAtFrom.constructor.name === 'Pawn';
        const isEnPassantMove = wasPawnMove && this.state.board.getEnPassantTarget() && 
            this.state.board.getEnPassantTarget().col === cellTo.col;
        
        const wasCapture = !!capturedPiece || isEnPassantMove;
        
        const moveResult = this.state.board.tryToMove(cellFrom, cellTo, promotionPiece);

        if (!moveResult.success) {
            return {
                success: false,
                error: 'Invalid move',
                state: this.state
            };
        }

        const movedPiece = this.state.board.getPieceOnCell(cellTo);
        this.state.lastMove = { // to delete
            from: cellFrom,
            to: cellTo,
            piece: movedPiece
        };

        this.state.enPassantTarget = this.state.board.getEnPassantTarget();

        this.state.moveHistory.push({
            from: cellFrom,
            to: cellTo,
            piece: movedPiece.constructor.name,
            color: movedPiece.color,
            wasCapture: wasCapture,
            wasPawnMove: wasPawnMove
        });

        const positionMatrix = GameEndDetector._getPositionMatrix(this.state.board);
        this.state.positionHistory.push(positionMatrix);

        const result = {
            success: true,
            state: this.state
        };

        const opponentColor = this.state.currentTurn === 'white' ? 'black' : 'white';
        const isCheck = this.state.board.isKingInCheck(opponentColor);

        if (isCheck) {
            result.check = true;
        }

        const gameEnd = GameEndDetector.checkForGameEndAfterMove(this.state);
        if(gameEnd) {
            result.gameEnd = gameEnd;
            if(gameEnd === 'checkmate') {
                this.state.gameStatus = 'checkmate';
                this.state.winner = this.state.currentTurn;
            } else if(gameEnd === 'stalemate') {
                this.state.gameStatus = 'stalemate';
            } else if(gameEnd === 'insufficientMaterial') {
                this.state.gameStatus = 'insufficientMaterial';
            } else if(gameEnd === 'threefoldRepetition') {
                this.state.gameStatus = 'threefoldRepetition';
            } else if(gameEnd === 'fiftyMoveRule') {
                this.state.gameStatus = 'fiftyMoveRule';
            }
        }

        this.state.currentTurn = this.state.currentTurn === 'white' ? 'black' : 'white';

        return result;
    }

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

        this.state.gameStatus = 'drawByAgreement';
        this.state.drawProposed = null;

        return {
            success: true,
            draw: true,
            state: this.state
        };
    }

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
}

module.exports = Game;
