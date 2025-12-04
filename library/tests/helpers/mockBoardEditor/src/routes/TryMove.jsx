import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ExpectedResult from '../components/ExpectedResult';
import squareClickFunctions from '../hooks/squareClickFunctions';
import './route-common.css';

function TryMove({ editor }) {
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
      <div className="try-move-panel">
        <h3>Try Move</h3>
        <div className="try-move-controls">
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
            value={editor.tryMoveResult}
            onChange={editor.setTryMoveResult}
            trueId="tryMoveResultTrue"
            falseId="tryMoveResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default TryMove;

