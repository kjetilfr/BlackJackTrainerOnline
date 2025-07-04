// game.js
export const Game = (() => {
  const suits = ["S", "H", "D", "C"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  let deck = [];
  let settings = null;

  let dealerHand = [];
  let playerHands = []; // array of { cards: [], state: '', bet: number, doubled: bool, surrendered: bool }
  let currentHandIndex = 0;

  // Helpers

  function createDeck(){
    deck = [];
    suits.forEach(suit => {
      values.forEach(value => {
        deck.push({value, suit});
      });
    });
    deck.sort(() => Math.random() - 0.5);
  }

  function drawCard(){
    if(deck.length === 0) createDeck();
    return deck.pop();
  }

  function cardValue(card){
    if(["J","Q","K"].includes(card.value)) return 10;
    if(card.value === "A") return 11;
    return parseInt(card.value);
  }

  function handScore(hand){
    let score = hand.reduce((acc, c) => acc + cardValue(c), 0);
    let aces = hand.filter(c => c.value === "A").length;
    while(score > 21 && aces > 0){
      score -= 10;
      aces--;
    }
    return score;
  }

  // Initialize game

  function start(userSettings){
    settings = userSettings;
    createDeck();

    dealerHand = [drawCard(), drawCard()];
    playerHands = [];

    for(let i=0; i < settings.numberOfHands; i++){
      playerHands.push({
        cards: [drawCard(), drawCard()],
        state: 'playing',
        bet: 1,
        doubled: false,
        surrendered: false,
        splitsDone: 0,
      });
    }

    currentHandIndex = 0;
  }

  // Game actions: hit, stand, double, split, surrender etc
  // Implement logic for late surrender, double after split, resplitting, split aces restrictions, insurance, dealer hit on soft 17 etc.

  function canSplit(hand){
    if(hand.cards.length !== 2) return false;
    const c1 = hand.cards[0];
    const c2 = hand.cards[1];
    if(c1.value !== c2.value) return false;
    if(playerHands.length >= settings.maxSplitHands) return false;
    return true;
  }

  function hitCurrentHand(){
    if(currentHandIndex >= playerHands.length) return;
    const hand = playerHands[currentHandIndex];
    if(hand.state !== 'playing') return;

    hand.cards.push(drawCard());
    const score = handScore(hand.cards);
    if(score > 21) hand.state = 'busted';
  }

  function standCurrentHand(){
    if(currentHandIndex >= playerHands.length) return;
    playerHands[currentHandIndex].state = 'stood';
  }

  function doubleCurrentHand(){
    if(currentHandIndex >= playerHands.length) return;
    const hand = playerHands[currentHandIndex];
    if(hand.state !== 'playing' || hand.cards.length !== 2) return;
    hand.bet *= 2;
    hand.doubled = true;
    hand.cards.push(drawCard());
    const score = handScore(hand.cards);
    if(score > 21) hand.state = 'busted';
    else hand.state = 'stood';
  }

  function surrenderCurrentHand(){
    if(currentHandIndex >= playerHands.length) return;
    const hand = playerHands[currentHandIndex];
    if(hand.state !== 'playing') return;
    if(settings.lateSurrender){
      // Late surrender allowed only first turn before any other action
      if(hand.cards.length === 2) {
        hand.surrendered = true;
        hand.state = 'surrendered';
      }
    }
  }

  function splitCurrentHand(){
    if(currentHandIndex >= playerHands.length) return;
    const hand = playerHands[currentHandIndex];
    if(!canSplit(hand)) return;

    const cardToSplit = hand.cards.pop();
    const newHand = {
      cards: [cardToSplit, drawCard()],
      state: 'playing',
      bet: hand.bet,
      doubled: false,
      surrendered: false,
      splitsDone: hand.splitsDone + 1,
    };

    if(settings.splitAcesDrawOneCardOnly && hand.cards[0].value === 'A'){
      // After splitting aces, only one card drawn
      hand.state = 'stood';
      newHand.state = 'stood';
    }

    playerHands.splice(currentHandIndex + 1, 0, newHand);

    // Add one card to original split hand as well
    hand.cards.push(drawCard());
  }

  // Dealer plays according to dealerHitsSoft17 setting
  function dealerPlay(){
    while(true){
      const score = handScore(dealerHand);
      if(score > 21) break;
      if(score > 17) break;
      if(score === 17){
        // Check if soft 17
        let hasAce = dealerHand.some(c => c.value === 'A');
        if(settings.dealerHitsSoft17 && hasAce) {
          dealerHand.push(drawCard());
        } else {
          break;
        }
      } else {
        dealerHand.push(drawCard());
      }
    }
  }

  function nextHand(){
    do {
      currentHandIndex++;
    } while (currentHandIndex < playerHands.length && playerHands[currentHandIndex].state !== 'playing');

    if(currentHandIndex >= playerHands.length){
      dealerPlay();
    }
  }

  function getGameState(){
    return {
      dealerHand,
      playerHands,
      currentHandIndex,
      settings
    };
  }

  return {
    start,
    hitCurrentHand,
    standCurrentHand,
    doubleCurrentHand,
    surrenderCurrentHand,
    splitCurrentHand,
    nextHand,
    getGameState,
  };
})();
