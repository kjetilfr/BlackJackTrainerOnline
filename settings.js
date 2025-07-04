// settings.js
import { Game } from './game.js';
import { UI } from './ui.js';

const form = document.getElementById('settings-form');
const settingsDiv = document.getElementById('settings-container');
const gameDiv = document.getElementById('game-container');

export let currentSettings = null;

form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  currentSettings = {
    numberOfHands: parseInt(f.get('hands')),
    lateSurrender: f.get('lateSurrender') === 'on',
    dealerHitsSoft17: f.get('dealer17') === 'hit',
    maxSplitHands: parseInt(f.get('splitHands'))
  };
  settingsDiv.style.display = 'none';
  gameDiv.style.display = 'block';
  Game.start(currentSettings);
  UI.init(Game, gameDiv);
});
