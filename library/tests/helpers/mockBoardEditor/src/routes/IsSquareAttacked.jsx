import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ColorSelector from '../components/ColorSelector';
import ExpectedResult from '../components/ExpectedResult';
import './route-common.css';

function IsSquareAttacked({ editor }) {
  const handleSquareClick = (row, col) => {
    const cell = { row, col };

    if (editor.mode === 'place') {
      if (editor.selectedPiece === 'remove') {
        editor.removePiece(cell);
      } else if (editor.selectedPiece && editor.selectedColor) {
        editor.placePiece(cell, editor.selectedPiece, editor.selectedColor);
      }
    } else if (editor.mode === 'target') {
      editor.setTargetSquare({ row, col });
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
          availableModes={['place', 'target']}
        />
      </div>
      <ChessBoard
        board={editor.board}
        mode={editor.mode}
        onSquareClick={handleSquareClick}
        targetSquare={editor.targetSquare}
      />
      <div className="is-square-attacked-panel">
        <h3>Is Square Attacked</h3>
        <div className="is-square-attacked-controls">
          <div className="target-square-section">
            <h4>Target Square</h4>
            <p>Click "Select Target Square" mode, then click a square on the board</p>
            <div id="targetSquareDisplay">
              {editor.targetSquare
                ? `Row: ${editor.targetSquare.row}, Col: ${editor.targetSquare.col}`
                : 'No square selected'}
            </div>
            <button type="button" onClick={() => editor.setTargetSquare(null)} className="clear-btn">
              Clear
            </button>
          </div>
          <ColorSelector
            value={editor.attackingColor}
            onChange={editor.setAttackingColor}
            whiteId="attackingColorWhite"
            blackId="attackingColorBlack"
            label="Attacking Color"
          />
          <ExpectedResult
            value={editor.expectedResult}
            onChange={editor.setExpectedResult}
            trueId="expectedResultTrue"
            falseId="expectedResultFalse"
          />
        </div>
      </div>
    </div>
  );
}

export default IsSquareAttacked;

