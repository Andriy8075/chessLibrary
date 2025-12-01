const squareClickFunctions = {
    'place': (editor, cell) => {
        if (editor.selectedPiece === 'remove') {
          editor.removePiece(cell);
        } else if (editor.selectedPiece && editor.selectedColor) {
          editor.placePiece(cell, editor.selectedPiece, editor.selectedColor);
        }
    },
    'main': (editor, cell) => {
        const piece = editor.getPiece(cell);
        if (piece) {
          editor.setMainPiece({ ...piece, position: cell });
        }
    },
    'moves': (editor, cell) => {
        if (editor.mainPiece) {
          editor.toggleValidMove(cell);
        } else {
          alert('Please select a main piece first!');
        }
    },
    'cellFrom': (editor, cell) => {
        editor.setCellFrom(cell);
    },
    'cellTo': (editor, cell) => {
        editor.setCellTo(cell);
    },
    'target': (editor, cell) => {
        editor.setTargetSquare(cell);
    },
}

export { squareClickFunctions as default };