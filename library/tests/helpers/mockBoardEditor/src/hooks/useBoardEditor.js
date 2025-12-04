import { useState, useCallback } from 'react';

export function useBoardEditor() {
  const [board, setBoard] = useState(() => 
    Array(8).fill(null).map(() => Array(8).fill(null))
  );
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [mode, setMode] = useState('place');
  const [mainPiece, setMainPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [targetSquare, setTargetSquare] = useState(null);
  const [expectedResult, setExpectedResult] = useState(null);
  const [attackingColor, setAttackingColor] = useState(null);
  const [kingColor, setKingColor] = useState(null);
  const [kingCheckResult, setKingCheckResult] = useState(null);
  const [cellFrom, setCellFrom] = useState(null);
  const [cellTo, setCellTo] = useState(null);
  const [wouldMoveCauseCheckResult, setWouldMoveCauseCheckResult] = useState(null);
  const [tryMoveResult, setTryMoveResult] = useState(null);
  const [hasLegalMovesColor, setHasLegalMovesColor] = useState(null);
  const [hasLegalMovesResult, setHasLegalMovesResult] = useState(null);
  const [checkForCheckmateOrStalemateAfterMoveResult, setCheckForCheckmateOrStalemateAfterMoveResult] = useState(null);
  const [enoughPiecesResult, setEnoughPiecesResult] = useState(null);
  const [extraInfo, setExtraInfo] = useState({
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
  const [currentBoardType, setCurrentBoardType] = useState('findAllPossibleMoves');

  const resetBoardState = useCallback(() => {
    setBoard(Array(8).fill(null).map(() => Array(8).fill(null)));
    setMainPiece(null);
    setValidMoves([]);
    setTargetSquare(null);
    setExpectedResult(null);
    setAttackingColor(null);
    setKingColor(null);
    setKingCheckResult(null);
    setCellFrom(null);
    setCellTo(null);
    setWouldMoveCauseCheckResult(null);
    setTryMoveResult(null);
    setHasLegalMovesColor(null);
    setHasLegalMovesResult(null);
    setCheckForCheckmateOrStalemateAfterMoveResult(null);
    setEnoughPiecesResult(null);
    setExtraInfo({
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

  const switchBoardType = useCallback((newBoardType) => {
    // Preserve pieces when switching board types - only reset board-type-specific state
    setMainPiece(null);
    setValidMoves([]);
    setTargetSquare(null);
    setExpectedResult(null);
    setAttackingColor(null);
    setKingColor(null);
    setKingCheckResult(null);
    setCellFrom(null);
    setCellTo(null);
    setWouldMoveCauseCheckResult(null);
    setTryMoveResult(null);
    setHasLegalMovesColor(null);
    setHasLegalMovesResult(null);
    setCheckForCheckmateOrStalemateAfterMoveResult(null);
    setEnoughPiecesResult(null);
    setExtraInfo({
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
    setCurrentBoardType(newBoardType);
  }, []);

  const getPiece = useCallback((cell) => {
    return board[cell.row - 1][cell.col - 1];
  }, [board]);

  const placePiece = useCallback((cell, type, color) => {
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[cell.row - 1][cell.col - 1] = { type, color, position: cell };
      return newBoard;
    });
  }, []);

  const removePiece = useCallback((cell) => {
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[cell.row - 1][cell.col - 1] = null;
      return newBoard;
    });
    
    if (mainPiece && mainPiece.position.row === cell.row && mainPiece.position.col === cell.col) {
      setMainPiece(null);
      setValidMoves([]);
    }
    if (targetSquare && targetSquare.row === cell.row && targetSquare.col === cell.col) {
      setTargetSquare(null);
    }
    if (cellFrom && cellFrom.row === cell.row && cellFrom.col === cell.col) {
      setCellFrom(null);
    }
    if (cellTo && cellTo.row === cell.row && cellTo.col === cell.col) {
      setCellTo(null);
    }
  }, [mainPiece, targetSquare, cellFrom, cellTo]);

  const toggleValidMove = useCallback((cell) => {
    setValidMoves(prev => {
      const index = prev.findIndex(m => m.row === cell.row && m.col === cell.col);
      if (index >= 0) {
        return prev.filter((_, i) => i !== index);
      } else {
        return [...prev, { row: cell.row, col: cell.col }];
      }
    });
  }, []);

  const getPieces = useCallback(() => {
    const pieces = [];
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 8; col++) {
        const piece = getPiece({ row, col });
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
  }, [board, getPiece]);

  const loadFromSchema = useCallback((schema) => {
    if (!schema || !Array.isArray(schema.pieces)) {
      return;
    }

    resetBoardState();

    setCurrentBoardType(schema.boardType || 'findAllPossibleMoves');

    // Place pieces
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    (schema.pieces || []).forEach(p => {
      if (!p.position) return;
      const row = p.position.row;
      const col = p.position.col;
      if (row < 1 || row > 8 || col < 1 || col > 8) return;
      newBoard[row - 1][col - 1] = {
        type: p.type,
        color: p.color,
        position: { row, col }
      };
    });
    setBoard(newBoard);

    // Load board type specific data
    if (schema.boardType === 'isSquareAttacked') {
      if (schema.targetSquare) {
        setTargetSquare({
          row: schema.targetSquare.row,
          col: schema.targetSquare.col
        });
      }
      if (schema.expectedResult !== undefined) {
        setExpectedResult(schema.expectedResult);
      }
      if (schema.attackingColor) {
        setAttackingColor(schema.attackingColor);
      }
    } else if (schema.boardType === 'isKingInCheck') {
      if (schema.color) {
        setKingColor(schema.color);
      }
      if (schema.expectedResult !== undefined) {
        setKingCheckResult(schema.expectedResult === true);
      }
    } else if (schema.boardType === 'wouldMoveCauseCheck') {
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
        setWouldMoveCauseCheckResult(schema.expectedResult === true);
      }
    } else if (schema.boardType === 'tryMove') {
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
    } else if (schema.boardType === 'hasLegalMoves') {
      if (schema.color) {
        setHasLegalMovesColor(schema.color);
      }
      if (schema.expectedResult !== undefined) {
        setHasLegalMovesResult(schema.expectedResult === true);
      }
    } else if (schema.boardType === 'checkForCheckmateOrStalemateAfterMove') {
      if (schema.cellTo) {
        setCellTo({
          row: schema.cellTo.row,
          col: schema.cellTo.col
        });
      }
      if (schema.expectedResult !== undefined) {
        // expectedResult can be null, 'checkmate', or 'stalemate'
        setCheckForCheckmateOrStalemateAfterMoveResult(schema.expectedResult || null);
      }
    } else if (schema.boardType === 'enoughPieces') {
      if (schema.expectedResult !== undefined) {
        setEnoughPiecesResult(schema.expectedResult === true);
      }
    } else if (schema.boardType !== 'simpleBoard') {
      // For findAllPossibleMoves and enPassant
      if (schema.mainPiecePosition) {
        const cell = {
          row: schema.mainPiecePosition.row,
          col: schema.mainPiecePosition.col
        };
        const piece = newBoard[cell.row - 1][cell.col - 1];
        if (piece) {
          setMainPiece({ ...piece, position: cell });
        }
      }
      if (Array.isArray(schema.moves)) {
        setValidMoves(schema.moves.map(m => ({
          row: m.row,
          col: m.col
        })));
      }
    }

    // Extra info
    if (schema.extraInfo) {
      const newExtraInfo = { ...extraInfo };
      
      if (schema.extraInfo.enPassantTarget) {
        newExtraInfo.enPassantTarget = {
          row: schema.extraInfo.enPassantTarget.row,
          col: schema.extraInfo.enPassantTarget.col
        };
      } else {
        newExtraInfo.enPassantTarget = null;
      }
      
      if (schema.extraInfo.piecesMadeMoves) {
        newExtraInfo.piecesMadeMoves = {
          ...newExtraInfo.piecesMadeMoves,
          ...Object.fromEntries(
            Object.keys(newExtraInfo.piecesMadeMoves).map(key => [
              key,
              !!schema.extraInfo.piecesMadeMoves[key]
            ])
          )
        };
      }
      
      setExtraInfo(newExtraInfo);
    }
  }, [resetBoardState]);

  const getCurrentSchema = useCallback((boardTypeOverride) => {
    const boardType = boardTypeOverride || currentBoardType;
    const pieces = getPieces();

    const schema = {
      boardType,
      pieces
    };

    if (boardType === 'isSquareAttacked') {
      if (targetSquare) {
        schema.targetSquare = {
          row: targetSquare.row,
          col: targetSquare.col
        };
      }
      if (expectedResult !== null && expectedResult !== undefined) {
        schema.expectedResult = expectedResult === true;
      }
      if (attackingColor) {
        schema.attackingColor = attackingColor;
      }
    } else if (boardType === 'isKingInCheck') {
      if (kingColor) {
        schema.color = kingColor;
      }
      if (kingCheckResult !== null && kingCheckResult !== undefined) {
        schema.expectedResult = kingCheckResult === true;
      }
    } else if (boardType === 'wouldMoveCauseCheck') {
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
      if (wouldMoveCauseCheckResult !== null && wouldMoveCauseCheckResult !== undefined) {
        schema.expectedResult = wouldMoveCauseCheckResult === true;
      }
    } else if (boardType === 'tryMove') {
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
    } else if (boardType === 'hasLegalMoves') {
      if (hasLegalMovesColor) {
        schema.color = hasLegalMovesColor;
      }
      if (hasLegalMovesResult !== null && hasLegalMovesResult !== undefined) {
        schema.expectedResult = hasLegalMovesResult === true;
      }
    } else if (boardType === 'checkForCheckmateOrStalemateAfterMove') {
      if (cellTo) {
        schema.cellTo = {
          row: cellTo.row,
          col: cellTo.col
        };
      }
      if (checkForCheckmateOrStalemateAfterMoveResult !== null && checkForCheckmateOrStalemateAfterMoveResult !== undefined) {
        // expectedResult can be null, 'checkmate', or 'stalemate'
        schema.expectedResult = checkForCheckmateOrStalemateAfterMoveResult;
      }
    } else if (boardType === 'enoughPieces') {
      if (enoughPiecesResult !== null && enoughPiecesResult !== undefined) {
        schema.expectedResult = enoughPiecesResult === true;
      }
    } else if (boardType !== 'simpleBoard') {
      if (mainPiece && mainPiece.position) {
        schema.mainPiecePosition = {
          row: mainPiece.position.row,
          col: mainPiece.position.col
        };
      }
      if (validMoves && validMoves.length > 0) {
        schema.moves = validMoves.map(m => ({
          row: m.row,
          col: m.col
        }));
      }
    }

    const hasEnPassant = extraInfo.enPassantTarget !== null;
    const hasPiecesMoved = Object.values(extraInfo.piecesMadeMoves || {}).some(v => v === true);

    if (hasEnPassant || hasPiecesMoved) {
      schema.extraInfo = {};
      if (hasEnPassant) {
        schema.extraInfo.enPassantTarget = {
          row: extraInfo.enPassantTarget.row,
          col: extraInfo.enPassantTarget.col
        };
      }
      if (hasPiecesMoved) {
        schema.extraInfo.piecesMadeMoves = {};
        Object.keys(extraInfo.piecesMadeMoves).forEach(key => {
          if (extraInfo.piecesMadeMoves[key]) {
            schema.extraInfo.piecesMadeMoves[key] = true;
          }
        });
      }
    }

    return schema;
  }, [currentBoardType, board, getPieces, targetSquare, expectedResult, attackingColor, kingColor, kingCheckResult, cellFrom, cellTo, wouldMoveCauseCheckResult, tryMoveResult, hasLegalMovesColor, hasLegalMovesResult, checkForCheckmateOrStalemateAfterMoveResult, enoughPiecesResult, mainPiece, validMoves, extraInfo]);

  return {
    board,
    selectedPiece,
    selectedColor,
    mode,
    mainPiece,
    validMoves,
    targetSquare,
    expectedResult,
    attackingColor,
    kingColor,
    kingCheckResult,
    cellFrom,
    cellTo,
    wouldMoveCauseCheckResult,
    extraInfo,
    currentBoardType,
    setSelectedPiece,
    setSelectedColor,
    setMode,
    setMainPiece,
    setTargetSquare,
    setExpectedResult,
    setAttackingColor,
    setKingColor,
    setKingCheckResult,
    setCellFrom,
    setCellTo,
    setWouldMoveCauseCheckResult,
    tryMoveResult,
    setTryMoveResult,
    hasLegalMovesColor,
    setHasLegalMovesColor,
    hasLegalMovesResult,
    setHasLegalMovesResult,
    checkForCheckmateOrStalemateAfterMoveResult,
    setCheckForCheckmateOrStalemateAfterMoveResult,
    enoughPiecesResult,
    setEnoughPiecesResult,
    setExtraInfo,
    setCurrentBoardType,
    resetBoardState,
    getPiece,
    placePiece,
    removePiece,
    toggleValidMove,
    getPieces,
    loadFromSchema,
    getCurrentSchema,
    switchBoardType
  };
}

