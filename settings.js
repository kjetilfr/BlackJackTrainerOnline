// settings.js
import { Game } from './game.js';
import { UI } from './ui.js';

const settingsForm = document.getElementById('settings-form');
const settingsContainer = document.getElementById('settings-container');
const gameContainer = document.getElementById('game-container');

export let currentSettings = null;  // Exported for access from other modules

settingsForm.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(settingsForm);

  currentSettings = {
    numberOfHands: parseInt(formData.get('hands')),
    lateSurrender: formData.get('lateSurrender') === 'on' || formData.get('lateSurrender') === true || formData.get('lateSurrender') === 'true',
    blackjackPayout: parseFloat(formData.get('payout')),
    insurance: formData.get('insurance') === 'yes',
    dealerHitsSoft17: formData.get('dealer17') === 'hit',
    doubleAfterSplit: formData.get('doubleAfterSplit') === 'yes',
    maxSplitHands: parseInt(formData.get('splitHands')),
    resplitAces: formData.get('resplitAces') === 'yes',
    splitAcesDrawOneCardOnly: formData.get('splitAcesDrawOne') === 'yes'
  };

  // Hide settings UI, show game UI
  settingsContainer.style.display = 'none';
  gameContainer.style.display = 'block';

  Game.start(currentSettings);
  UI.init(Game, gameContainer);
});
