// ui.js
import { Game } from './game.js';
import { currentSettings } from './settings.js';

export const UI = (() => {
  let container, bankEl, dealerCardsEl, dealerScoreEl, playerSectionEl, buttons={};

  function init(_, gameContainer){
    container = gameContainer;
    container.innerHTML = `
      <div>Bank: <span id="bank">0</span></div>
      <div id="dealer-section"><h2>Dealer</h2><span id="dealer-score">0</span><div id="dealer-cards" class="hand-cards"></div></div>
      <div id="player-section"></div>
      <div class="actions">
        <button id="hit">Hit</button>
        <button id="stand">Stand</button>
        <button id="double">Double</button>
        <button id="split">Split</button>
        <button id="surrender">Surrender</button>
        <button id="insure">Insurance</button>
        <button id="restart">Restart</button>
      </div>`;
    bankEl=document.getElementById('bank');
    dealerCardsEl=document.getElementById('dealer-cards');
    dealerScoreEl=document.getElementById('dealer-score');
    playerSectionEl=document.getElementById('player-section');

    ['hit','stand','double','split','surrender','insure','restart'].forEach(id=>{
      buttons[id]=document.getElementById(id);
    });
    buttons.hit.onclick=()=>{Game.hitCurrentHand(); update();}
    buttons.stand.onclick=()=>{Game.standCurrentHand(); update();}
    buttons.double.onclick=()=>{Game.doubleCurrentHand(); update();}
    buttons.split.onclick=()=>{Game.splitCurrentHand(); update();}
    buttons.surrender.onclick=()=>{Game.surrenderCurrentHand(); update();}
    buttons.insure.onclick=()=>{Game.insureCurrentHand(); update();}
    buttons.restart.onclick=()=>{Game.start(currentSettings); update();}

    update();
  }

  function renderHandCards(hand, container){
    container.innerHTML='';
    hand.forEach(c=>{
      const img=document.createElement('img');
      img.src=`cards/card_${c.suit==='S'?'spades':c.suit==='H'?'hearts':c.suit==='D'?'diamonds':'clubs'}_${c.value.padStart(2,'0')}.png`;
      img.classList.add('card');
      container.appendChild(img);
    });
  }

  function update(){
    const s=Game.getGameState();
    bankEl.textContent=s.playerBank;
    dealerScoreEl.textContent=handScore(s.dealerHand);
    renderHandCards(s.dealerHand, dealerCardsEl);

    playerSectionEl.innerHTML='';
    s.playerHands.forEach((h, i)=>{
      const div=document.createElement('div');
      div.classList.add('player-hand');
      if(i===s.currentHandIndex && h.state==='playing') div.style.border='2px solid gold';
      div.innerHTML = `
        <h3>Hand ${i+1} - Bet: ${h.bet} - ${h.outcome||''}</h3>
        <div class="hand-cards"></div>`;
      renderHandCards(h.cards, div.querySelector('.hand-cards'));
      playerSectionEl.appendChild(div);
    });

    const cur=s.playerHands[s.currentHandIndex];
    ['hit','stand','double','split','surrender','insure'].forEach(k=>{
      buttons[k].disabled = !cur || cur.state!=='playing' ||
        (k==='double' && cur.cards.length!==2) ||
        (k==='split' && !Game.canSplit(cur)) ||
        (k==='insure' && (!currentSettings.insurance || s.dealerHand[0].value!=='A'));
    });
  }

  function handScore(hand){
    let s=hand.reduce((a,c)=>a+cardValue(c),0), aces=hand.filter(c=>c.value==='A').length;
    while(s>21 && aces){ s-=10; aces--; }
    return s;
  }
  function cardValue(c){return ["J","Q","K"].includes(c.value)?10:c.value==='A'?11:parseInt(c.value);}

  return {init, update};
})();
