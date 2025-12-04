import React from 'react';
import './ExpectedResult.css';

function CheckmateStalemateResultSelector({ value, onChange, namePrefix }) {
  return (
    <div className="expected-result-section">
      <h4>Result</h4>
      <label className="radio-label">
        <input
          type="radio"
          name={`result-${namePrefix}`}
          value="null"
          id={`${namePrefix}-null`}
          checked={value === null || value === undefined}
          onChange={() => onChange(null)}
        />
        None
      </label>
      <label className="radio-label">
        <input
          type="radio"
          name={`result-${namePrefix}`}
          value="checkmate"
          id={`${namePrefix}-checkmate`}
          checked={value === 'checkmate'}
          onChange={() => onChange('checkmate')}
        />
        Checkmate
      </label>
      <label className="radio-label">
        <input
          type="radio"
          name={`result-${namePrefix}`}
          value="stalemate"
          id={`${namePrefix}-stalemate`}
          checked={value === 'stalemate'}
          onChange={() => onChange('stalemate')}
        />
        Stalemate
      </label>
    </div>
  );
}

export default CheckmateStalemateResultSelector;

