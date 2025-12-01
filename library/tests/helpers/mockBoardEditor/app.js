import { MockBoardEditor } from './MockBoardEditor.js';
import { FileExplorer } from './FileExplorer.js';

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const editor = new MockBoardEditor();
    if ('showDirectoryPicker' in window) {
        new FileExplorer(editor);
    }
});

