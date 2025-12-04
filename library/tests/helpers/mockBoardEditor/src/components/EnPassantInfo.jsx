import React from 'react';
import './EnPassantInfo.css';

function EnPassantInfo({ enPassantTarget, onEnPassantChange, piecesMadeMoves, onPiecesMovedChange }) {
  return (
    <div className="extra-info-panel">
      <h3>Extra Info</h3>
      <div className="en-passant-section">
        <h4>En Passant Target</h4>
        <p>Click "Select En Passant Target" mode, then click a square on the board</p>
        <div id="enPassantTargetDisplay">
          {enPassantTarget
            ? `Row: ${enPassantTarget.row}, Col: ${enPassantTarget.col}`
            : 'No cell selected'}
        </div>
        <button type="button" onClick={() => onEnPassantChange(null)} className="clear-btn">
          Clear
        </button>
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

