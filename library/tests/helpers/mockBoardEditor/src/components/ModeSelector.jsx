import React from 'react';
import './ModeSelector.css';

function ModeSelector({ mode, onModeChange, availableModes }) {
  const modes = [
    { id: 'place', label: 'Place Piece' },
    { id: 'main', label: 'Select Main Piece' },
    { id: 'moves', label: 'Mark Moves' },
    { id: 'target', label: 'Select Target Square' },
    { id: 'cellFrom', label: 'Select Cell From' },
    { id: 'cellTo', label: 'Select Cell To' },
    { id: 'enPassantTarget', label: 'Select En Passant Target' }
  ];

  return (
    <div className="mode-selector">
      <h3>Mode</h3>
      <div className="mode-buttons">
        {modes
          .filter(m => !availableModes || availableModes.includes(m.id))
          .map(m => (
            <button
              key={m.id}
              className={`mode-btn ${mode === m.id ? 'active' : ''} ${!availableModes?.includes(m.id) ? 'disabled' : ''}`}
              onClick={() => availableModes?.includes(m.id) && onModeChange(m.id)}
              disabled={!availableModes?.includes(m.id)}
            >
              {m.label}
            </button>
          ))}
      </div>
    </div>
  );
}

export default ModeSelector;

