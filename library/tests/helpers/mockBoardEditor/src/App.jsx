import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import FileExplorer from './components/FileExplorer';
import BoardTypeSelector from './components/BoardTypeSelector';
import BoardTypeSwitcher from './components/BoardTypeSwitcher';
import FindAllPossibleMoves from './routes/FindAllPossibleMoves';
import EnPassant from './routes/EnPassant';
import SimpleBoard from './routes/SimpleBoard';
import IsInsufficientMaterial from './routes/IsInsufficientMaterial';
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
  const tryMoveRef = useRef(null);
  const [awaitingBoardType, setAwaitingBoardType] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [currentFileIsBoardJson, setCurrentFileIsBoardJson] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [tryMoveSchema, setTryMoveSchema] = useState(null);

  const handleFileOpen = (filePath, schema) => {
    setCurrentFilePath(filePath);
    setSaveMessage(null); // Clear save message when opening a new file
    
    if (schema && schema.boardType) {
      if (schema.boardType === 'tryMove') {
        // Handle tryMove with dual board structure
        setCurrentFileIsBoardJson(true);
        editor.setCurrentBoardType('tryMove');
        setTryMoveSchema(schema);
        navigate('/tryMove');
        setAwaitingBoardType(false);
      } else if (Array.isArray(schema.pieces)) {
        // Handle other board types with single board structure
        setCurrentFileIsBoardJson(true);
        editor.setCurrentBoardType(schema.boardType);
        editor.loadFromSchema(schema);
        navigate(`/${schema.boardType}`);
        setAwaitingBoardType(false);
      } else {
        setCurrentFileIsBoardJson(false);
        setAwaitingBoardType(false);
      }
    } else if (!schema || Object.keys(schema).length === 0) {
      setCurrentFileIsBoardJson(true);
      editor.resetBoardState();
      setTryMoveSchema(null);
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
    
    let schema;
    if (editor.currentBoardType === 'tryMove' && tryMoveRef.current) {
      // Get schema from TryMove component
      schema = tryMoveRef.current.getCurrentSchema();
    } else {
      // Get schema from regular editor
      schema = editor.getCurrentSchema();
    }
    
    const response = await fetch('/api/boards/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentFilePath,
        content: JSON.stringify(schema, null, 4)
      })
    });

    if (!response.ok) {
      setSaveMessage({ type: 'error', text: 'Failed to save file' });
    } else {
      setSaveMessage({ type: 'success', text: 'File saved successfully' });
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };

  // Redirect to root if no file is opened and user tries to access a specific route
  const location = useLocation();
  useEffect(() => {
    // Main routes that are allowed without a file being opened
    const mainRoutes = ['/', '/findAllPossibleMoves'];
    
    // If no board file is opened and user is on a non-main route, redirect to root
    if (!currentFileIsBoardJson && !mainRoutes.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, currentFileIsBoardJson, navigate]);

  return (
    <div className="app-container">
      <h1>Mock Board Editor</h1>
      
      <div className="app-layout">
        <FileExplorer
          onFileOpen={handleFileOpen}
          currentFilePath={currentFilePath}
          onSave={handleSaveFile}
          saveMessage={saveMessage}
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
                <Route path="/isInsufficientMaterial" element={<IsInsufficientMaterial editor={editor} />} />
                <Route path="/isSquareAttacked" element={<IsSquareAttacked editor={editor} />} />
                <Route path="/isKingInCheck" element={<IsKingInCheck editor={editor} />} />
                <Route path="/wouldMoveCauseCheck" element={<WouldMoveCauseCheck editor={editor} />} />
                <Route path="/tryMove" element={<TryMove ref={tryMoveRef} initialSchema={tryMoveSchema} />} />
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

