import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import ExpectedResult from '../components/ExpectedResult';
import PromotionPieceSelector from '../components/PromotionPieceSelector';
import EnPassantInfo from '../components/EnPassantInfo';
import { useDualBoardEditor } from '../hooks/useDualBoardEditor';
import './route-common.css';
import './TryMove.css';

const TryMove = forwardRef(({ initialSchema }, ref) => {
  const editor = useDualBoardEditor();

  // Expose getCurrentSchema via ref
  useImperativeHandle(ref, () => ({
    getCurrentSchema: () => editor.getCurrentSchema(),
    loadFromSchema: (schema) => editor.loadFromSchema(schema)
  }));

  // Load schema when initialSchema changes
  useEffect(() => {
    if (initialSchema && initialSchema.boardType === 'tryMove') {
      editor.loadFromSchema(initialSchema);
    }
  }, [initialSchema, editor.loadFromSchema]);

  const handleSquareClick = (boardType) => (row, col) => {
    const cell = { row, col };

    if (editor.mode === 'place') {
      if (editor.selectedPiece === 'remove') {
        editor.removePiece(boardType, cell);
      } else if (editor.selectedPiece && editor.selectedColor) {
        editor.placePiece(boardType, cell, editor.selectedPiece, editor.selectedColor);
      }
    } else if (editor.mode === 'cellFrom') {
      editor.setCellFrom(cell);
    } else if (editor.mode === 'cellTo') {
      editor.setCellTo(cell);
    } else if (editor.mode === 'enPassantTarget') {
      // Set en passant target for the clicked board
      if (boardType === 'before') {
        editor.setExtraInfoBefore(prev => ({ ...prev, enPassantTarget: cell }));
      } else {
        editor.setExtraInfoAfter(prev => ({ ...prev, enPassantTarget: cell }));
      }
    }
  };

  const showAfterBoard = editor.tryMoveResult === true;

  return (
    <div className="route-container try-move-dual-container">
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
          availableModes={['place', 'cellFrom', 'cellTo', 'enPassantTarget']}
        />
      </div>

      <div className="try-move-result-selector">
        <h3>Try Move Result</h3>
        <p>First, choose whether the move should succeed or fail:</p>
        <ExpectedResult
          value={editor.tryMoveResult}
          onChange={editor.setTryMoveResult}
          trueId="tryMoveResultTrue"
          falseId="tryMoveResultFalse"
        />
        {editor.tryMoveResult === null && (
          <p className="result-hint">Please select a result to continue</p>
        )}
        {editor.tryMoveResult === false && (
          <p className="result-hint">Move failed - board state remains unchanged</p>
        )}
        {editor.tryMoveResult === true && (
          <p className="result-hint">Move succeeded - set up the board state after the move</p>
        )}
      </div>

      <div className={`dual-board-layout ${showAfterBoard ? 'with-after' : 'single-board'}`}>
        <div className="board-section board-before-section">
          <h3 className="board-section-title">Before Move</h3>
          <ChessBoard
            board={editor.boardBefore}
            mode={editor.mode}
            onSquareClick={handleSquareClick('before')}
            cellFrom={editor.cellFrom}
            cellTo={editor.cellTo}
            enPassantTarget={editor.extraInfoBefore.enPassantTarget}
          />
          <EnPassantInfo
            enPassantTarget={editor.extraInfoBefore.enPassantTarget}
            onEnPassantChange={(target) => {
              editor.setExtraInfoBefore(prev => ({ ...prev, enPassantTarget: target }));
            }}
            piecesMadeMoves={editor.extraInfoBefore.piecesMadeMoves}
            onPiecesMovedChange={(moves) => {
              editor.setExtraInfoBefore(prev => ({ ...prev, piecesMadeMoves: moves }));
            }}
          />
        </div>

        {showAfterBoard && (
          <>
            <div className="copy-buttons-section">
              <button
                type="button"
                className="copy-btn copy-to-after-btn"
                onClick={() => editor.copyBoardTo('before', 'after')}
                title="Copy arrangement and extraInfo from Before to After"
              >
                Copy to After →
              </button>
              <button
                type="button"
                className="copy-btn copy-to-before-btn"
                onClick={() => editor.copyBoardTo('after', 'before')}
                title="Copy arrangement and extraInfo from After to Before"
              >
                ← Copy to Before
              </button>
            </div>

            <div className="board-section board-after-section">
              <h3 className="board-section-title">After Move</h3>
              <ChessBoard
                board={editor.boardAfter}
                mode={editor.mode}
                onSquareClick={handleSquareClick('after')}
                cellFrom={editor.cellFrom}
                cellTo={editor.cellTo}
                enPassantTarget={editor.extraInfoAfter.enPassantTarget}
              />
              <EnPassantInfo
                enPassantTarget={editor.extraInfoAfter.enPassantTarget}
                onEnPassantChange={(target) => {
                  editor.setExtraInfoAfter(prev => ({ ...prev, enPassantTarget: target }));
                }}
                piecesMadeMoves={editor.extraInfoAfter.piecesMadeMoves}
                onPiecesMovedChange={(moves) => {
                  editor.setExtraInfoAfter(prev => ({ ...prev, piecesMadeMoves: moves }));
                }}
              />
            </div>
          </>
        )}
      </div>

      <div className="try-move-panel">
        <h3>Move Details</h3>
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
          <PromotionPieceSelector
            value={editor.tryMovePromotionPiece}
            onChange={editor.setTryMovePromotionPiece}
            namePrefix="tryMove"
          />
        </div>
      </div>
    </div>
  );
});

TryMove.displayName = 'TryMove';

export default TryMove;
