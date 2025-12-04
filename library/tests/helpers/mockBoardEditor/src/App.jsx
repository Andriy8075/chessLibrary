import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import FileExplorer from './components/FileExplorer';
import BoardTypeSelector from './components/BoardTypeSelector';
import BoardTypeSwitcher from './components/BoardTypeSwitcher';
import FindAllPossibleMoves from './routes/FindAllPossibleMoves';
import EnPassant from './routes/EnPassant';
import SimpleBoard from './routes/SimpleBoard';
import EnoughPieces from './routes/EnoughPieces';
import IsSquareAttacked from './routes/IsSquareAttacked';
import IsKingInCheck from './routes/IsKingInCheck';
import WouldMoveCauseCheck from './routes/WouldMoveCauseCheck';
import TryMove from './routes/TryMove';
import HasLegalMoves from './routes/HasLegalMoves';
import CheckForCheckmateOrStalemateAfterMove from './routes/CheckForCheckmateOrStalemateAfterMove';
import { useBoardEditor } from './hooks/useBoardEditor';
import './App.css';

function App() {
  const navigate = useNavigate();
  const editor = useBoardEditor();
  const [awaitingBoardType, setAwaitingBoardType] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [currentFileIsBoardJson, setCurrentFileIsBoardJson] = useState(false);

  const handleFileOpen = (filePath, schema) => {
    setCurrentFilePath(filePath);
    
    if (schema && schema.boardType && Array.isArray(schema.pieces)) {
      setCurrentFileIsBoardJson(true);
      editor.setCurrentBoardType(schema.boardType);
      editor.loadFromSchema(schema);
      navigate(`/${schema.boardType}`);
      setAwaitingBoardType(false);
    } else if (!schema || Object.keys(schema).length === 0) {
      setCurrentFileIsBoardJson(true);
      editor.resetBoardState();
      setAwaitingBoardType(true);
      navigate('/');
    } else {
      setCurrentFileIsBoardJson(false);
      setAwaitingBoardType(false);
    }
  };

  const handleBoardTypeSelected = (boardType) => {
    editor.setCurrentBoardType(boardType);
    setAwaitingBoardType(false);
    navigate(`/${boardType}`);
  };

  const handleBoardTypeSwitch = (boardType) => {
    // Preserve pieces when switching board types
    editor.switchBoardType(boardType);
    setAwaitingBoardType(false);
    navigate(`/${boardType}`);
  };

  const handleSaveFile = async () => {
    if (!currentFilePath || !currentFileIsBoardJson) return;
    
    const schema = editor.getCurrentSchema();
    const response = await fetch('/api/boards/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentFilePath,
        content: JSON.stringify(schema, null, 4)
      })
    });

    if (!response.ok) {
      alert('Failed to save file');
    }
  };

  return (
    <div className="app-container">
      <h1>Mock Board Editor</h1>
      
      <div className="app-layout">
        <FileExplorer
          onFileOpen={handleFileOpen}
          currentFilePath={currentFilePath}
          onSave={handleSaveFile}
        />
        
        <div className="editor-panel">
          {awaitingBoardType ? (
            <BoardTypeSelector onSelect={handleBoardTypeSelected} />
          ) : (
            <>
              <BoardTypeSwitcher
                currentBoardType={editor.currentBoardType}
                onBoardTypeChange={handleBoardTypeSwitch}
              />
              <Routes>
                <Route path="/" element={<Navigate to="/findAllPossibleMoves" replace />} />
                <Route path="/findAllPossibleMoves" element={<FindAllPossibleMoves editor={editor} />} />
                <Route path="/enPassant" element={<EnPassant editor={editor} />} />
                <Route path="/simpleBoard" element={<SimpleBoard editor={editor} />} />
                <Route path="/enoughPieces" element={<EnoughPieces editor={editor} />} />
                <Route path="/isSquareAttacked" element={<IsSquareAttacked editor={editor} />} />
                <Route path="/isKingInCheck" element={<IsKingInCheck editor={editor} />} />
                <Route path="/wouldMoveCauseCheck" element={<WouldMoveCauseCheck editor={editor} />} />
                <Route path="/tryMove" element={<TryMove editor={editor} />} />
                <Route path="/hasLegalMoves" element={<HasLegalMoves editor={editor} />} />
                <Route path="/checkForCheckmateOrStalemateAfterMove" element={<CheckForCheckmateOrStalemateAfterMove editor={editor} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

