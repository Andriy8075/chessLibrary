import React from 'react';
import './EnPassantInfo.css';

function EnPassantInfo({ enPassantTarget, onEnPassantChange, piecesMadeMoves, onPiecesMovedChange }) {
  return (
    <div className="extra-info-panel">
      <h3>Extra Info</h3>
      <div className="en-passant-section">
        <h4>En Passant Target</h4>
        <div className="en-passant-inputs">
          <label>
            Row:
            <input
              type="number"
              id="enPassantRow"
              min="1"
              max="8"
              value={enPassantTarget?.row || ''}
              onChange={(e) => {
                const row = e.target.value ? parseInt(e.target.value, 10) : null;
                const col = enPassantTarget?.col || null;
                onEnPassantChange(row && col ? { row, col } : null);
              }}
            />
          </label>
          <label>
            Col:
            <input
              type="number"
              id="enPassantCol"
              min="1"
              max="8"
              value={enPassantTarget?.col || ''}
              onChange={(e) => {
                const col = e.target.value ? parseInt(e.target.value, 10) : null;
                const row = enPassantTarget?.row || null;
                onEnPassantChange(row && col ? { row, col } : null);
              }}
            />
          </label>
        </div>
      </div>
      <div className="pieces-moved-section">
        <h4>Pieces Made Moves</h4>
        <div className="pieces-moved-controls">
          {Object.keys(piecesMadeMoves || {}).map(key => (
            <label key={key}>
              <input
                type="checkbox"
                data-key={key}
                checked={piecesMadeMoves[key] || false}
                onChange={(e) => {
                  onPiecesMovedChange({
                    ...piecesMadeMoves,
                    [key]: e.target.checked
                  });
                }}
              />
              {key}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EnPassantInfo;

