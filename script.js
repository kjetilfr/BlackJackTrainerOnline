const suits = ["S", "H", "D", "C"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

let deck = [];
let playerHands = []; // array of arrays, each player hand is array of cards
let playerStates = []; // 'playing', 'stood', 'busted'
let currentHandIndex = 0;
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

  if(playerHands.length === 0){
    playerSectionEl.textContent = "No hands to play.";
    return;
  }

  playerHands.forEach((hand, i) => {
    const handDiv = document.createElement('div');
    handDiv.classList.add('player-hand');
    if(i === currentHandIndex && playerStates[i] === 'playing'){
      handDiv.style.border = '3px solid gold';
    }

    const title = document.createElement('h3');
    title.textContent = `Hand ${i + 1} (${calculateScore(hand)})`;
    handDiv.appendChild(title);

    const cardsDiv = document.createElement('div');
    cardsDiv.classList.add('hand-cards');
    renderHand(hand, cardsDiv);
    handDiv.appendChild(cardsDiv);

    const btnHit = document.createElement('button');
    btnHit.textContent = "Hit";
    btnHit.disabled = !(i === currentHandIndex && playerStates[i] === 'playing');
    btnHit.onclick = () => {
      drawCard(hand);
      const score = calculateScore(hand);
      if(score > 21){
        playerStates[i] = 'busted';
        nextHand();
      }
      updateGame();
    };
    handDiv.appendChild(btnHit);

    const btnStand = document.createElement('button');
    btnStand.textContent = "Stand";
    btnStand.disabled = !(i === currentHandIndex && playerStates[i] === 'playing');
    btnStand.onclick = () => {
      playerStates[i] = 'stood';
      nextHand();
      updateGame();
    };
    handDiv.appendChild(btnStand);

    playerSectionEl.appendChild(handDiv);
  });
}

function nextHand(){
  do {
    currentHandIndex++;
  } while (currentHandIndex < playerHands.length && playerStates[currentHandIndex] !== 'playing');
  
  if(currentHandIndex >= playerHands.length){
    dealerPlay();
  }
}

function dealerPlay(){
  // Dealer reveals cards, hits until >= 17
  let score = calculateScore(dealerHand);
  while(score < 17){
    drawCard(dealerHand);
    score = calculateScore(dealerHand);
  }
  updateGame();
  setTimeout(() => alertResults(), 200);
}

function alertResults(){
  const dealerScore = calculateScore(dealerHand);

  playerHands.forEach((hand, i) => {
    const score = calculateScore(hand);
    let result;
    if(score > 21){
      result = "Bust! You lose.";
    } else if(dealerScore > 21){
      result = "Dealer busts! You win.";
    } else if(score > dealerScore){
      result = "You win!";
    } else if(score === dealerScore){
      result = "Push.";
    } else {
      result = "You lose.";
    }
    alert(`Hand ${i + 1}: ${result}`);
  });
}

function updateGame(){
  renderDealer();
  renderPlayers();
}

function restartGame(){
  createDeck();
  const handCount = parseInt(handCountSelect.value);

  playerHands = [];
  playerStates = [];
  currentHandIndex = 0;
  dealerHand = [];

  for(let i = 0; i < handCount; i++){
    const hand = [];
    drawCard(hand);
    drawCard(hand);
    playerHands.push(hand);
    playerStates.push('playing');
  }

  dealerHand = [];
  drawCard(dealerHand);
  drawCard(dealerHand);

  updateGame();
}

handCountSelect.value = "3";
handCountSelect.onchange = restartGame;
restartBtn.onclick = restartGame;

restartGame();
