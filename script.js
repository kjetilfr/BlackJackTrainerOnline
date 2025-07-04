const suits = ["S", "H", "D", "C"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

let deck = [];
let playerHands = []; // array of arrays, each player hand is array of cards
let playerStates = []; // track status per hand: 'playing', 'stood', 'busted'
let currentHandIndex = 0; // which hand is active for input
let dealerHand = [];

const dealerCardsEl = document.getElementById('dealer-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerSectionEl = document.getElementById('player-section');
const handCountSelect = document.getElementById('hand-count');
const restartBtn = document.getElementById('restart-btn');

function createDeck(){
  deck = [];
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({value, suit});
    });
  });
  deck.sort(() => Math.random() - 0.5);
}

function drawCard(hand){
  if(deck.length === 0) createDeck();
  hand.push(deck.pop());
}

function getCardValue(card){
  if(["J","Q","K"].includes(card.value)) return 10;
  if(card.value === "A") return 11;
  return parseInt(card.value);
}

function calculateScore(hand){
  let score = hand.reduce((acc, card) => acc + getCardValue(card), 0);
  let aces = hand.filter(card => card.value === "A").length;
  while(score > 21 && aces > 0){
    score -= 10;
    aces--;
  }
  return score;
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

function renderDealer(){
  renderHand(dealerHand, dealerCardsEl);
  dealerScoreEl.textContent = calculateScore(dealerHand);
}

function renderPlayers(){
  playerSectionEl.innerHTML = "";

  playerHands.forEach((hand, i) => {
    const handDiv = document.createElement('div');
    handDiv.classList.add('player-hand');

    const title = document.createElement('h3');
    title.textContent = `Hand ${i+1} (Score: ${calculateScore(hand)})`;
    handDiv.appendChild(title);

    const cardsDiv = document.createElement('div');
    cardsDiv.classList.add('hand-cards');
    hand.forEach(card => {
      const img = document.createElement('img');
      img.src = getKenneyCardFileName(card);
      img.classList.add('card');
      cardsDiv.appendChild(img);
    });
    handDiv.appendChild(cardsDiv);

    // Result text area
    const resultText = document.createElement('div');
    resultText.classList.add('result-text');
    handDiv.appendChild(resultText);

    // Buttons container
    const btnHit = document.createElement('button');
    btnHit.textContent = "Hit";
    const btnStand = document.createElement('button');
    btnStand.textContent = "Stand";

    // Disable buttons if hand is busted or stood
    const state = playerStates[i];
    if(state !== 'playing'){
      btnHit.disabled = true;
      btnStand.disabled = true;
    }

    // Highlight current active hand
    if(i === currentHandIndex){
      handDiv.style.boxShadow = '0 0 12px #ffd700';
    }

    btnHit.onclick = () => {
      drawCard(playerHands[i]);
      updateGame();
      checkHand(i);
    };
    btnStand.onclick = () => {
      playerStates[i] = 'stood';
      nextHand();
      updateGame();
    };

    const btnContainer = document.createElement('div');
    btnContainer.appendChild(btnHit);
    btnContainer.appendChild(btnStand);
    handDiv.appendChild(btnContainer);

    playerSectionEl.appendChild(handDiv);
  });
}

function checkHand(i){
  const score = calculateScore(playerHands[i]);
  if(score > 21){
    playerStates[i] = 'busted';
    nextHand();
  }
}

function nextHand(){
  // Move to next hand still playing
  for(let i = currentHandIndex + 1; i < playerHands.length; i++){
    if(playerStates[i] === 'playing'){
      currentHandIndex = i;
      return;
    }
  }
  // If none found forward, check from start (just in case)
  for(let i = 0; i < currentHandIndex; i++){
    if(playerStates[i] === 'playing'){
      currentHandIndex = i;
      return;
    }
  }
  // No hands left playing, dealer plays
  currentHandIndex = -1;
  dealerPlay();
}

function dealerPlay(){
  renderDealer();
  let dealerScore = calculateScore(dealerHand);

  // Dealer hits while less than 17
  while(dealerScore < 17){
    drawCard(dealerHand);
    dealerScore = calculateScore(dealerHand);
    renderDealer();
  }

  // Determine outcome for each player hand
  playerHands.forEach((hand, i) => {
    const handScore = calculateScore(hand);
    const state = playerStates[i];
    const playerDiv = playerSectionEl.children[i];
    const resultText = playerDiv.querySelector('.result-text');

    if(state === 'busted'){
      resultText.textContent = "Busted! Dealer wins.";
    } else if(handScore > dealerScore || dealerScore > 21){
      resultText.textContent = "You win!";
    } else if(handScore === dealerScore){
      resultText.textContent = "Push (Tie).";
    } else {
      resultText.textContent = "Dealer wins.";
    }

    // Disable buttons after game over
    const buttons = playerDiv.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
  });
}

function updateGame(){
  renderDealer();
  renderPlayers();
  dealerScoreEl.textContent = calculateScore(dealerHand);
  // Show current hand highlight updated inside renderPlayers
}

function restartGame(){
  createDeck();
  const handCount = parseInt(handCountSelect.value);

  // Reset hands and states
  playerHands = [];
  playerStates = [];
  currentHandIndex = 0;
  dealerHand = [];

  // Deal initial cards to each player hand
  for(let i = 0; i < handCount; i++){
    const hand = [];
    drawCard(hand);
    drawCard(hand);
    playerHands.push(hand);
    playerStates.push('playing');
  }

  // Deal dealer cards
  dealerHand = [];
  drawCard(dealerHand);
  drawCard(dealerHand);

  updateGame();
}

restartBtn.onclick = restartGame;
handCountSelect.onchange = restartGame;

// Start game on page load
restartGame();
