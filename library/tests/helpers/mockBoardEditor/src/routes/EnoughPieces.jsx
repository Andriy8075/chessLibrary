import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ExpectedResult from '../components/ExpectedResult';
import squareClickFunctions from '../hooks/squareClickFunctions';

function EnoughPieces({ editor }) {
  const handleSquareClick = (row, col) => {
    const cell = { row, col };

    const func = squareClickFunctions[editor.mode];
    if (func) {
      func(editor, cell);
    }
  };

  return (
    <div className="route-container">
      <div className="controls">
        <PieceSelector
          selectedPiece={editor.selectedPiece}
          selectedColor={editor.selectedColor}
          onPieceSelect={editor.setSelectedPiece}
          onColorSelect={editor.setSelectedColor}
        />
        <ModeSelector
          mode={editor.mode}
          onModeChange={editor.setMode}
          availableModes={['place']}
        />
      </div>
      <ChessBoard
        board={editor.board}
        mode={editor.mode}
        onSquareClick={handleSquareClick}
      />
      <div className="enough-pieces-panel">
        <h3>Enough Pieces</h3>
        <div className="enough-pieces-controls">
          <ExpectedResult
            value={editor.enoughPiecesResult}
            onChange={editor.setEnoughPiecesResult}
            trueId="enoughPiecesResultTrue"
            falseId="enoughPiecesResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default EnoughPieces;

