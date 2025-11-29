const loadMockBoards = require('../../../helpers/loadMockBoards');
const sortMoves = require('../sort');

test('board cases', () => {
    const boards = loadMockBoards('Unit/findAllPossibleMoves/Knight/boards');
    boards.forEach(board => {
        const knight = board.board.getPieceOnCell(board.mainPiecePosition);
        const possibleMoves = knight.findAllPossibleMoves();
        
        const { sortedPossibleMoves, sortedExpectedMoves } = sortMoves(possibleMoves, board.moves);
        
        expect(sortedPossibleMoves).toEqual(sortedExpectedMoves);
    });
});