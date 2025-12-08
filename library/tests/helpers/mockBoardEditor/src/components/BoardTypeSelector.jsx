import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BoardTypeSelector.css';

const BOARD_TYPES = [
  { id: 'findAllPossibleMoves', label: 'Find All Possible Moves' },
  { id: 'enPassant', label: 'En Passant' },
  { id: 'simpleBoard', label: 'Simple Board' },
  { id: 'isInsufficientMaterial', label: 'Is Insufficient Material' },
  { id: 'isSquareAttacked', label: 'Is Square Attacked' },
  { id: 'isKingInCheck', label: 'Is King In Check' },
  { id: 'wouldMoveCauseCheck', label: 'Would Move Cause Check' },
  { id: 'tryMove', label: 'Try Move' },
  { id: 'hasLegalMoves', label: 'Has Legal Moves' },
  { id: 'checkForCheckmateOrStalemateAfterMove', label: 'Check For Checkmate Or Stalemate After Move' }
];

function BoardTypeSelector({ onSelect }) {
  const navigate = useNavigate();

  const handleSelect = (boardType) => {
    onSelect(boardType);
    navigate(`/${boardType}`);
  };

  return (
    <div className="board-type-selector">
      <h2>Select Board Type</h2>
      <div className="board-type-buttons">
        {BOARD_TYPES.map(type => (
          <button
            key={type.id}
            className="board-type-btn"
            onClick={() => handleSelect(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default BoardTypeSelector;

