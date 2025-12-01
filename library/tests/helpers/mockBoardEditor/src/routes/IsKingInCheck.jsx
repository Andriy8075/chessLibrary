import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ColorSelector from '../components/ColorSelector';
import ExpectedResult from '../components/ExpectedResult';
import './route-common.css';

function IsKingInCheck({ editor }) {
  const handleSquareClick = (row, col) => {
    const cell = { row, col };

    if (editor.mode === 'place') {
      if (editor.selectedPiece === 'remove') {
        editor.removePiece(cell);
      } else if (editor.selectedPiece && editor.selectedColor) {
        editor.placePiece(cell, editor.selectedPiece, editor.selectedColor);
      }
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
      <div className="is-king-in-check-panel">
        <h3>Is King In Check</h3>
        <div className="is-king-in-check-controls">
          <ColorSelector
            value={editor.kingColor}
            onChange={editor.setKingColor}
            whiteId="kingColorWhite"
            blackId="kingColorBlack"
            label="King Color"
          />
          <ExpectedResult
            value={editor.kingCheckResult}
            onChange={editor.setKingCheckResult}
            trueId="kingCheckResultTrue"
            falseId="kingCheckResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default IsKingInCheck;

