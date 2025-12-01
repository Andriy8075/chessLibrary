import React from 'react';
import './PieceSelector.css';

const PIECES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
const COLORS = ['white', 'black'];

function PieceSelector({ selectedPiece, selectedColor, onPieceSelect, onColorSelect }) {
  return (
    <div className="piece-selector">
      <h3>Select Piece</h3>
      <div className="piece-options">
        <div className="color-selector">
          {COLORS.map(color => (
            <button
              key={color}
              className={`color-btn ${selectedColor === color ? 'active' : ''}`}
              onClick={() => onColorSelect(color)}
            >
              {color}
            </button>
          ))}
        </div>
        <div className="piece-buttons">
          {PIECES.map(piece => (
            <button
              key={piece}
              className={`piece-btn ${selectedPiece === piece && selectedColor ? 'active' : ''}`}
              onClick={() => onPieceSelect(piece)}
              disabled={!selectedColor}
            >
              {piece}
            </button>
          ))}
          <button
            className={`piece-btn remove ${selectedPiece === 'remove' ? 'active' : ''}`}
            onClick={() => onPieceSelect('remove')}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default PieceSelector;

