import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ColorSelector from '../components/ColorSelector';
import ExpectedResult from '../components/ExpectedResult';
import squareClickFunctions from '../hooks/squareClickFunctions';
import './route-common.css';

function StalemateAfterMove({ editor }) {
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
      <div className="stalemate-after-move-panel">
        <h3>Stalemate After Move</h3>
        <div className="stalemate-after-move-controls">
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
          <ColorSelector
            value={editor.stalemateAfterMoveColor}
            onChange={editor.setStalemateAfterMoveColor}
            whiteId="stalemateAfterMoveColorWhite"
            blackId="stalemateAfterMoveColorBlack"
            label="Color"
          />
          <ExpectedResult
            value={editor.stalemateAfterMoveResult}
            onChange={editor.setStalemateAfterMoveResult}
            trueId="stalemateAfterMoveResultTrue"
            falseId="stalemateAfterMoveResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default StalemateAfterMove;

