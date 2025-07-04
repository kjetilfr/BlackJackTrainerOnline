// settings.js
import { Game } from './game.js';
import { UI } from './ui.js';

const settingsForm = document.getElementById('settings-form');
const settingsContainer = document.getElementById('settings-container');
const gameContainer = document.getElementById('game-container');

export let currentSettings = null;

settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(settingsForm);
  currentSettings = {
    numberOfHands: parseInt(f.get('hands')),
    lateSurrender: f.get('lateSurrender') === 'on',
    blackjackPayout: parseFloat(f.get('payout')),
    insurance: f.get('insurance') === 'yes',
    dealerHitsSoft17: f.get('dealer17') === 'hit',
    doubleAfterSplit: f.get('doubleAfterSplit') === 'yes',
    maxSplitHands: parseInt(f.get('splitHands')),
    resplitAces: f.get('resplitAces') === 'yes',
    splitAcesDrawOneCardOnly: f.get('splitAcesDrawOne') === 'yes',
    startingChips: parseInt(f.get('startingChips')),
    initialBet: parseInt(f.get('initialBet'))
  };

  settingsContainer.style.display = 'none';
  gameContainer.style.display = 'block';
  Game.start(currentSettings);
  UI.init(Game, gameContainer);
});
