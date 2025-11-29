const { isValidCell } = require('../utils/Cell');
const { InvalidColorError, InvalidCellError, NotImplementedMethodError } = require('../Errors.js');


class Piece {
    constructor(color, cell, board) {
        if (color !== 'white' && color !== 'black') {
            throw new InvalidColorError(`Invalid color: ${color}. Must be 'white' or 'black'`);
        }
        if (!isValidCell(cell)) {
            throw new InvalidCellError(`Invalid cell: ${JSON.stringify(cell)}`);
        }
        this.color = color;
        this.cell = cell;
        this.board = board;
    }

    getOppositeColor() {
        return this.color === 'white' ? 'black' : 'white';
    }

    canMove(cellTo) {
        throw new NotImplementedMethodError('canMove must be implemented by subclass');
    }

    findAllPossibleMoves() {
        throw new NotImplementedMethodError('findAllPossibleMoves must be implemented by subclass');
    }

    updatePosition(newCell) {
        if (!isValidCell(newCell)) {
            throw new InvalidCellError(`Invalid cell: ${JSON.stringify(newCell)}`);
        }
        this.cell = newCell;
    }
}

module.exports = Piece;
