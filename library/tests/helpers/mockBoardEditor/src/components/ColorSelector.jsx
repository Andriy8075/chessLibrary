import React from 'react';
import './ColorSelector.css';

function ColorSelector({ value, onChange, whiteId, blackId, label }) {
  return (
    <div className="color-selector-section">
      <h4>{label}</h4>
      <label className="radio-label">
        <input
          type="radio"
          name={`color-${whiteId}`}
          value="white"
          id={whiteId}
          checked={value === 'white'}
          onChange={() => onChange('white')}
        />
        White
      </label>
      <label className="radio-label">
        <input
          type="radio"
          name={`color-${blackId}`}
          value="black"
          id={blackId}
          checked={value === 'black'}
          onChange={() => onChange('black')}
        />
        Black
      </label>
    </div>
  );
}

export default ColorSelector;

