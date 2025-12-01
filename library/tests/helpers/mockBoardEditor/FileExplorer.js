export class FileExplorer {
    constructor(editor) {
        this.editor = editor;
        this.currentFilePath = '';
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;
        // Start with root (boards folder) expanded by default (path === '')
        this.expandedPaths = new Set(['']);

        this.init();
    }

    async init() {
        this.newFolderBtn = document.getElementById('newFolderBtn');
        this.newFileBtn = document.getElementById('newFileBtn');
        this.editBtn = document.getElementById('editBtn');
        this.deleteFolderBtn = document.getElementById('deleteFolderBtn');
        this.fileTreeEl = document.getElementById('fileTree');
        this.currentFilePathEl = document.getElementById('currentFilePath');
        this.saveFileBtn = document.getElementById('saveFileBtn');
        this.revertFileBtn = document.getElementById('revertFileBtn');
        this.fsSupportWarning = document.getElementById('fsSupportWarning');

        // We always use server-side API; hide any FS warning.
        if (this.fsSupportWarning) this.fsSupportWarning.hidden = true;

        this.newFolderBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleNewFolder();
        });
        this.newFileBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleNewFile();
        });
        this.editBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleEditSelected();
        });
        this.deleteFolderBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleDeleteSelected();
        });
        this.saveFileBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSaveFile();
        });
        this.revertFileBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleRevertFile();
        });

        // Initial load
        await this.loadTree();
        this.newFolderBtn.disabled = false;
        this.newFileBtn.disabled = false;
        if (this.editBtn) this.editBtn.disabled = true;
        if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = true;
    }

    async loadTree() {
        if (!this.fileTreeEl) return;
        try {
            const res = await fetch('/api/boards/tree');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.treeRoot = data.root;
            this.renderTree();
        } catch (e) {
            console.error('Failed to load boards tree', e);
        }
    }

    renderTree() {
        if (!this.fileTreeEl || !this.treeRoot) return;

        this.fileTreeEl.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'file-tree-root';

        const rootPath = this.treeRoot.path || '';
        const isExpanded = this.expandedPaths.has(rootPath);

        const rootLi = document.createElement('li');
        rootLi.className = 'file-item folder-item ' + (isExpanded ? 'expanded' : 'collapsed');
        rootLi.textContent = this.treeRoot.name;
        rootLi.dataset.path = rootPath;

        const childUl = document.createElement('ul');
        childUl.style.display = isExpanded ? 'block' : 'none';

        this.addDirectoryEntries(this.treeRoot, childUl);
        rootLi.appendChild(childUl);

        rootLi.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectFolder(rootPath, rootLi);

            const nowExpanded = rootLi.classList.toggle('expanded');
            if (nowExpanded) {
                rootLi.classList.remove('collapsed');
                childUl.style.display = 'block';
                this.expandedPaths.add(rootPath);
            } else {
                rootLi.classList.add('collapsed');
                childUl.style.display = 'none';
                this.expandedPaths.delete(rootPath);
            }
        });

        ul.appendChild(rootLi);

        this.fileTreeEl.appendChild(ul);
    }

    addDirectoryEntries(node, parentEl) {
        if (!node.children) return;

        const entries = [...node.children].sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        for (const entry of entries) {
            const li = document.createElement('li');
            const relativePath = entry.path;

            if (entry.kind === 'directory') {
                const isExpanded = this.expandedPaths.has(relativePath);

                li.className = 'file-item folder-item ' + (isExpanded ? 'expanded' : 'collapsed');
                li.textContent = entry.name;
                li.dataset.path = relativePath;

                const childUl = document.createElement('ul');
                childUl.style.display = isExpanded ? 'block' : 'none';

                this.addDirectoryEntries(entry, childUl);
                li.appendChild(childUl);

                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectFolder(relativePath, li);

                    const nowExpanded = li.classList.toggle('expanded');
                    if (nowExpanded) {
                        li.classList.remove('collapsed');
                        childUl.style.display = 'block';
                        this.expandedPaths.add(relativePath);
                    } else {
                        li.classList.add('collapsed');
                        childUl.style.display = 'none';
                        this.expandedPaths.delete(relativePath);
                    }
                });
            } else {
                li.className = 'file-item file-leaf';
                li.textContent = entry.name;
                li.dataset.path = relativePath;
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openFile(relativePath, li);
                });
            }

            parentEl.appendChild(li);
        }
    }

    clearSelection() {
        if (!this.fileTreeEl) return;
        this.fileTreeEl.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }

    // Select a file or folder by path after tree is rendered
    selectItemByPath(targetPath) {
        if (!targetPath) return;

        // Expand all parent folders to make the item visible
        const parts = targetPath.split('/');
        for (let i = 0; i < parts.length - 1; i++) {
            const parentPath = parts.slice(0, i + 1).join('/');
            this.expandedPaths.add(parentPath);
        }

        // Re-render to show expanded folders
        this.renderTree();

        // Use a small delay to ensure DOM is updated, then find and select
        setTimeout(() => {
            this.findAndSelectItem(targetPath);
        }, 50);
    }

    findAndSelectItem(targetPath) {
        if (!this.treeRoot) return;

        // Find the item in the tree data structure to determine if it's a folder or file
        const findInTree = (node, pathParts, currentPath) => {
            if (!node || !node.children) return null;

            for (const child of node.children) {
                const childPath = currentPath ? `${currentPath}/${child.name}` : child.name;

                if (childPath === targetPath) {
                    return { item: child, path: childPath };
                }

                if (child.kind === 'directory' && pathParts.length > 0 && child.name === pathParts[0]) {
                    const result = findInTree(child, pathParts.slice(1), childPath);
                    if (result) return result;
                }
            }
            return null;
        };

        const pathParts = targetPath.split('/');
        const found = findInTree(this.treeRoot, pathParts, '');

        // Now find the DOM element using the data-path attribute
        const item = this.fileTreeEl.querySelector(`[data-path="${targetPath}"]`);

        if (item && found) {
            // Select the item
            if (found.item.kind === 'directory') {
                this.selectFolder(targetPath, item);
            } else {
                this.openFile(targetPath, item);
            }
            // Scroll into view
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    selectFolder(path, liEl) {
        this.clearSelection();
        liEl.classList.add('selected');
        this.selectedFolderPath = path;
        // Clear any current file selection
        this.currentFilePath = '';
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;
        if (this.editBtn) {
            // Root cannot be edited, but a valid folder can
            this.editBtn.disabled = !path;
        }
        if (this.deleteFolderBtn) {
            // Root cannot be deleted, but a valid folder can
            this.deleteFolderBtn.disabled = !path;
        }
    }

    async openFile(path, liEl) {
        this.clearSelection();
        liEl.classList.add('selected');

        // Clear selected folder, this is now a file selection
        this.selectedFolderPath = null;

        this.currentFilePath = path;
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;

        let text = '';
        try {
            const res = await fetch(`/api/boards/file?path=${encodeURIComponent(path)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            text = data.content || '';
        } catch (e) {
            console.error('Failed to load file', e);
            return;
        }

        const trimmed = text.trim();

        // If file is empty, treat it as a new board file with no type selected yet.
        if (!trimmed) {
            if (this.editor && typeof this.editor.beginNewBoardWithoutType === 'function') {
                this.editor.beginNewBoardWithoutType();
            }

            this.currentFileIsBoardJson = true;
            this.currentBoardType = null;

            if (this.currentFilePathEl) {
                this.currentFilePathEl.textContent = `${path} (new board file - choose type)`;
            }

            if (this.saveFileBtn) this.saveFileBtn.disabled = false;
            if (this.revertFileBtn) this.revertFileBtn.disabled = false;
            if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = false;
            return;
        }

        // Try to interpret as a mock board JSON and load into editor.
        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            parsed = null;
        }

        if (parsed && parsed.boardType && Array.isArray(parsed.pieces) && this.editor && typeof this.editor.loadFromSchema === 'function') {
            // Load into the board editor
            this.editor.loadFromSchema(parsed);

            this.currentFileIsBoardJson = true;
            this.currentBoardType = parsed.boardType;

            // Show path
            this.currentFilePathEl.textContent = `${path} (board file)`;

            // Enable save/revert buttons
            this.saveFileBtn.disabled = false;
            this.revertFileBtn.disabled = false;
        } else {
            // Not a valid board JSON file
            this.currentFilePathEl.textContent = `${path} (not a board file)`;
            this.saveFileBtn.disabled = true;
            this.revertFileBtn.disabled = true;
        }

        if (this.editBtn) {
            // A file is selected, allow edit
            this.editBtn.disabled = false;
        }
        if (this.deleteFolderBtn) {
            // A file is selected, allow delete
            this.deleteFolderBtn.disabled = false;
        }
    }

    getTargetDirectoryPathForNewItem() {
        if (!this.selectedFolderPath) {
            return '';
        }
        return this.selectedFolderPath;
    }

    async handleNewFolder() {
        const name = window.prompt('New folder name:');
        if (!name) return;

        const parentPath = this.getTargetDirectoryPathForNewItem();

        try {
            await fetch('/api/boards/folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentPath, name })
            });
            await this.loadTree();
        } catch (e) {
            console.error('Failed to create folder', e);
        }
    }

    async handleNewFile() {
        const name = window.prompt('New file name (e.g., myTestBoard.json):');
        if (!name) return;

        const parentPath = this.getTargetDirectoryPathForNewItem();

        try {
            await fetch('/api/boards/file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parentPath, name, content: '' })
            });
            await this.loadTree();
        } catch (e) {
            console.error('Failed to create file', e);
        }
    }

    async handleEditSelected() {
        // Prefer editing a selected file if present
        if (this.currentFilePath) {
            const filePath = this.currentFilePath;
            const parts = filePath.split('/');
            const oldName = parts.pop();
            const parentPath = parts.join('/');

            const newName = window.prompt(`Rename file "${oldName}" to:`, oldName);
            if (!newName || newName === oldName) return;

            try {
                const response = await fetch('/api/boards/entry', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: filePath, newName })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                const result = await response.json();
                const newPath = result.newPath || (parentPath ? `${parentPath}/${newName}` : newName);

                // Update current file path if rename was successful
                this.currentFilePath = newPath;
                
                // If this is a board file that's currently loaded, reload it from the new path
                if (this.currentFileIsBoardJson && this.editor) {
                    try {
                        const fileRes = await fetch(`/api/boards/file?path=${encodeURIComponent(newPath)}`);
                        if (fileRes.ok) {
                            const fileData = await fileRes.json();
                            const text = fileData.content || '';
                            const parsed = JSON.parse(text);
                            if (parsed && parsed.boardType && Array.isArray(parsed.pieces) && 
                                typeof this.editor.loadFromSchema === 'function') {
                                this.editor.loadFromSchema(parsed);
                            }
                        }
                    } catch (e) {
                        console.error('Failed to reload renamed file', e);
                    }
                }

                if (this.currentFilePathEl) {
                    const suffix = this.currentFileIsBoardJson ? ' (board file)' : '';
                    this.currentFilePathEl.textContent = `${newPath}${suffix}`;
                }

                await this.loadTree();
                // Reselect the renamed file
                this.selectItemByPath(newPath);
            } catch (e) {
                console.error('Failed to rename file', e);
                alert('Failed to rename file: ' + (e.message || 'Unknown error'));
            }
            return;
        }

        // Otherwise, edit selected folder (if not root)
        if (!this.selectedFolderPath) return;

        const folderPath = this.selectedFolderPath;
        if (!folderPath) return;

        const parts = folderPath.split('/');
        const oldName = parts.pop();
        const parentPath = parts.join('/');

        const newName = window.prompt(`Rename folder "${oldName}" to:`, oldName);
        if (!newName || newName === oldName) return;

        try {
            const response = await fetch('/api/boards/entry', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: folderPath, newName })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            const newPath = result.newPath || (parentPath ? `${parentPath}/${newName}` : newName);

            // Update selected folder path if rename was successful
            this.selectedFolderPath = newPath;

            await this.loadTree();
            // Reselect the renamed folder
            this.selectItemByPath(newPath);
        } catch (e) {
            console.error('Failed to rename folder', e);
            alert('Failed to rename folder: ' + (e.message || 'Unknown error'));
        }
    }

    async handleDeleteSelected() {
        // Prefer deleting a selected file if present
        if (this.currentFilePath) {
            const filePath = this.currentFilePath;
            const parts = filePath.split('/');
            const name = parts.pop();
            const parentPath = parts.join('/');

            const confirmDelete = window.confirm(`Delete file "${filePath}"?`);
            if (!confirmDelete) return;

            try {
                await fetch('/api/boards/entry', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: filePath })
                });
            } catch (e) {
                console.error('Failed to delete file', e);
                return;
            }

            // Clear current file selection
            this.currentFilePath = '';
            this.currentFileIsBoardJson = false;
            this.currentBoardType = null;
            if (this.currentFilePathEl) {
                this.currentFilePathEl.textContent = 'No file opened';
            }
            if (this.saveFileBtn) this.saveFileBtn.disabled = true;
            if (this.revertFileBtn) this.revertFileBtn.disabled = true;
            if (this.editBtn) this.editBtn.disabled = true;
            if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = true;

            await this.loadTree();
            return;
        }

        // Otherwise, delete selected folder (if not root)
        if (!this.selectedFolderPath) return;

        const folderPath = this.selectedFolderPath;
        if (!folderPath) return;

        const confirmDelete = window.confirm(`Delete folder "${folderPath}" and all its contents?`);
        if (!confirmDelete) return;

        const parts = folderPath.split('/');
        const name = parts.pop();
        const parentPath = parts.join('/');

        try {
            await fetch('/api/boards/entry', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: folderPath })
            });
        } catch (e) {
            console.error('Failed to delete folder', e);
            return;
        }

        this.selectedFolderPath = null;
        if (this.editBtn) this.editBtn.disabled = true;
        if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = true;
        await this.loadTree();
    }

    async handleSaveFile() {
        if (!this.currentFilePath || !this.currentFileIsBoardJson) return;

        if (this.editor && typeof this.editor.getCurrentSchema === 'function') {
            const schema = this.editor.getCurrentSchema(this.currentBoardType);
            const jsonText = JSON.stringify(schema, null, 4);
            await fetch('/api/boards/file', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: this.currentFilePath, content: jsonText })
            });
        }
    }

    async handleRevertFile() {
        if (!this.currentFilePath || !this.currentFileIsBoardJson) return;

        let text = '';
        try {
            const res = await fetch(`/api/boards/file?path=${encodeURIComponent(this.currentFilePath)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            text = data.content || '';
        } catch (e) {
            console.error('Failed to reload file', e);
            return;
        }

        // Re-load board state
        if (this.editor && typeof this.editor.loadFromSchema === 'function') {
            try {
                const parsed = JSON.parse(text);
                if (parsed && parsed.boardType && Array.isArray(parsed.pieces)) {
                    this.editor.loadFromSchema(parsed);
                }
            } catch (e) {
                // ignore parse errors on revert
            }
        }
    }
}


