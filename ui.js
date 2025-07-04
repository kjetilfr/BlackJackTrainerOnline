// ui.js
import { Game } from './game.js';
import { currentSettings } from './settings.js';

export const UI = (() => {
  let container, dealerCardsEl, dealerScoreEl, playerSectionEl, buttons = {};

  function init(_, gameContainer){
    container = gameContainer;
    container.innerHTML = `
      <div id="dealer-section">
        <h2>Dealer (<span id="dealer-score">0</span>)</h2>
        <div id="dealer-cards" class="hand-cards"></div>
      </div>
      <div id="player-section"></div>
      <div class="actions">
        <button id="hit">Hit</button>
        <button id="stand">Stand</button>
        <button id="double">Double</button>
        <button id="split">Split</button>
        <button id="surrender">Surrender</button>
        <button id="restart">Restart</button>
      </div>
    `;

    dealerCardsEl = container.querySelector('#dealer-cards');
    dealerScoreEl = container.querySelector('#dealer-score');
    playerSectionEl = container.querySelector('#player-section');

    ['hit','stand','double','split','surrender','restart'].forEach(id => {
      buttons[id] = container.querySelector(`#${id}`);
    });

    buttons.hit.onclick = () => { Game.hitCurrentHand(); update(); }
    buttons.stand.onclick = () => { Game.standCurrentHand(); update(); }
    buttons.double.onclick = () => { Game.doubleCurrentHand(); update(); }
    buttons.split.onclick = () => { Game.splitCurrentHand(); update(); }
    buttons.surrender.onclick = () => { Game.surrenderCurrentHand(); update(); }
    buttons.restart.onclick = () => { Game.start(currentSettings); update(); }

    update();
  }

  // Render function for hand cards with corrected image paths
  function renderHandCards(hand, container, hideDealerFirstCard = false) {
    container.innerHTML = '';
    
    hand.forEach((c, index) => {
      const img = document.createElement('img');
      const suit = c.suit === 'S' ? 'spades' :
                   c.suit === 'H' ? 'hearts' :
                   c.suit === 'D' ? 'diamonds' : 'clubs';
  
      let cardValue = c.value === 'A' || c.value === 'J' || c.value === 'Q' || c.value === 'K'
                      ? c.value
                      : c.value.padStart(2, '0'); // pad numbers (2-10) with leading 0 if needed
  
      // If it's the dealer's first card and we are hiding it, show a back of the card
      if (hideDealerFirstCard && index === 0) {
        img.src = 'cards/card_back.png'; // Face down card
        img.classList.add('card');
        container.appendChild(img);
        return;
      }
  
      // Show face up cards for the dealer
      if (index === 1 && !c.faceUp) {
        img.src = 'cards/card_back.png'; // Face down card for second card
      } else {
        img.src = `cards/card_${suit}_${cardValue}.png`; // Actual card image
      }
  
      img.classList.add('card');
      container.appendChild(img);
    });
  }



  function update(){
    const s = Game.getGameState();
    dealerScoreEl.textContent = handScore(s.dealerHand);

    // For dealer, only hide the first card during the player's turn
    const hideDealerFirstCard = s.playerHands.some(hand => hand.state === 'playing');
    renderHandCards(s.dealerHand, dealerCardsEl, hideDealerFirstCard); // Pass `hideDealerFirstCard` flag

    playerSectionEl.innerHTML = '';
    s.playerHands.forEach((h, idx) => {
      const div = document.createElement('div');
      div.classList.add('player-hand');
      if (idx === s.currentHandIndex && h.state === 'playing') div.style.border = '2px solid gold';

      const score = handScore(h.cards);
      div.innerHTML = `<h3>Hand ${idx+1} — ${score} ${h.outcome ? '('+h.outcome+')' : ''}</h3><div class="hand-cards"></div>`;
      renderHandCards(h.cards, div.querySelector('.hand-cards'));
      playerSectionEl.appendChild(div);
    });

    const cur = s.playerHands[s.currentHandIndex];
    buttons.hit.disabled = !cur || cur.state !== 'playing';
    buttons.stand.disabled = !cur || cur.state !== 'playing';
    buttons.double.disabled = !cur || cur.state !== 'playing' || cur.cards.length !== 2;
    buttons.split.disabled = !cur || cur.state !== 'playing' || !Game.canSplit?.(cur);
    buttons.surrender.disabled = !cur || cur.state !== 'playing' || !s.settings.lateSurrender;
  }

  function handScore(hand){
    let score = hand.reduce((a,c)=>a+cardValue(c),0);
    let aces = hand.filter(c=>c.value==="A").length;
    while(score>21 && aces){ score-=10; aces--; }
    return score;
  }

  function cardValue(c){
    return ["J","Q","K"].includes(c.value) ? 10 : (c.value === "A" ? 11 : parseInt(c.value));
  }

  return { init, update };
})();
