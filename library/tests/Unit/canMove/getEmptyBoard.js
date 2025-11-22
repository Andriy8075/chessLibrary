const MockBoard = require('./MockBoard');

const getEmptyBoard = () => {
    return new MockBoard();
}

module.exports = getEmptyBoard;