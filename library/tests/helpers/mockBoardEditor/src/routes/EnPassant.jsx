import React from 'react';
import PieceSelector from '../components/PieceSelector';
import ModeSelector from '../components/ModeSelector';
import ChessBoard from '../components/ChessBoard';
import EnPassantInfo from '../components/EnPassantInfo';

function EnPassant({ editor }) {
  const handleSquareClick = (row, col) => {
    const cell = { row, col };

    if (editor.mode === 'place') {
      if (editor.selectedPiece === 'remove') {
        editor.removePiece(cell);
      } else if (editor.selectedPiece && editor.selectedColor) {
        editor.placePiece(cell, editor.selectedPiece, editor.selectedColor);
      }
    } else if (editor.mode === 'main') {
      const piece = editor.getPiece(cell);
      if (piece) {
        editor.setMainPiece({ ...piece, position: cell });
      }
    } else if (editor.mode === 'moves') {
      if (editor.mainPiece) {
        editor.toggleValidMove(cell);
      } else {
        alert('Please select a main piece first!');
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
          availableModes={['place', 'main', 'moves']}
        />
      </div>
      <ChessBoard
        board={editor.board}
        mode={editor.mode}
        onSquareClick={handleSquareClick}
        mainPiece={editor.mainPiece}
        validMoves={editor.validMoves}
      />
      <EnPassantInfo
        enPassantTarget={editor.extraInfo.enPassantTarget}
        onEnPassantChange={(target) => {
          editor.setExtraInfo(prev => ({ ...prev, enPassantTarget: target }));
        }}
        piecesMadeMoves={editor.extraInfo.piecesMadeMoves}
        onPiecesMovedChange={(moves) => {
          editor.setExtraInfo(prev => ({ ...prev, piecesMadeMoves: moves }));
        }}
      />
    </div>
  );
}

export default EnPassant;

