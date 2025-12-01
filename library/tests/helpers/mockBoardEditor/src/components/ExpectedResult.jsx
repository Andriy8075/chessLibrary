import React from 'react';
import './ExpectedResult.css';

function ExpectedResult({ value, onChange, trueId, falseId }) {
  return (
    <div className="expected-result-section">
      <h4>Expected Result</h4>
      <label className="radio-label">
        <input
          type="radio"
          name={`expectedResult-${trueId}`}
          value="true"
          id={trueId}
          checked={value === true}
          onChange={() => onChange(true)}
        />
        True
      </label>
      <label className="radio-label">
        <input
          type="radio"
          name={`expectedResult-${falseId}`}
          value="false"
          id={falseId}
          checked={value === false}
          onChange={() => onChange(false)}
        />
        False
      </label>
    </div>
  );
}

export default ExpectedResult;

