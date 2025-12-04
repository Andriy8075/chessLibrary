const Board = require('./board/Board');
const validateMoveRequest = require('./validators/moveRequestValidator');
const GameEnd = require('./utils/GameEnd');

class Game {
    constructor() {
        this.state = {
            board: new Board(),
            currentTurn: 'white',
            lastMove: null,
            gameStatus: 'active',
            winner: null,
            drawProposed: null,
            moveHistory: []
        };
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
        const moveSuccess = this.state.board.tryToMove(cellFrom, cellTo, promotionPiece);

        if (!moveSuccess) {
            return {
                success: false,
                error: 'Invalid move',
                state: this.state
            };
        }

        const movedPiece = this.state.board.getPieceOnCell(cellTo);
        this.state.lastMove = {
            from: cellFrom,
            to: cellTo,
            piece: movedPiece
        };

        this.state.enPassantTarget = this.state.board.getEnPassantTarget();

        this.state.moveHistory.push({
            from: cellFrom,
            to: cellTo,
            piece: movedPiece.constructor.name,
            color: movedPiece.color
        });

        const opponentColor = this.state.currentTurn === 'white' ? 'black' : 'white';
        const isCheck = this.state.board.isKingInCheck(opponentColor);

        const gameEnd = this.state.board.checkForGameEndAfterMove(cellTo);

        if (gameEnd) {
            if (gameEnd === GameEnd.CHECKMATE) {
                this.state.gameStatus = 'checkmate';
                this.state.winner = this.state.currentTurn;
            } else if (gameEnd === GameEnd.STALEMATE 
                || gameEnd === GameEnd.INSUFFICIENT_MATERIAL 
                || gameEnd === GameEnd.FIFTY_MOVE_RULE 
                || gameEnd === GameEnd.THREEFOLD_REPETITION) {
                this.state.gameStatus = 'draw';
            }
        }

        if (this.state.gameStatus === 'active') {
            this.state.currentTurn = opponentColor;
        }

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

        this.state.gameStatus = 'draw';
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
