export class FileExplorer {
    constructor() {
        this.rootHandle = null;
        this.currentFileHandle = null;
        this.currentFilePath = '';
        this.pathHandleMap = new Map(); // path -> handle

        this.init();
    }

    async init() {
        this.openFolderBtn = document.getElementById('openFolderBtn');
        this.newFolderBtn = document.getElementById('newFolderBtn');
        this.newFileBtn = document.getElementById('newFileBtn');
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

        this.openFolderBtn?.addEventListener('click', () => this.handleOpenFolder());
        this.newFolderBtn?.addEventListener('click', () => this.handleNewFolder());
        this.newFileBtn?.addEventListener('click', () => this.handleNewFile());
        this.saveFileBtn?.addEventListener('click', () => this.handleSaveFile());
        this.revertFileBtn?.addEventListener('click', () => this.handleRevertFile());
    }

    async handleOpenFolder() {
        try {
            this.rootHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });

            this.pathHandleMap.clear();
            this.pathHandleMap.set('', this.rootHandle);

            this.newFolderBtn.disabled = false;
            this.newFileBtn.disabled = false;

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
                li.className = 'file-item folder-item collapsed';
                li.textContent = name;

                const childUl = document.createElement('ul');
                childUl.style.display = 'none';

                await this.addDirectoryEntries(relativePath, handle, childUl);
                li.appendChild(childUl);

                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectFolder(relativePath, li);

                    const isExpanded = li.classList.toggle('expanded');
                    if (isExpanded) {
                        li.classList.remove('collapsed');
                        childUl.style.display = 'block';
                    } else {
                        li.classList.add('collapsed');
                        childUl.style.display = 'none';
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
    }

    async openFile(path, handle, liEl) {
        this.clearSelection();
        liEl.classList.add('selected');

        this.currentFileHandle = handle;
        this.currentFilePath = path;

        const file = await handle.getFile();
        const text = await file.text();

        this.fileEditor.disabled = false;
        this.fileEditor.value = text;

        this.currentFilePathEl.textContent = path;

        this.saveFileBtn.disabled = false;
        this.revertFileBtn.disabled = false;
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

    async handleSaveFile() {
        if (!this.currentFileHandle) return;

        const writable = await this.currentFileHandle.createWritable();
        await writable.write(this.fileEditor.value);
        await writable.close();
    }

    async handleRevertFile() {
        if (!this.currentFileHandle) return;

        const file = await this.currentFileHandle.getFile();
        const text = await file.text();
        this.fileEditor.value = text;
    }
}


