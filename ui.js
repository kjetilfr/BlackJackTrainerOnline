// ui.js
import { Game } from './game.js';
import { currentSettings } from './settings.js';

export const UI = (() => {
  let container;
  let dealerCardsEl, dealerScoreEl;
  let playerSectionEl;
  let actionButtons = {};

  function init(gameInstance, gameContainer){
    container = gameContainer;
    container.innerHTML = `
      <div id="dealer-section" class="hand-section">
        <h2>Dealer's Hand (<span id="dealer-score">0</span>)</h2>
        <div id="dealer-cards" class="hand-cards"></div>
      </div>
      <div id="player-section"></div>
      <div id="actions" class="actions">
        <button id="hit-btn">Hit</button>
        <button id="stand-btn">Stand</button>
        <button id="double-btn">Double</button>
        <button id="split-btn">Split</button>
        <button id="surrender-btn">Surrender</button>
        <button id="restart-btn">Restart</button>
      </div>
    `;

    dealerCardsEl = container.querySelector('#dealer-cards');
    dealerScoreEl = container.querySelector('#dealer-score');
    playerSectionEl = container.querySelector('#player-section');

    actionButtons.hit = container.querySelector('#hit-btn');
    actionButtons.stand = container.querySelector('#stand-btn');
    actionButtons.double = container.querySelector('#double-btn');
    actionButtons.split = container.querySelector('#split-btn');
    actionButtons.surrender = container.querySelector('#surrender-btn');
    actionButtons.restart = container.querySelector('#restart-btn');

    actionButtons.hit.onclick = () => {
      Game.hitCurrentHand();
      update();
    };

    actionButtons.stand.onclick = () => {
      Game.standCurrentHand();
      Game.nextHand();
      update();
    };

    actionButtons.double.onclick = () => {
      Game.doubleCurrentHand();
      Game.nextHand();
      update();
    };

    actionButtons.split.onclick = () => {
      Game.splitCurrentHand();
      update();
    };

    actionButtons.surrender.onclick = () => {
      Game.surrenderCurrentHand();
      Game.nextHand();
      update();
    };

    actionButtons.restart.onclick = () => {
      if(currentSettings){
        Game.start(currentSettings);  // restart with same settings
        update();
      }
    };

    update();
  }

  // ...rest of UI code unchanged (renderHand, update, setButtonsDisabled, calculateScore, canSplit, etc.)...

  return {
    init,
    update
  };
})();
