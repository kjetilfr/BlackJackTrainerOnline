const suits = ["S", "H", "D", "C"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

let deck = [], playerHand = [], dealerHand = [];

const playerEl = document.getElementById('player-cards');
const dealerEl = document.getElementById('dealer-cards');
const playerScoreEl = document.getElementById('player-score');
const dealerScoreEl = document.getElementById('dealer-score');
const resultEl = document.getElementById('result');

const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
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
    val = val.padStart(2, "0"); // e.g. "2" -> "02"
  } else {
    val = valueMap[val];
  }

  const suit = suitMap[card.suit];
  return `cards/card_${suit}_${val}.png`;
}

function renderHand(hand, container, hideSecondCard = false){
  container.innerHTML = "";
  hand.forEach((card, i) => {
    const img = document.createElement('img');
    if(i === 1 && hideSecondCard){
      img.src = 'cards/card_back.png'; // Kenney card back image
    } else {
      img.src = getKenneyCardFileName(card);
    }
    img.classList.add('card');
    container.appendChild(img);
  });
}

function updateGame(hideDealerSecondCard = true){
  renderHand(playerHand, playerEl, false);
  renderHand(dealerHand, dealerEl, hideDealerSecondCard);
  playerScoreEl.textContent = calculateScore(playerHand);
  dealerScoreEl.textContent = hideDealerSecondCard ? "?" : calculateScore(dealerHand);
}

function checkEndGame(){
  const playerScore = calculateScore(playerHand);
  if(playerScore > 21){
    endGame("You busted! Dealer wins.");
  }
}

function endGame(message){
  resultEl.textContent = message;
  hitBtn.disabled = true;
  standBtn.disabled = true;
}

function dealerPlay(){
  hitBtn.disabled = true;
  standBtn.disabled = true;
  updateGame(false);
  let dealerScore = calculateScore(dealerHand);
  while(dealerScore < 17){
    drawCard(dealerHand);
    dealerScore = calculateScore(dealerHand);
    updateGame(false);
  }
  const playerScore = calculateScore(playerHand);
  if(dealerScore > 21 || playerScore > dealerScore){
    endGame("You win!");
  } else if(playerScore === dealerScore){
    endGame("It's a tie!");
  } else {
    endGame("Dealer wins!");
  }
}

hitBtn.onclick = () => {
  drawCard(playerHand);
  updateGame();
  checkEndGame();
};

standBtn.onclick = () => {
  dealerPlay();
};

restartBtn.onclick = () => {
  createDeck();
  playerHand = [];
  dealerHand = [];
  drawCard(playerHand);
  drawCard(dealerHand);
  drawCard(playerHand);
  drawCard(dealerHand);
  resultEl.textContent = "";
  hitBtn.disabled = false;
  standBtn.disabled = false;
  updateGame();
};

// Start game on page load
restartBtn.onclick();
