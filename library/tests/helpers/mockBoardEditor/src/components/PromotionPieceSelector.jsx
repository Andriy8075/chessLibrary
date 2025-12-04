import React from 'react';
import './ExpectedResult.css'; // Reusing styles

const PROMOTION_PIECES = [
  { value: null, label: 'None' },
  { value: 'queen', label: 'Queen' },
  { value: 'rook', label: 'Rook' },
  { value: 'bishop', label: 'Bishop' },
  { value: 'knight', label: 'Knight' }
];

function PromotionPieceSelector({ value, onChange, namePrefix }) {
  return (
    <div className="expected-result-section">
      <h4>Promotion Piece</h4>
      {PROMOTION_PIECES.map(piece => (
        <label key={piece.value || 'none'} className="radio-label">
          <input
            type="radio"
            name={`promotion-${namePrefix}`}
            value={piece.value || 'none'}
            id={`${namePrefix}-${piece.value || 'none'}`}
            checked={value === piece.value}
            onChange={() => onChange(piece.value)}
          />
          {piece.label}
        </label>
      ))}
    </div>
  );
}

export default PromotionPieceSelector;

