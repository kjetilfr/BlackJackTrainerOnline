// game.js
export const Game = (() => {
  const suits=["S","H","D","C"], values=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let deck=[], settings=null, dealerHand=[], playerHands=[], currentHandIndex=0;
  let playerBank=0;

  function createDeck(){
    deck = [];
    suits.forEach(s=>values.forEach(v=>deck.push({value:v,suit:s})));
    deck.sort(() => Math.random() - 0.5);
  }
  function drawCard(){ if(deck.length===0) createDeck(); return deck.pop(); }
  function cardValue(c){ if(["J","Q","K"].includes(c.value)) return 10; if(c.value==="A") return 11; return parseInt(c.value); }
  function handScore(h){
    let s=h.reduce((a,c)=>a+cardValue(c),0), aces=h.filter(c=>c.value==="A").length;
    while(s>21 && aces){ s-=10; aces--; }
    return s;
  }

  function start(s){
    settings=s; playerBank=s.startingChips;
    createDeck();
    dealerHand=[drawCard(),drawCard()];
    playerHands=[];
    for(let i=0;i<s.numberOfHands;i++){
      const cards=[drawCard(),drawCard()];
      const bet=s.initialBet;
      playerBank-=bet;
      const isBJ=handScore(cards)===21;
      playerHands.push({cards, state:isBJ?'blackjack':'playing', bet, insured:false, doubled:false, surrendered:false, splitsDone:0, outcome:null});
    }
    currentHandIndex=playerHands.findIndex(h=>h.state==='playing');
    if(currentHandIndex<0) dealerPlay();
  }

  function hitCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(!h || h.state!=='playing') return;
    h.cards.push(drawCard());
    if(handScore(h.cards)>21){ h.state='busted'; nextHand(); }
  }

  function standCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(!h||h.state!=='playing') return;
    h.state='stood'; nextHand();
  }

  function doubleCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(h && h.state==='playing' && h.cards.length===2 && playerBank>=h.bet){
      playerBank-=h.bet;
      h.bet*=2; h.doubled=true;
      h.cards.push(drawCard());
      h.state = handScore(h.cards)>21?'busted':'stood';
      nextHand();
    }
  }

  function surrenderCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(h && h.state==='playing' && settings.lateSurrender && h.cards.length===2){
      h.surrendered=true; h.state='surrendered';
      playerBank+=h.bet/2; nextHand();
    }
  }

  function insureCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(h && settings.insurance && !h.insured && dealerHand[0].value==='A' && playerBank>=h.bet/2){
      playerBank-=h.bet/2; h.insured=true;
    }
  }

  function canSplit(h){
    return h.cards.length===2 && h.cards[0].value===h.cards[1].value && playerHands.length<settings.maxSplitHands && playerBank>=h.bet;
  }

  function splitCurrentHand(){
    const h=playerHands[currentHandIndex];
    if(canSplit(h)){
      playerBank-=h.bet;
      const card2=h.cards.pop();
      const newHand={cards:[card2,drawCard()], state:'playing', bet:h.bet, insured:false, doubled:false, surrendered:false, splitsDone:h.splitsDone+1, outcome:null};
      h.cards.push(drawCard());
      playerHands.splice(currentHandIndex+1,0,newHand);
    }
  }

  function nextHand(){
    const next = playerHands.findIndex((h,i)=>i>currentHandIndex && h.state==='playing');
    currentHandIndex = next>=0? next : -1;
    if(currentHandIndex<0) dealerPlay();
  }

  function dealerPlay(){
    const dealerBJ=handScore(dealerHand)===21&&dealerHand.length===2;
    resolveHands(dealerBJ);
    if(!dealerBJ){
      while(true){
        const s=handScore(dealerHand);
        if(s>21 || s>17 || (s===17&&!settings.dealerHitsSoft17)) break;
        dealerHand.push(drawCard());
      }
      resolveHands(false);
    }
  }

  function resolveHands(dealerBJ){
    const ds=handScore(dealerHand);
    playerHands.forEach(h=>{
      const ps=handScore(h.cards);
      if(h.state==='blackjack'){
        if(dealerBJ){ h.outcome='Push'; playerBank+=h.bet; }
        else{ h.outcome='Blackjack!'; playerBank+=h.bet*(settings.blackjackPayout+1); }
      } else if(h.insured && dealerBJ){
        h.outcome='Insurance win'; playerBank+=h.bet*2;
      } else if(h.surrendered){ h.outcome='Surrendered'; }
      else if(ps>21){ h.outcome='Busted'; }
      else if(dealerBJ){ h.outcome='Loss'; }
      else if(ps>ds || ds>21){ h.outcome='Win'; playerBank+=h.bet*2; }
      else if(ps===ds){ h.outcome='Push'; playerBank+=h.bet; }
      else{ h.outcome='Loss'; }
    });
  }

  function getGameState(){
    return {dealerHand, playerHands, currentHandIndex, settings, playerBank};
  }

  return {start, hitCurrentHand, standCurrentHand, doubleCurrentHand, surrenderCurrentHand, insureCurrentHand, splitCurrentHand, getGameState};
})();
