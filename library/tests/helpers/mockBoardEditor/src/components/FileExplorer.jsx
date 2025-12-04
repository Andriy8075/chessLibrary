import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

function FileExplorer({ onFileOpen, currentFilePath, onSave, saveMessage }) {
  const [tree, setTree] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState(new Set(['']));
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState(null);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      const response = await fetch('/api/boards/tree');
      if (response.ok) {
        const data = await response.json();
        setTree(data.root);
      }
    } catch (e) {
      console.error('Failed to load tree', e);
    }
  };

  const toggleExpand = (path) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const selectFolder = (path) => {
    setSelectedFolderPath(path);
    setSelectedPath(path);
  };

  const openFile = async (path) => {
    setSelectedPath(path);
    setSelectedFolderPath(null);
    
    try {
      const response = await fetch(`/api/boards/file?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        const text = data.content || '';
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = null;
        }
        onFileOpen(path, parsed);
      } else if (response.status === 404) {
        onFileOpen(path, {});
      }
    } catch (e) {
      console.error('Failed to open file', e);
    }
  };

  const handleNewFolder = async () => {
    const name = window.prompt('Folder name:');
    if (!name) return;

    const parentPath = selectedFolderPath || '';

    try {
      const response = await fetch('/api/boards/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath, name })
      });
      if (response.ok) {
        await loadTree();
      }
    } catch (e) {
      alert('Failed to create folder');
    }
  };

  const handleNewFile = async () => {
    const name = window.prompt('File name:');
    if (!name) return;

    // Add .json extension if not specified (check if it ends with a file extension pattern)
    const hasExtension = /\.\w+$/.test(name);
    const fileName = hasExtension ? name : `${name}.json`;

    const parentPath = selectedFolderPath || '';
    const newPath = parentPath ? `${parentPath}/${fileName}` : fileName;

    try {
      const response = await fetch('/api/boards/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath, name: fileName, content: '' })
      });
      if (response.ok) {
        await loadTree();
        await openFile(newPath);
      }
    } catch (e) {
      alert('Failed to create file');
    }
  };

  const handleEdit = async () => {
    const path = selectedPath || selectedFolderPath;
    if (!path) return;

    const parts = path.split('/');
    const oldName = parts.pop();
    const parentPath = parts.join('/');

    const newName = window.prompt(`Rename "${oldName}" to:`, oldName);
    if (!newName || newName === oldName) return;

    try {
      const response = await fetch('/api/boards/entry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, newName })
      });
      if (response.ok) {
        await loadTree();
      }
    } catch (e) {
      alert('Failed to rename');
    }
  };

  const handleDelete = async () => {
    const path = selectedPath || selectedFolderPath;
    if (!path) return;

    if (!window.confirm(`Delete "${path}"?`)) return;

    try {
      const response = await fetch('/api/boards/entry', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (response.ok) {
        await loadTree();
        setSelectedPath(null);
        setSelectedFolderPath(null);
      }
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const renderTree = (node) => {
    if (!node) return null;

    // Use the path from the API response, which is already relative to boardsRoot
    const nodePath = node.path || '';
    const isExpanded = expandedPaths.has(nodePath);
    const isSelected = selectedPath === nodePath || selectedFolderPath === nodePath;

    if (node.kind === 'directory') {
      return (
        <div key={nodePath} className="tree-item">
          <div
            className={`tree-folder ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              toggleExpand(nodePath);
              selectFolder(nodePath);
            }}
          >
            <span className={`folder-icon ${isExpanded ? 'expanded' : 'collapsed'}`}>▶</span>
            <span>{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="tree-children">
              {node.children.map(child => renderTree(child))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={nodePath}
          className={`tree-file ${isSelected ? 'selected' : ''}`}
          onClick={() => openFile(nodePath)}
        >
          {node.name}
        </div>
      );
    }
  };

  return (
    <div className="file-explorer-panel">
      <h3>Boards File Explorer</h3>
      <div className="file-explorer-controls">
        <button type="button" onClick={handleNewFolder}>New Folder</button>
        <button type="button" onClick={handleNewFile}>New File</button>
        <button type="button" onClick={handleEdit} disabled={!selectedPath && !selectedFolderPath}>
          Edit
        </button>
        <button type="button" onClick={handleDelete} disabled={!selectedPath && !selectedFolderPath}>
          Delete
        </button>
      </div>
      <div className="file-tree">
        {tree && renderTree(tree)}
      </div>
      <div className="file-editor-panel">
        <div className="current-file-path">{currentFilePath || 'No file opened'}</div>
        <div className="file-editor-controls">
          <button type="button" onClick={onSave} disabled={!currentFilePath}>
            Save File
          </button>
          {saveMessage && (
            <div className={`save-message ${saveMessage.type}`}>
              {saveMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileExplorer;

