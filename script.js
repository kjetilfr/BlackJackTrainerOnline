// Game setup
const suits = ["S","H","D","C"];
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

function createDeck() {
  deck = [];
  for (let s of suits) values.forEach(v => deck.push({value: v, suit: s}));
  deck.sort(() => Math.random() - 0.5);
}

function drawCard(hand) {
  hand.push(deck.pop());
}

function getValue(card) {
  if (["J","Q","K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}

function calcScore(hand) {
  let score = hand.reduce((sum, c) => sum + getValue(c), 0);
  let aces = hand.filter(c => c.value === "A").length;
  while (score > 21 && aces) { score -= 10; aces--; }
  return score;
}

function createCardEl(card, faceDown = false, delay = 0) {
  const div = document.createElement('div');
  div.className = 'card';
  if (faceDown) div.classList.add('flip');
  div.style.animationDelay = `${delay}ms`;

  const front = document.createElement('img');
  front.src = `cards/${card.value}${card.suit}.png`;

  const back = document.createElement('div');
  back.className = 'back';

  div.append(front, back);
  return div;
}

function updateDisplay() {
  playerEl.innerHTML = '';
  dealerEl.innerHTML = '';

  playerHand.forEach((c, i) => playerEl.append(createCardEl(c, false, i * 200)));
  dealerHand.forEach((c, i) => {
    const faceDown = (i === 1); // second card face down
    dealerEl.append(createCardEl(c, faceDown, i * 200));
  });

  playerScoreEl.textContent = calcScore(playerHand);
  dealerScoreEl.textContent = calcScore(dealerHand);
}

function checkBust() {
  if (calcScore(playerHand) > 21) endGame("You busted! Dealer wins.");
}

function hit() {
  drawCard(playerHand);
  updateDisplay();
  checkBust();
}

function stand() {
  // Reveal dealer's card
  const faceDownCard = dealerEl.querySelector('.card.flip');
  if (faceDownCard) faceDownCard.classList.remove('flip');

  // Dealer hits until 17+
  setTimeout(() => {
    while (calcScore(dealerHand) < 17) {
      drawCard(dealerHand);
      updateDisplay();
    }
    const p = calcScore(playerHand), d = calcScore(dealerHand);
    if (d > 21 || p > d) endGame("You win!");
    else if (p === d) endGame("It's a tie!");
    else endGame("Dealer wins!");
  }, 500);
}

function endGame(msg) {
  resultEl.textContent = msg;
  hitBtn.disabled = standBtn.disabled = true;
}

function restart() {
  createDeck();
  playerHand = []; dealerHand = [];
  drawCard(playerHand); drawCard(dealerHand);
  drawCard(playerHand); drawCard(dealerHand);
  hitBtn.disabled = standBtn.disabled = false;
  resultEl.textContent = '';
  updateDisplay();
}

hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
restartBtn.addEventListener('click', restart);

// Initialize
restart();
