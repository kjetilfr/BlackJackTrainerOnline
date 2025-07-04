// game.js
export const Game = (() => {
  const suits = ["S","H","D","C"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let deck = [], settings = null, dealerHand = [], playerHands = [], currentHandIndex = 0;

  function createDeck(){
    deck = [];
    suits.forEach(s => values.forEach(v => deck.push({value: v, suit: s})));
    deck.sort(() => Math.random() - 0.5);
  }

  function drawCard(){
    if (deck.length === 0) createDeck();
    return deck.pop();
  }

  function cardValue(c){
    if (["J","Q","K"].includes(c.value)) return 10;
    if (c.value === "A") return 11;
    return parseInt(c.value);
  }

  function handScore(hand){
    let score = hand.reduce((sum, c) => sum + cardValue(c), 0);
    let aces = hand.filter(c => c.value === "A").length;
    while (score > 21 && aces > 0) { score -= 10; aces--; }
    return score;
  }

  function start(userSettings){
    settings = userSettings;
    createDeck();
    dealerHand = [drawCard(), drawCard()];
    playerHands = [];

    for (let i = 0; i < settings.numberOfHands; i++){
      const cards = [drawCard(), drawCard()];
      const isBJ = handScore(cards) === 21;
      playerHands.push({ cards, state: isBJ ? 'blackjack' : 'playing', outcome: null });
    }

    currentHandIndex = playerHands.findIndex(h => h.state === 'playing');
    if (currentHandIndex < 0) dealerPlay();
  }

  function hitCurrentHand(){
    const h = playerHands[currentHandIndex];
    if (!h || h.state !== 'playing') return;
    h.cards.push(drawCard());
    if (handScore(h.cards) > 21) { h.state = 'busted'; nextHand(); }
  }

  function standCurrentHand(){
    const h = playerHands[currentHandIndex];
    if (!h || h.state !== 'playing') return;
    h.state = 'stood';
    nextHand();
  }

  function doubleCurrentHand(){
    const h = playerHands[currentHandIndex];
    if (!h || h.state !== 'playing' || h.cards.length !== 2) return;
    h.cards.push(drawCard());
    h.state = handScore(h.cards) > 21 ? 'busted' : 'stood';
    nextHand();
  }

  function surrenderCurrentHand(){
    const h = playerHands[currentHandIndex];
    if (settings.lateSurrender && h && h.state === 'playing' && h.cards.length === 2){
      h.state = 'surrendered';
      nextHand();
    }
  }

  function splitCurrentHand(){
    const h = playerHands[currentHandIndex];
    if (!h || h.cards.length !== 2 || h.cards[0].value !== h.cards[1].value || playerHands.length >= settings.maxSplitHands) return;
    const card2 = h.cards.pop();
    const newHand = { cards: [card2, drawCard()], state: 'playing', outcome: null };
    h.cards.push(drawCard());
    playerHands.splice(currentHandIndex + 1, 0, newHand);
  }

  function nextHand(){
    currentHandIndex = playerHands.findIndex((_, i) => i > currentHandIndex && playerHands[i].state === 'playing');
    if (currentHandIndex < 0) dealerPlay();
  }

  function dealerPlay(){
    const dealerBJ = handScore(dealerHand) === 21;

    if (!dealerBJ){
      while (true){
        const s = handScore(dealerHand);
        const soft17 = s === 17 && handScore(dealerHand) !== s;
        if (s > 17 || (s === 17 && !(settings.dealerHitsSoft17 && soft17))) break;
        dealerHand.push(drawCard());
      }
    }

    resolveOutcomes(dealerBJ);
  }

  function resolveOutcomes(dealerBJ){
    const ds = handScore(dealerHand);
    playerHands.forEach(h => {
      const ps = handScore(h.cards);
      if (h.state === 'blackjack'){
        h.outcome = dealerBJ ? 'push' : 'blackjack';
      } else if (h.state === 'busted'){
        h.outcome = 'bust';
      } else if (h.state === 'surrendered'){
        h.outcome = 'surrender';
      } else {
        if (dealerBJ) h.outcome = 'lose';
        else if (ps > 21) h.outcome = 'bust';
        else if (ds > 21 || ps > ds) h.outcome = 'win';
        else if (ps === ds) h.outcome = 'push';
        else h.outcome = 'lose';
      }
    });
  }

  function getGameState(){
    return { dealerHand, playerHands, currentHandIndex, settings };
  }

  return { start, hitCurrentHand, standCurrentHand, doubleCurrentHand, surrenderCurrentHand, splitCurrentHand, getGameState };
})();
