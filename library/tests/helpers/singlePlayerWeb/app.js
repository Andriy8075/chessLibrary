import { loadGameState, setupSaveGameButton, setupPromotionButtons, setupGameActionButtons } from './js/ui.js';

document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    setupSaveGameButton();
    setupPromotionButtons();
    setupGameActionButtons();
});

