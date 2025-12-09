import { loadGameState, setupSaveGameButton, setupPromotionButtons } from './js/ui.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    setupSaveGameButton();
    setupPromotionButtons();
});

