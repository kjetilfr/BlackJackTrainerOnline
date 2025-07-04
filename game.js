// game.js
export const Game = (() => {
  const suits = ["S","H","D","C"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let deck = [], settings=null, dealerHand=[], playerHands=[], currentHandIndex=0;
  
  let playerBank = 100; // default starting chips

  function createDeck(){ … } // same as before
  function drawCard(){ … }
  function cardValue(c){ … }
  function handScore(h){ … }

  function start(userSettings){
    settings = userSettings;
    playerBank = userSettings.startingChips || playerBank;
    createDeck();
    dealerHand=[drawCard(),drawCard()];
    playerHands=[];
    for(let i=0;i<settings.numberOfHands;i++){
      const cards=[drawCard(),drawCard()];
      const bet = userSettings.initialBet || 10;
      playerBank -= bet;
      const isBJ = handScore(cards)===21;
      playerHands.push({
        cards, state:isBJ?'blackjack':'playing',
        bet, insured:false, doubled:false,
        surrendered:false, splitsDone:0, outcome:null
      });
    }
    currentHandIndex = playerHands.findIndex(h=>h.state==='playing');
    if(currentHandIndex < 0) dealerPlay();
  }

  function hitCurrentHand(){ … } // same with bust and nextHand()
  function standCurrentHand(){ … } // calls nextHand()

  function doubleCurrentHand(){
    const h = playerHands[currentHandIndex];
    if(h.cards.length===2 && h.state==='playing'){
      playerBank -= h.bet;
      h.bet *=2; h.doubled=true;
      h.cards.push(drawCard());
      h.state = handScore(h.cards)>21?'busted':'stood';
      nextHand();
    }
  }

  function surrenderCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(settings.lateSurrender && h.cards.length===2){
      h.surrendered=true; h.state='surrendered';
      playerBank += h.bet/2;
      nextHand();
    }
  }

  function insureCurrentHand(){
    const h = playerHands[currentHandIndex];
    if(dealerHand[0].value==='A' && !h.insured){
      const cost = h.bet/2;
      if(playerBank>=cost){
        playerBank-=cost;
        h.insured=true;
      }
    }
  }

  function splitCurrentHand(){
    const h = playerHands[currentHandIndex];
    if(canSplit(h)){
      const c2 = h.cards.pop();
      const newBet=h.bet;
      playerBank -= newBet;
      const newHand={
        cards:[c2,drawCard()],
        bet:newBet, state:'playing',
        insured:false, doubled:false,
        surrendered:false, splitsDone:h.splitsDone+1,
        outcome:null
      };
      h.cards.push(drawCard());
      playerHands.splice(currentHandIndex+1,0,newHand);
    }
  }

  function nextHand(){
    currentHandIndex = playerHands.findIndex((h,i)=>i>currentHandIndex && h.state==='playing');
    if(currentHandIndex<0) dealerPlay();
  }

  function dealerPlay(){
    const dealerBJ = handScore(dealerHand)===21;
    resolveHands(dealerBJ);
    if(!dealerBJ){
      while(true){
        const sc=handScore(dealerHand);
        if(sc>21||sc>17||(sc===17 && !settings.dealerHitsSoft17))break;
        dealerHand.push(drawCard());
      }
      resolveHands(false);
    }
  }

  function resolveHands(dealerBJ){
    const ds = handScore(dealerHand);
    playerHands.forEach(h=>{
      const ps = handScore(h.cards);
      if(h.state==='blackjack'){
        if(dealerBJ){ h.outcome='pu'; playerBank+=h.bet; }
        else{ h.outcome='bj'; playerBank+=h.bet*(settings.blackjackPayout+1); }
      }
      else if(h.insured && dealerBJ){
        h.outcome='ins'; playerBank+=h.bet*2;
      }
      else if(h.surrendered){ h.outcome='su'; }
      else if(ps>21){ h.outcome='lo'; }
      else if(dealerBJ){ h.outcome='lo'; }
      else if(ps>ds||ds>21){ h.outcome='wi'; playerBank+=h.bet*2; }
      else if(ps===ds){ h.outcome='pu'; playerBank+=h.bet; }
      else { h.outcome='lo'; }
    });
  }

  function getGameState(){
    return {dealerHand,playerHands,currentHandIndex,settings,playerBank};
  }
  
  return {start, hitCurrentHand, standCurrentHand, doubleCurrentHand, surrenderCurrentHand,
          insureCurrentHand, splitCurrentHand, getGameState};
})();
