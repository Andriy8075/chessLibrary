const validateMoveRequest = require('./validators/moveRequestValidator');
const validateResignRequest = require('./validators/resignRequestValidator');
const validateProposeDrawRequest = require('./validators/proposeDrawRequestValidator');
const validateAcceptDrawRequest = require('./validators/acceptDrawRequestValidator');
const GameEndDetector = require('./board/GameEndDetector');
const loadDefaultBoard = require('./utils/loadDefaultBoars');

class Game {
    constructor() {
        this.state = {
            board: loadDefaultBoard(),
            currentTurn: 'white',
            lastMove: null,
            gameStatus: 'active',
            winner: null,
            moveHistory: [],
            positionHistory: [],
            promotionRequired: false,
            pendingDrawProposal: null
        };
        
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
            moveHistory: this.state.moveHistory,
            promotionRequired: this.state.promotionRequired,
            pendingDrawProposal: this.state.pendingDrawProposal
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
                break;
            case 'resign':
                return this._processResign(request);
                break;
            case 'proposeDraw':
                return this._processProposeDraw(request);
                break;
            case 'acceptDraw':
                return this._processAcceptDraw(request);
                break;
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
        
        const capturedPiece = this.state.board.getPieceOnCell(cellTo);
        const pieceAtFrom = this.state.board.getPieceOnCell(cellFrom);
        const wasPawnMove = pieceAtFrom && pieceAtFrom.constructor.name === 'Pawn';
        const isEnPassantMove = wasPawnMove && this.state.board.getEnPassantTarget() && 
            this.state.board.getEnPassantTarget().col === cellTo.col;
        
        const wasCapture = !!capturedPiece || isEnPassantMove;
        
        const moveResult = this.state.board.tryToMove(cellFrom, cellTo, promotionPiece);

        if (!moveResult.success) {
            if (moveResult.error === 'Promotion is required') {
                this.state.promotionRequired = true;
                return {
                    success: false,
                    error: 'Promotion is required',
                    state: this.state
                };
            }
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
        this.state.promotionRequired = false;
        this.state.pendingDrawProposal = null;

        return result;
    }

    _processResign(request) {
        const { valid, error } = validateResignRequest(request);
        if (!valid) {
            return {
                success: false,
                error,
                state: this.state
            };
        }
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }
        const { color } = request;
        this.state.gameStatus = 'resigned';
        this.state.winner = color === 'white' ? 'black' : 'white';
        return {
            success: true,
            state: this.state
        };
    }

    _processProposeDraw(request) {
        const { valid, error } = validateProposeDrawRequest(request);
        if (!valid) {
            return {
                success: false,
                error,
                state: this.state
            };
        }
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }
        const { color } = request;
        if (this.state.pendingDrawProposal !== null) {
            return {
                success: false,
                error: 'There is already a pending draw proposal',
                state: this.state
            };
        }
        this.state.pendingDrawProposal = color;
        return {
            success: true,
            state: this.state
        };
    }

    _processAcceptDraw(request) {
        const { valid, error } = validateAcceptDrawRequest(request);
        if (!valid) {
            return {
                success: false,
                error,
                state: this.state
            };
        }
        if (this.state.gameStatus !== 'active') {
            return {
                success: false,
                error: `Game is not active. Status: ${this.state.gameStatus}`,
                state: this.state
            };
        }
        const { color } = request;
        if (this.state.pendingDrawProposal === null) {
            return {
                success: false,
                error: 'No pending draw proposal to accept',
                state: this.state
            };
        }
        if (this.state.pendingDrawProposal === color) {
            return {
                success: false,
                error: 'Cannot accept your own draw proposal',
                state: this.state
            };
        }
        this.state.gameStatus = 'drawByAgreement';
        this.state.pendingDrawProposal = null;
        return {
            success: true,
            state: this.state
        };
    }
}

module.exports = Game;
