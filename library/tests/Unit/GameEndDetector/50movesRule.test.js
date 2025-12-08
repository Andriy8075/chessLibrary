const GameEndDetector = require('../../../src/board/GameEndDetector');

function fillMoveHistory(moveHistory, start, end) {
    const whiteForwardMove = {
        from: { row: 1, col: 2 },
        to: { row: 3, col: 1 },
        piece: 'Knight',
        color: 'white',
        wasCapture: false,
        wasPawnMove: false
    };
    const whiteBackwardMove = {
        from: { row: 3, col: 1 },
        to: { row: 1, col: 2 },
        piece: 'Knight',
        color: 'white',
        wasCapture: false,
        wasPawnMove: false
    };
    const blackForwardMove = {
        from: { row: 8, col: 2 },
        to: { row: 6, col: 1 },
        piece: 'Knight',
        color: 'black',
        wasCapture: false,
        wasPawnMove: false
    };
    const blackBackwardMove = {
        from: { row: 6, col: 1 },
        to: { row: 8, col: 2 },
        piece: 'Knight',
        color: 'black',
        wasCapture: false,
        wasPawnMove: false
    };
    for (let i = start; i < end; i++) {
        switch (i % 4) {
            case 0:
                moveHistory.push(whiteForwardMove);
                break;
            case 1:
                moveHistory.push(blackForwardMove);
                break;
            case 2:
                moveHistory.push(whiteBackwardMove);
                break;
            case 3:
                moveHistory.push(blackBackwardMove);
                break;
        }
    }
}

const pawnMove = {
    from: { row: 2, col: 2 },
    to: { row: 3, col: 2 },
    piece: 'Pawn',
    color: 'white',
    wasCapture: false,
    wasPawnMove: true
};

test('game should end', () => {
    const moveHistory = []
    fillMoveHistory(moveHistory, 0, 100);
    const result = GameEndDetector.checkForFiftyMoveRuleAfterMove(moveHistory);
    expect(result).toBe('fiftyMoveRule');
});

test('game history is too short', () => {
    const moveHistory = [];
    fillMoveHistory(moveHistory, 0, 99);
    const result = GameEndDetector.checkForFiftyMoveRuleAfterMove(moveHistory);
    expect(result).toBe(null);
});

test('pawn was moved in the first move', () => {
    const moveHistory = [];
    moveHistory.push(pawnMove);
    fillMoveHistory(moveHistory, 1, 100);
    moveHistory[0].wasPawnMove = true;
    const result = GameEndDetector.checkForFiftyMoveRuleAfterMove(moveHistory);
    expect(result).toBe(null);
});

test('pawn was moved in the last move', () => {
    const moveHistory = [];
    fillMoveHistory(moveHistory, 0, 99);
    moveHistory.push(pawnMove);
    const result = GameEndDetector.checkForFiftyMoveRuleAfterMove(moveHistory);
    expect(result).toBe(null);
});

test('capture was made in the first move', () => {
    const moveHistory = [];
    fillMoveHistory(moveHistory, 0, 100);
    moveHistory[0] = {
        from: { row: 1, col: 2 },
        to: { row: 3, col: 1 },
        piece: 'Knight',
        color: 'white',
        wasCapture: true,
        wasPawnMove: false
    }
    const result = GameEndDetector.checkForFiftyMoveRuleAfterMove(moveHistory);
    expect(result).toBe(null);
});

test('capture was made in the last move', () => {
    const moveHistory = [];
    fillMoveHistory(moveHistory, 0, 100);
    moveHistory[99] = {
        from: { row: 3, col: 1 },
        to: { row: 1, col: 2 },
        piece: 'Knight',
        color: 'white',
        wasCapture: true,
        wasPawnMove: false
    }
    const result = GameEndDetector.checkForFiftyMoveRuleAfterMove(moveHistory);
    expect(result).toBe(null);
});