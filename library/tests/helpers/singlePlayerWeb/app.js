import { loadGameState, setupSaveGameButton, setupPromotionButtons } from './js/ui.js';

document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    setupSaveGameButton();
    setupPromotionButtons();
});

