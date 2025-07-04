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
        Game.start(currentSettings);
        update();
      }
    };

    update();
  }

  function getKenneyCardFileName(card) {
    const suitMap = {
      "S": "spades",
      "H": "hearts",
      "D": "diamonds",
      "C": "clubs"
    };

    const valueMap = {
      "A": "A",
      "J": "J",
      "Q": "Q",
      "K": "K"
    };

    let val = card.value;
    if (!valueMap[val]) {
      val = val.padStart(2, "0");
    } else {
      val = valueMap[val];
    }

    const suit = suitMap[card.suit];
    return `cards/card_${suit}_${val}.png`;
  }

  function renderHand(hand, container){
    container.innerHTML = "";
    hand.forEach(card => {
      const img = document.createElement('img');
      img.src = getKenneyCardFileName(card);
      img.classList.add('card');
      container.appendChild(img);
    });
  }

  function update(){
    const state = Game.getGameState();

    // Dealer
    renderHand(state.dealerHand, dealerCardsEl);
    dealerScoreEl.textContent = state.dealerHand.length > 0 ? calculateScore(state.dealerHand) : 0;

    // Player hands
    playerSectionEl.innerHTML = '';
    state.playerHands.forEach((handObj, idx) => {
      const handDiv = document.createElement('div');
      handDiv.classList.add('player-hand');
      if(idx === state.currentHandIndex && handObj.state === 'playing'){
        handDiv.style.border = '3px solid gold';
      }
      const title = document.createElement('h3');
      title.textContent = `Hand ${idx+1} (${calculateScore(handObj.cards)})`;
      if(handObj.surrendered){
        title.textContent += " - Surrendered";
      } else if(handObj.state === 'busted'){
        title.textContent += " - Busted";
      } else if(handObj.state === 'stood'){
        title.textContent += " - Stood";
      }
      handDiv.appendChild(title);

      const cardsDiv = document.createElement('div');
      cardsDiv.classList.add('hand-cards');
      renderHand(handObj.cards, cardsDiv);
      handDiv.appendChild(cardsDiv);

      playerSectionEl.appendChild(handDiv);
    });

    // Enable/disable buttons based on current hand state
    const currentHand = state.playerHands[state.currentHandIndex];

    if(!currentHand || currentHand.state !== 'playing'){
      setButtonsDisabled(true);
      return;
    }

    setButtonsDisabled(false);

    if(currentHand.cards.length !== 2) actionButtons.double.disabled = true;
    if(currentHand.doubled) actionButtons.double.disabled = true;
    if(!canSplit(currentHand, state.playerHands, state.settings)) actionButtons.split.disabled = true;
    else actionButtons.split.disabled = false;

    if(!state.settings.lateSurrender || currentHand.cards.length !== 2) {
      actionButtons.surrender.disabled = true;
    } else {
      actionButtons.surrender.disabled = false;
    }
  }

  function setButtonsDisabled(value){
    Object.values(actionButtons).forEach(btn => btn.disabled = value);
  }

  function calculateScore(hand){
    let score = hand.reduce((acc, c) => acc + cardValue(c), 0);
    let aces = hand.filter(c => c.value === "A").length;
    while(score > 21 && aces > 0){
      score -= 10;
      aces--;
    }
    return score;
  }

  function cardValue(card){
    if(["J","Q","K"].includes(card.value)) return 10;
    if(card.value === "A") return 11;
    return parseInt(card.value);
  }

  function canSplit(handObj, playerHands, settings){
    if(handObj.cards.length !== 2) return false;
    const c1 = handObj.cards[0];
    const c2 = handObj.cards[1];
    if(c1.value !== c2.value) return false;
    if(playerHands.length >= settings.maxSplitHands) return false;
    return true;
  }

  return {
    init,
    update
  };
})();
