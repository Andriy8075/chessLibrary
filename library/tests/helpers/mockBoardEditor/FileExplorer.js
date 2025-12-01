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
        this.deleteFolderBtn = document.getElementById('deleteFolderBtn');
        this.fileTreeEl = document.getElementById('fileTree');
        this.fileEditor = document.getElementById('fileEditor');
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

    selectFolder(path, liEl) {
        this.clearSelection();
        liEl.classList.add('selected');
        this.selectedFolderPath = path;
        // Clear any current file selection
        this.currentFilePath = '';
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;
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

        // Try to interpret as a mock board JSON and load into editor.
        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            parsed = null;
        }

        if (parsed && parsed.boardType && Array.isArray(parsed.pieces) && this.editor && typeof this.editor.loadFromSchema === 'function') {
            // Load into the board editor instead of plain text editing
            this.editor.loadFromSchema(parsed);

            this.currentFileIsBoardJson = true;
            this.currentBoardType = parsed.boardType;

            // Show path but keep editor read-only for board JSON files
            this.currentFilePathEl.textContent = `${path} (board file)`;
            this.fileEditor.disabled = true;
            this.fileEditor.value = '';

            // Saving will use editor state instead of textarea
            this.saveFileBtn.disabled = false;
            this.revertFileBtn.disabled = false;
        } else {
            // Fallback: treat as plain text file
            this.fileEditor.disabled = false;
            this.fileEditor.value = text;

            this.currentFilePathEl.textContent = path;

            this.saveFileBtn.disabled = false;
            this.revertFileBtn.disabled = false;
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
            if (this.fileEditor) {
                this.fileEditor.value = '';
                this.fileEditor.disabled = true;
            }
            if (this.currentFilePathEl) {
                this.currentFilePathEl.textContent = 'No file opened';
            }
            if (this.saveFileBtn) this.saveFileBtn.disabled = true;
            if (this.revertFileBtn) this.revertFileBtn.disabled = true;
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
        if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = true;
        await this.loadTree();
    }

    async handleSaveFile() {
        if (!this.currentFilePath) return;

        if (this.currentFileIsBoardJson && this.editor && typeof this.editor.getCurrentSchema === 'function') {
            const schema = this.editor.getCurrentSchema(this.currentBoardType);
            const jsonText = JSON.stringify(schema, null, 4);
            await fetch('/api/boards/file', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: this.currentFilePath, content: jsonText })
            });
        } else {
            await fetch('/api/boards/file', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: this.currentFilePath, content: this.fileEditor.value })
            });
        }
    }

    async handleRevertFile() {
        if (!this.currentFilePath) return;

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

        this.fileEditor.value = text;

        // Also re-load board state if this is a board JSON file
        if (this.currentFileIsBoardJson && this.editor && typeof this.editor.loadFromSchema === 'function') {
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


