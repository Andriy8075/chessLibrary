import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ColorSelector from '../components/ColorSelector';
import ExpectedResult from '../components/ExpectedResult';
import squareClickFunctions from '../hooks/squareClickFunctions';
import './route-common.css';

function HasLegalMoves({ editor }) {
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
      <div className="has-legal-moves-panel">
        <h3>Has Legal Moves</h3>
        <div className="has-legal-moves-controls">
          <ColorSelector
            value={editor.hasLegalMovesColor}
            onChange={editor.setHasLegalMovesColor}
            whiteId="hasLegalMovesColorWhite"
            blackId="hasLegalMovesColorBlack"
            label="Color"
          />
          <ExpectedResult
            value={editor.hasLegalMovesResult}
            onChange={editor.setHasLegalMovesResult}
            trueId="hasLegalMovesResultTrue"
            falseId="hasLegalMovesResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default HasLegalMoves;

