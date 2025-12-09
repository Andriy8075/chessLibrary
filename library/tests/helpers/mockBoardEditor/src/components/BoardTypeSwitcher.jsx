import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

function BoardTypeSwitcher({ currentBoardType, onBoardTypeChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitch = (boardType) => {
    if (boardType === currentBoardType) return;
    
    onBoardTypeChange(boardType);
    navigate(`/${boardType}`);
  };

  const currentRoute = location.pathname.slice(1) || 'findAllPossibleMoves';

  return (
    <div className="board-type-switcher">
      <h3>Switch Board Type</h3>
      <div className="board-type-switcher-buttons">
        {BOARD_TYPES.map(type => {
          const isActive = currentRoute === type.id || currentBoardType === type.id;
          return (
            <button
              key={type.id}
              className={`board-type-btn-small ${isActive ? 'active' : ''}`}
              onClick={() => handleSwitch(type.id)}
              title={type.label}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BoardTypeSwitcher;
