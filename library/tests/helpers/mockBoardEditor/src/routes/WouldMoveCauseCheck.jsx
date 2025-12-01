import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ExpectedResult from '../components/ExpectedResult';
import './route-common.css';

function WouldMoveCauseCheck({ editor }) {
  const handleSquareClick = (row, col) => {
    const cell = { row, col };

    if (editor.mode === 'place') {
      if (editor.selectedPiece === 'remove') {
        editor.removePiece(cell);
      } else if (editor.selectedPiece && editor.selectedColor) {
        editor.placePiece(cell, editor.selectedPiece, editor.selectedColor);
      }
    } else if (editor.mode === 'cellFrom') {
      editor.setCellFrom({ row, col });
    } else if (editor.mode === 'cellTo') {
      editor.setCellTo({ row, col });
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
          availableModes={['place', 'cellFrom', 'cellTo']}
        />
      </div>
      <ChessBoard
        board={editor.board}
        mode={editor.mode}
        onSquareClick={handleSquareClick}
        cellFrom={editor.cellFrom}
        cellTo={editor.cellTo}
      />
      <div className="would-move-cause-check-panel">
        <h3>Would Move Cause Check</h3>
        <div className="would-move-cause-check-controls">
          <div className="cell-from-section">
            <h4>Cell From</h4>
            <p>Click "Select Cell From" mode, then click a square on the board</p>
            <div id="cellFromDisplay">
              {editor.cellFrom
                ? `Row: ${editor.cellFrom.row}, Col: ${editor.cellFrom.col}`
                : 'No cell selected'}
            </div>
            <button type="button" onClick={() => editor.setCellFrom(null)} className="clear-btn">
              Clear
            </button>
          </div>
          <div className="cell-to-section">
            <h4>Cell To</h4>
            <p>Click "Select Cell To" mode, then click a square on the board</p>
            <div id="cellToDisplay">
              {editor.cellTo
                ? `Row: ${editor.cellTo.row}, Col: ${editor.cellTo.col}`
                : 'No cell selected'}
            </div>
            <button type="button" onClick={() => editor.setCellTo(null)} className="clear-btn">
              Clear
            </button>
          </div>
          <ExpectedResult
            value={editor.wouldMoveCauseCheckResult}
            onChange={editor.setWouldMoveCauseCheckResult}
            trueId="wouldMoveCauseCheckResultTrue"
            falseId="wouldMoveCauseCheckResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default WouldMoveCauseCheck;

