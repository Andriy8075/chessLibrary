const { isValidCell } = require('../utils/Cell');

class Piece {
    constructor(color, cell) {
        if (color !== 'white' && color !== 'black') {
            throw new Error(`Invalid color: ${color}. Must be 'white' or 'black'`);
        }
        if (!isValidCell(cell)) {
            throw new Error(`Invalid cell: ${JSON.stringify(cell)}`);
        }
        this.color = color;
        this.cell = cell;
    }

    getOppositeColor() {
        return this.color === 'white' ? 'black' : 'white';
    }

    canMoveToCellOnEmptyBoard(cellTo) {
        throw new Error('canMoveToCellOnEmptyBoard must be implemented by subclass');
    }

    doesCheckToKing(board) {
        throw new Error('doesCheckToKing must be implemented by subclass');
    }

    findAllPossibleMoves(board) {
        throw new Error('findAllPossibleMoves must be implemented by subclass');
    }

    updatePosition(newCell) {
        if (!isValidCell(newCell)) {
            throw new Error(`Invalid cell: ${JSON.stringify(newCell)}`);
        }
        this.cell = newCell;
    }
}

module.exports = Piece;
