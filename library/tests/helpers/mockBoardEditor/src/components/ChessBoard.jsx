import React from 'react';
import './ChessBoard.css';

function ChessBoard({ board, squaresHighlighting: squaresHighlights }) {
  const squares = [];

  for (let row = 8; row >= 1; row--) {
    for (let col = 1; col <= 8; col++) {
      const piece = board[row - 1][col - 1];
      const isMainPiece = squaresHighlights.mainPiece && squaresHighlights.mainPiece.position.row === row && squaresHighlights.mainPiece.position.col === col;
      const isValidMove = squaresHighlights.validMoves.some(m => m.row === row && m.col === col);
      const isTargetSquare = squaresHighlights.targetSquare && squaresHighlights.targetSquare.row === row && squaresHighlights.targetSquare.col === col;
      const isCellFrom = squaresHighlights.cellFrom && squaresHighlights.cellFrom.row === row && squaresHighlights.cellFrom.col === col;
      const isCellTo = squaresHighlights.cellTo && squaresHighlights.cellTo.row === row && squaresHighlights.cellTo.col === col;

      const squareClasses = [
        'square',
        piece ? 'has-piece' : '',
        isMainPiece ? 'main-piece' : '',
        isValidMove ? 'valid-move' : '',
        isTargetSquare ? 'target-square' : '',
        isCellFrom ? 'cell-from' : '',
        isCellTo ? 'cell-to' : ''
      ].filter(Boolean).join(' ');

      squares.push(
        <div
          key={`${row}-${col}`}
          className={squareClasses}
          data-row={row}
          data-col={col}
          onClick={() => onSquareClick(row, col)}
        >
          {piece && (
            <img
              src={`/images/${piece.color}${piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}.png`}
              alt={`${piece.color} ${piece.type}`}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div className="board-container">
      <div className="chess-board">{squares}</div>
    </div>
  );
}

export default ChessBoard;

