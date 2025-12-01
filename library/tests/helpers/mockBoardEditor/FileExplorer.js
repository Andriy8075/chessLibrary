export class FileExplorer {
    constructor(editor) {
        this.rootHandle = null;
        this.currentFileHandle = null;
        this.currentFilePath = '';
        this.pathHandleMap = new Map(); // path -> handle
        this.editor = editor;
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;
        this.expandedPaths = new Set();

        this.init();
    }

    async init() {
        this.openFolderBtn = document.getElementById('openFolderBtn');
        this.newFolderBtn = document.getElementById('newFolderBtn');
        this.newFileBtn = document.getElementById('newFileBtn');
        this.deleteFolderBtn = document.getElementById('deleteFolderBtn');
        this.fileTreeEl = document.getElementById('fileTree');
        this.fileEditor = document.getElementById('fileEditor');
        this.currentFilePathEl = document.getElementById('currentFilePath');
        this.saveFileBtn = document.getElementById('saveFileBtn');
        this.revertFileBtn = document.getElementById('revertFileBtn');
        this.fsSupportWarning = document.getElementById('fsSupportWarning');

        if (!('showDirectoryPicker' in window)) {
            if (this.fsSupportWarning) {
                this.fsSupportWarning.hidden = false;
            }
            if (this.openFolderBtn) this.openFolderBtn.disabled = true;
            return;
        }

        this.openFolderBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleOpenFolder();
        });
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
    }

    async handleOpenFolder() {
        try {
            this.rootHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });

            this.pathHandleMap.clear();
            this.pathHandleMap.set('', this.rootHandle);
            this.expandedPaths.clear();

            this.newFolderBtn.disabled = false;
            this.newFileBtn.disabled = false;
            if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = false;

            await this.renderTree();
        } catch (err) {
            // User cancelled or error; ignore
            console.error(err);
        }
    }

    async renderTree() {
        if (!this.rootHandle || !this.fileTreeEl) return;

        this.fileTreeEl.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'file-tree-root';

        await this.addDirectoryEntries('', this.rootHandle, ul);

        this.fileTreeEl.appendChild(ul);
    }

    async addDirectoryEntries(basePath, dirHandle, parentEl) {
        const entries = [];
        for await (const [name, handle] of dirHandle.entries()) {
            entries.push({ name, handle });
        }

        // Sort: directories first, then files, both alphabetically
        entries.sort((a, b) => {
            const aIsDir = a.handle.kind === 'directory';
            const bIsDir = b.handle.kind === 'directory';
            if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        for (const { name, handle } of entries) {
            const li = document.createElement('li');
            const relativePath = basePath ? `${basePath}/${name}` : name;
            this.pathHandleMap.set(relativePath, handle);

            if (handle.kind === 'directory') {
                const isExpanded = this.expandedPaths.has(relativePath);

                li.className = 'file-item folder-item ' + (isExpanded ? 'expanded' : 'collapsed');
                li.textContent = name;

                const childUl = document.createElement('ul');
                childUl.style.display = isExpanded ? 'block' : 'none';

                await this.addDirectoryEntries(relativePath, handle, childUl);
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
                li.textContent = name;
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openFile(relativePath, handle, li);
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
        this.currentFileHandle = null;
        this.currentFilePath = '';
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;
        if (this.deleteFolderBtn) {
            // Root cannot be deleted, but a valid folder can
            this.deleteFolderBtn.disabled = !path;
        }
    }

    async openFile(path, handle, liEl) {
        this.clearSelection();
        liEl.classList.add('selected');

        // Clear selected folder, this is now a file selection
        this.selectedFolderPath = null;

        this.currentFileHandle = handle;
        this.currentFilePath = path;
        this.currentFileIsBoardJson = false;
        this.currentBoardType = null;

        const file = await handle.getFile();
        const text = await file.text();

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

    getTargetDirectoryHandleForNewItem() {
        if (!this.rootHandle) return null;

        if (!this.selectedFolderPath) {
            return this.rootHandle;
        }

        const handle = this.pathHandleMap.get(this.selectedFolderPath);
        if (handle && handle.kind === 'directory') {
            return handle;
        }

        return this.rootHandle;
    }

    async handleNewFolder() {
        if (!this.rootHandle) return;

        const name = window.prompt('New folder name:');
        if (!name) return;

        const parentDir = this.getTargetDirectoryHandleForNewItem();
        if (!parentDir) return;

        await parentDir.getDirectoryHandle(name, { create: true });
        await this.renderTree();
    }

    async handleNewFile() {
        if (!this.rootHandle) return;

        const name = window.prompt('New file name (e.g., myTestBoard.json):');
        if (!name) return;

        const parentDir = this.getTargetDirectoryHandleForNewItem();
        if (!parentDir) return;

        const fileHandle = await parentDir.getFileHandle(name, { create: true });

        // Initialize empty file
        const writable = await fileHandle.createWritable();
        await writable.write('');
        await writable.close();

        await this.renderTree();
    }

    async handleDeleteSelected() {
        if (!this.rootHandle) return;

        // Prefer deleting a selected file if present
        if (this.currentFilePath && this.currentFileHandle) {
            const filePath = this.currentFilePath;
            const parts = filePath.split('/');
            const name = parts.pop();
            const parentPath = parts.join('/');

            const confirmDelete = window.confirm(`Delete file "${filePath}"?`);
            if (!confirmDelete) return;

            const parentHandle =
                parentPath === ''
                    ? this.rootHandle
                    : this.pathHandleMap.get(parentPath);

            if (!parentHandle || parentHandle.kind !== 'directory') {
                return;
            }

            try {
                await parentHandle.removeEntry(name);
            } catch (e) {
                console.error('Failed to delete file', e);
                return;
            }

            // Clear current file selection
            this.currentFileHandle = null;
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

            await this.renderTree();
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

        const parentHandle =
            parentPath === ''
                ? this.rootHandle
                : this.pathHandleMap.get(parentPath);

        if (!parentHandle || parentHandle.kind !== 'directory') {
            return;
        }

        try {
            await parentHandle.removeEntry(name, { recursive: true });
        } catch (e) {
            console.error('Failed to delete folder', e);
            return;
        }

        this.selectedFolderPath = null;
        if (this.deleteFolderBtn) this.deleteFolderBtn.disabled = true;
        await this.renderTree();
    }

    async handleSaveFile() {
        if (!this.currentFileHandle) return;

        const writable = await this.currentFileHandle.createWritable();

        if (this.currentFileIsBoardJson && this.editor && typeof this.editor.getCurrentSchema === 'function') {
            const schema = this.editor.getCurrentSchema(this.currentBoardType);
            const jsonText = JSON.stringify(schema, null, 4);
            await writable.write(jsonText);
        } else {
            await writable.write(this.fileEditor.value);
        }

        await writable.close();
    }

    async handleRevertFile() {
        if (!this.currentFileHandle) return;

        const file = await this.currentFileHandle.getFile();
        const text = await file.text();
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


