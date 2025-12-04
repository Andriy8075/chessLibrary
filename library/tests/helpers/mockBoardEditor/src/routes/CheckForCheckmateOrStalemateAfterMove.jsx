import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import CheckmateStalemateResultSelector from '../components/CheckmateStalemateResultSelector';
import squareClickFunctions from '../hooks/squareClickFunctions';
import './route-common.css';

function CheckForCheckmateOrStalemateAfterMove({ editor }) {
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
          availableModes={['place', 'cellTo']}
        />
      </div>
      <ChessBoard
        board={editor.board}
        mode={editor.mode}
        onSquareClick={handleSquareClick}
        cellTo={editor.cellTo}
      />
      <div className="check-for-checkmate-or-stalemate-after-move-panel">
        <h3>Check For Checkmate Or Stalemate After Move</h3>
        <div className="check-for-checkmate-or-stalemate-after-move-controls">
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
          <CheckmateStalemateResultSelector
            value={editor.checkForCheckmateOrStalemateAfterMoveResult}
            onChange={editor.setCheckForCheckmateOrStalemateAfterMoveResult}
            namePrefix="checkForCheckmateOrStalemateAfterMove"
          />
        </div>
      </div>
    </div>
  );
}

export default CheckForCheckmateOrStalemateAfterMove;

