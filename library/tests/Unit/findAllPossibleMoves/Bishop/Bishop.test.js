const loadMockBoards = require('../../../helpers/loadMockBoards');
const sortMoves = require('../sort');

test('board cases', () => {
    const boards = loadMockBoards('Unit/boards/Bishop');
    boards.forEach(board => {
        const bishop = board.board.getPieceOnCell(board.mainPiecePosition);
        const possibleMoves = bishop.findAllPossibleMoves();
        
        const { sortedPossibleMoves, sortedExpectedMoves } = sortMoves(possibleMoves, board.moves);
        
        expect(sortedPossibleMoves).toEqual(sortedExpectedMoves);
    });
});