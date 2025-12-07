import { useState, useCallback } from 'react';

export function useDualBoardEditor() {
  const [boardBefore, setBoardBefore] = useState(() => 
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  const [boardAfter, setBoardAfter] = useState(() => 
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [mode, setMode] = useState('place');
  const [cellFrom, setCellFrom] = useState(null);
  const [cellTo, setCellTo] = useState(null);
  const [tryMoveResult, setTryMoveResult] = useState(null);
  const [tryMovePromotionPiece, setTryMovePromotionPiece] = useState(null);
  const [extraInfoBefore, setExtraInfoBefore] = useState({
    enPassantTarget: null,
    piecesMadeMoves: {
      whiteKing: false,
      blackKing: false,
      whiteKingsideRook: false,
      whiteQueensideRook: false,
      blackKingsideRook: false,
      blackQueensideRook: false
    }
  });
  const [extraInfoAfter, setExtraInfoAfter] = useState({
    enPassantTarget: null,
    piecesMadeMoves: {
      whiteKing: false,
      blackKing: false,
      whiteKingsideRook: false,
      whiteQueensideRook: false,
      blackKingsideRook: false,
      blackQueensideRook: false
    }
  });

  const resetBoardState = useCallback(() => {
    setBoardBefore(Array(8).fill(null).map(() => Array(8).fill(null)));
    setBoardAfter(Array(8).fill(null).map(() => Array(8).fill(null)));
    setCellFrom(null);
    setCellTo(null);
    setTryMoveResult(null);
    setTryMovePromotionPiece(null);
    setExtraInfoBefore({
      enPassantTarget: null,
      piecesMadeMoves: {
        whiteKing: false,
        blackKing: false,
        whiteKingsideRook: false,
        whiteQueensideRook: false,
        blackKingsideRook: false,
        blackQueensideRook: false
      }
    });
    setExtraInfoAfter({
      enPassantTarget: null,
      piecesMadeMoves: {
        whiteKing: false,
        blackKing: false,
        whiteKingsideRook: false,
        whiteQueensideRook: false,
        blackKingsideRook: false,
        blackQueensideRook: false
      }
    });
  }, []);

  const getPiece = useCallback((boardType, cell) => {
    const board = boardType === 'before' ? boardBefore : boardAfter;
    return board[cell.row - 1][cell.col - 1];
  }, [boardBefore, boardAfter]);

  const placePiece = useCallback((boardType, cell, type, color) => {
    if (boardType === 'before') {
      setBoardBefore(prev => {
        const newBoard = prev.map(row => [...row]);
        newBoard[cell.row - 1][cell.col - 1] = { type, color, position: cell };
        return newBoard;
      });
    } else {
      setBoardAfter(prev => {
        const newBoard = prev.map(row => [...row]);
        newBoard[cell.row - 1][cell.col - 1] = { type, color, position: cell };
        return newBoard;
      });
    }
  }, []);

  const removePiece = useCallback((boardType, cell) => {
    if (boardType === 'before') {
      setBoardBefore(prev => {
        const newBoard = prev.map(row => [...row]);
        newBoard[cell.row - 1][cell.col - 1] = null;
        return newBoard;
      });
    } else {
      setBoardAfter(prev => {
        const newBoard = prev.map(row => [...row]);
        newBoard[cell.row - 1][cell.col - 1] = null;
        return newBoard;
      });
    }
  }, []);

  const getPieces = useCallback((boardType) => {
    const board = boardType === 'before' ? boardBefore : boardAfter;
    const pieces = [];
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 8; col++) {
        const piece = board[row - 1][col - 1];
        if (piece) {
          pieces.push({
            type: piece.type,
            color: piece.color,
            position: { row, col }
          });
        }
      }
    }
    return pieces;
  }, [boardBefore, boardAfter]);

  const copyBoardTo = useCallback((from, to) => {
    if (from === to) return;

    const sourceBoard = from === 'before' ? boardBefore : boardAfter;
    const sourceExtraInfo = from === 'before' ? extraInfoBefore : extraInfoAfter;

    // Deep copy board
    const newBoard = sourceBoard.map(row => 
      row.map(cell => 
        cell ? { ...cell, position: { ...cell.position } } : null
      )
    );

    // Deep copy extraInfo
    const newExtraInfo = {
      enPassantTarget: sourceExtraInfo.enPassantTarget 
        ? { ...sourceExtraInfo.enPassantTarget } 
        : null,
      piecesMadeMoves: { ...sourceExtraInfo.piecesMadeMoves }
    };

    if (to === 'before') {
      setBoardBefore(newBoard);
      setExtraInfoBefore(newExtraInfo);
    } else {
      setBoardAfter(newBoard);
      setExtraInfoAfter(newExtraInfo);
    }
  }, [boardBefore, boardAfter, extraInfoBefore, extraInfoAfter]);

  const loadFromSchema = useCallback((schema) => {
    if (!schema || schema.boardType !== 'tryMove') {
      return;
    }

    resetBoardState();

    // Load boardBefore from root level pieces
    if (Array.isArray(schema.pieces)) {
      const newBoardBefore = Array(8).fill(null).map(() => Array(8).fill(null));
      schema.pieces.forEach(p => {
        if (!p.position) return;
        const row = p.position.row;
        const col = p.position.col;
        if (row < 1 || row > 8 || col < 1 || col > 8) return;
        newBoardBefore[row - 1][col - 1] = {
          type: p.type,
          color: p.color,
          position: { row, col }
        };
      });
      setBoardBefore(newBoardBefore);
    }

    // Load extraInfo from root level
    if (schema.extraInfo) {
      const newExtraInfoBefore = {
        enPassantTarget: schema.extraInfo.enPassantTarget
          ? { ...schema.extraInfo.enPassantTarget }
          : null,
        piecesMadeMoves: {
          whiteKing: false,
          blackKing: false,
          whiteKingsideRook: false,
          whiteQueensideRook: false,
          blackKingsideRook: false,
          blackQueensideRook: false,
          ...(schema.extraInfo.piecesMadeMoves || {})
        }
      };
      setExtraInfoBefore(newExtraInfoBefore);
    }

    // Load boardAfter from root level piecesAfter
    if (Array.isArray(schema.piecesAfter)) {
      const newBoardAfter = Array(8).fill(null).map(() => Array(8).fill(null));
      schema.piecesAfter.forEach(p => {
        if (!p.position) return;
        const row = p.position.row;
        const col = p.position.col;
        if (row < 1 || row > 8 || col < 1 || col > 8) return;
        newBoardAfter[row - 1][col - 1] = {
          type: p.type,
          color: p.color,
          position: { row, col }
        };
      });
      setBoardAfter(newBoardAfter);
    }

    // Load extraInfoAfter from root level
    if (schema.extraInfoAfter) {
      const newExtraInfoAfter = {
        enPassantTarget: schema.extraInfoAfter.enPassantTarget
          ? { ...schema.extraInfoAfter.enPassantTarget }
          : null,
        piecesMadeMoves: {
          whiteKing: false,
          blackKing: false,
          whiteKingsideRook: false,
          whiteQueensideRook: false,
          blackKingsideRook: false,
          blackQueensideRook: false,
          ...(schema.extraInfoAfter.piecesMadeMoves || {})
        }
      };
      setExtraInfoAfter(newExtraInfoAfter);
    }

    // Load shared state
    if (schema.cellFrom) {
      setCellFrom({
        row: schema.cellFrom.row,
        col: schema.cellFrom.col
      });
    }
    if (schema.cellTo) {
      setCellTo({
        row: schema.cellTo.row,
        col: schema.cellTo.col
      });
    }
    if (schema.expectedResult !== undefined) {
      setTryMoveResult(schema.expectedResult === true);
    }
    if (schema.promotionPiece) {
      setTryMovePromotionPiece(schema.promotionPiece);
    }
  }, [resetBoardState]);

  const getCurrentSchema = useCallback(() => {
    const piecesBefore = getPieces('before');

    const schema = {
      boardType: 'tryMove',
      pieces: piecesBefore
    };

    // Always add extraInfo at root with all fields
    schema.extraInfo = {};
    if (extraInfoBefore.enPassantTarget !== null) {
      schema.extraInfo.enPassantTarget = {
        row: extraInfoBefore.enPassantTarget.row,
        col: extraInfoBefore.enPassantTarget.col
      };
    } else {
      schema.extraInfo.enPassantTarget = null;
    }

    // Always include piecesMadeMoves with all standard keys
    const standardKeys = [
      'whiteKing',
      'blackKing',
      'whiteKingsideRook',
      'whiteQueensideRook',
      'blackKingsideRook',
      'blackQueensideRook'
    ];
    schema.extraInfo.piecesMadeMoves = {};
    standardKeys.forEach(key => {
      schema.extraInfo.piecesMadeMoves[key] = extraInfoBefore.piecesMadeMoves?.[key] || false;
    });

    // Only include piecesAfter and extraInfoAfter if result is true (move succeeded)
    if (tryMoveResult === true) {
      const piecesAfter = getPieces('after');
      schema.piecesAfter = piecesAfter;

      // Always add extraInfoAfter with all fields
      schema.extraInfoAfter = {};
      if (extraInfoAfter.enPassantTarget !== null) {
        schema.extraInfoAfter.enPassantTarget = {
          row: extraInfoAfter.enPassantTarget.row,
          col: extraInfoAfter.enPassantTarget.col
        };
      } else {
        schema.extraInfoAfter.enPassantTarget = null;
      }

      // Always include piecesMadeMoves with all standard keys
      const standardKeys = [
        'whiteKing',
        'blackKing',
        'whiteKingsideRook',
        'whiteQueensideRook',
        'blackKingsideRook',
        'blackQueensideRook'
      ];
      schema.extraInfoAfter.piecesMadeMoves = {};
      standardKeys.forEach(key => {
        schema.extraInfoAfter.piecesMadeMoves[key] = extraInfoAfter.piecesMadeMoves?.[key] || false;
      });
    }

    // Add shared state
    if (cellFrom) {
      schema.cellFrom = {
        row: cellFrom.row,
        col: cellFrom.col
      };
    }
    if (cellTo) {
      schema.cellTo = {
        row: cellTo.row,
        col: cellTo.col
      };
    }
    if (tryMoveResult !== null && tryMoveResult !== undefined) {
      schema.expectedResult = tryMoveResult === true;
    }
    if (tryMovePromotionPiece) {
      schema.promotionPiece = tryMovePromotionPiece;
    }

    return schema;
  }, [boardBefore, boardAfter, extraInfoBefore, extraInfoAfter, cellFrom, cellTo, tryMoveResult, tryMovePromotionPiece, getPieces]);

  return {
    boardBefore,
    boardAfter,
    selectedPiece,
    selectedColor,
    mode,
    cellFrom,
    cellTo,
    tryMoveResult,
    tryMovePromotionPiece,
    extraInfoBefore,
    extraInfoAfter,
    setSelectedPiece,
    setSelectedColor,
    setMode,
    setCellFrom,
    setCellTo,
    setTryMoveResult,
    setTryMovePromotionPiece,
    setExtraInfoBefore,
    setExtraInfoAfter,
    resetBoardState,
    getPiece,
    placePiece,
    removePiece,
    getPieces,
    copyBoardTo,
    loadFromSchema,
    getCurrentSchema
  };
}

