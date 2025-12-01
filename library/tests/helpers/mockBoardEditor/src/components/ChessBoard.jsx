import React from 'react';
import './ChessBoard.css';

function ChessBoard({ board, mode, onSquareClick, mainPiece, validMoves, targetSquare, cellFrom, cellTo }) {
  const squares = [];

  for (let row = 8; row >= 1; row--) {
    for (let col = 1; col <= 8; col++) {
      const piece = board[row - 1][col - 1];
      const isMainPiece = mainPiece && mainPiece.position.row === row && mainPiece.position.col === col;
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);
      const isTargetSquare = targetSquare && targetSquare.row === row && targetSquare.col === col;
      const isCellFrom = cellFrom && cellFrom.row === row && cellFrom.col === col;
      const isCellTo = cellTo && cellTo.row === row && cellTo.col === col;

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

