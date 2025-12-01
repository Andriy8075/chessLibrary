import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

function FileExplorer({ onFileOpen, currentFilePath, onSave }) {
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
        setTree(data);
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
    const newPath = parentPath ? `${parentPath}/${name}` : name;

    try {
      const response = await fetch('/api/boards/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath })
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

    const parentPath = selectedFolderPath || '';
    const newPath = parentPath ? `${parentPath}/${name}` : name;

    try {
      const response = await fetch('/api/boards/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath, content: '' })
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

  const renderTree = (node, basePath = '') => {
    if (!node) return null;

    const path = basePath ? `${basePath}/${node.name}` : node.name;
    const isExpanded = expandedPaths.has(path);
    const isSelected = selectedPath === path || selectedFolderPath === path;

    if (node.kind === 'directory') {
      return (
        <div key={path} className="tree-item">
          <div
            className={`tree-folder ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              toggleExpand(path);
              selectFolder(path);
            }}
          >
            <span className={`folder-icon ${isExpanded ? 'expanded' : 'collapsed'}`}>▶</span>
            <span>{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="tree-children">
              {node.children.map(child => renderTree(child, path))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={path}
          className={`tree-file ${isSelected ? 'selected' : ''}`}
          onClick={() => openFile(path)}
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
        </div>
      </div>
    </div>
  );
}

export default FileExplorer;

