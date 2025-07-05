const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const faceCardValue = { 'J': 10, 'Q': 10, 'K': 10, '10': 10 };

let shoe = [];
let playerHands = [];
let dealerHand = [];
let splitHand = false;
let deckCount = 6;
let currentHandIndex = 0;
let discardPile = [];
let discardPileCounter = 0;
let shoeCounter = 0;
let allowDAS = true;

function startGame() {
    const shoeSize = document.getElementById('shoe-size').value;
    const dasCheckbox = document.getElementById('das-setting').checked;

    allowDAS = dasCheckbox;
    deckCount = parseInt(shoeSize);
    createShoe(deckCount);
    document.getElementById('settings-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    document.getElementById('result-message').innerHTML = '';
    playerHands = [];
    dealerHand = [];
    splitHand = false;
    currentHandIndex = 0;
    dealCards();
}

function createShoe(numDecks) {
    shoe = [];
    for (let i = 0; i < numDecks; i++) {
        for (let suit of suits) {
            for (let value of values) {
                shoe.push({ suit, value });
            }
        }
    }
    shuffleShoe();
    shoeCounter = shoe.length;
    discardPileCounter = 0;
}

function shuffleShoe() {
    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }
}

function dealCards() {
    playerHands = [];
    const numHands = parseInt(document.getElementById('num-hands').value);

    for (let i = 0; i < numHands; i++) {
        playerHands.push([drawCard(), drawCard()]);
    }

    dealerHand = [drawCard(), drawCard()];

    shoeCounter = shoe.length;
    displayHands();
    displayCounters();
}

function drawCard() {
    if (shoe.length === 0) {
        alert("The shoe is empty! Please reset the game.");
        return;
    }
    const card = shoe.pop();  // Draw the top card from the shoe
    shoeCounter = shoe.length;  // Update the shoe counter
    return card;
}

function doubleDown(handIndex) {
    if (!playerHands[handIndex] || handIndex !== currentHandIndex) return;

    // Add one card
    const card = drawCard();
    playerHands[handIndex].push(card);

    // Display updated hand with rotated card
    const playerCardsContainer = document.getElementById('player-cards');
    const lastHandDiv = playerCardsContainer.children[handIndex];
    const rotatedCard = document.createElement('img');
    rotatedCard.src = `cards/card_${card.suit}_${formatCardValue(card.value)}.png`;
    rotatedCard.alt = `${card.value} of ${card.suit}`;
    rotatedCard.style.transform = 'rotate(90deg)';
    rotatedCard.style.marginLeft = '4px';
    rotatedCard.style.height = '80px';
    rotatedCard.style.marginTop = '4px';

    lastHandDiv.querySelector('div').appendChild(rotatedCard);

    stand();  // Immediately move to next hand
}


function displayHands() {
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    const dealerTotalContainer = document.getElementById('dealer-total');
    const resultMessageContainer = document.getElementById('result-message');

    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';
    resultMessageContainer.innerHTML = '';
    dealerTotalContainer.textContent = '';

    let delay = 0;
    const dealDelay = 200; // milliseconds between each card

    // Step 1: Deal player cards one-by-one
    playerHands.forEach((hand, handIndex) => {
        const isActive = handIndex === currentHandIndex;
        const handWrapper = document.createElement('div');
        handWrapper.className = `player-hand-container ${isActive ? 'active' : ''}`;
        handWrapper.id = `player-hand-${handIndex}`;
        playerCardsContainer.appendChild(handWrapper);

        hand.forEach((card, cardIndex) => {
            setTimeout(() => {
                const img = document.createElement('img');
                img.className = 'card-image';
                img.src = `cards/card_${card.suit}_${formatCardValue(card.value)}.png`;
                img.alt = `${card.value} of ${card.suit}`;
                img.style.marginRight = '4px';
                handWrapper.appendChild(img);
            }, delay);
            delay += dealDelay;
        });

        // Show total & buttons after cards
        setTimeout(() => {
            const total = calculateTotal(hand);
            const totalDiv = document.createElement('div');
            totalDiv.style.marginTop = '8px';
            totalDiv.textContent = `Total: ${total}`;
            handWrapper.appendChild(totalDiv);

            if (isActive) {
                const canDouble = hand.length === 2;
                const canSplit = hand.length === 2 && hand[0].value === hand[1].value;

                const buttonDiv = document.createElement('div');
                buttonDiv.style.marginTop = '8px';
                buttonDiv.innerHTML = `
                    <button onclick="hit(${handIndex})">Hit</button>
                    <button onclick="stand()">Stand</button>
                    <button onclick="doubleDown(${handIndex})" 
                        ${canDouble ? '' : 'disabled title="You can only double on your first move"'}>Double</button>
                    <button onclick="split()" 
                        ${canSplit ? '' : 'disabled title="You can only split equal pairs (e.g., two 8s)"'}>Split</button>
                `;
                handWrapper.appendChild(buttonDiv);
            }

            if (calculateTotal(hand) > 21) {
                const busted = document.createElement('div');
                busted.style.color = 'red';
                busted.style.marginTop = '8px';
                busted.textContent = 'Busted!';
                handWrapper.appendChild(busted);
            }

        }, delay);
        delay += 150; // slight buffer
    });

    // Step 2: Deal dealer cards
    setTimeout(() => {
        dealerCardsContainer.innerHTML = `
            <div class="card">
                <div class="card-inner" id="dealer-card-0">
                    <div class="card-back"></div>
                    <div class="card-front">
                        <img class="card-image" src="cards/card_${dealerHand[0].suit}_${formatCardValue(dealerHand[0].value)}.png"
                             alt="${dealerHand[0].value} of ${dealerHand[0].suit}" />
                    </div>
                </div>
            </div>
            <div class="card">
                <img class="card-image" src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png"
                     alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />
            </div>
        `;
        dealerTotalContainer.textContent = `Total: ${calculateTotal([dealerHand[1]])}`;
    }, delay);

    displayCounters();
}





function split() {
    const hand = playerHands[currentHandIndex];
    if (hand.length !== 2 || hand[0].value !== hand[1].value) return;

    const card1 = hand[0];
    const card2 = hand[1];

    const newHand1 = [card1, drawCard()];
    const newHand2 = [card2, drawCard()];

    // Replace current hand with the two split hands
    playerHands.splice(currentHandIndex, 1, newHand1, newHand2);
    splitHand = true;

    document.getElementById('split-btn-container').style.display = 'none';
    displayHands();
}


function formatCardValue(value) {
    if (['A', 'J', 'Q', 'K', '10'].includes(value)) {
        return value;
    }
    return value.padStart(2, '0');
}

function calculateTotal(hand) {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
        if (['J', 'Q', 'K'].includes(card.value)) {
            total += 10;
        } else if (card.value === 'A') {
            aceCount += 1;
            total += 11;
        } else {
            total += parseInt(card.value);
        }
    });

    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount -= 1;
    }

    return total;
}

function hit(handIndex) {
    if (!playerHands[handIndex] || handIndex !== currentHandIndex) return;

    playerHands[handIndex].push(drawCard());
    const total = calculateTotal(playerHands[handIndex]);

    if (total > 21) {
        // Automatically advance to the next hand if busted
        if (currentHandIndex < playerHands.length - 1) {
            currentHandIndex++;
            displayHands();
        } else {
            // All hands played, let dealer play
            revealDealerCards();
            dealerTurn();
        }
    } else {
        displayHands();
    }
}

function stand() {
    // If the current hand is the last hand, end the player's turn
    if (currentHandIndex < playerHands.length - 1) {
        currentHandIndex++;  // Move to the next hand
        displayHands();
    } else {
        // All hands are finished, now the dealer will play
        revealDealerCards();
        dealerTurn();
    }
}



function revealDealerCards() {
    const dealerCardsContainer = document.getElementById('dealer-cards');
    dealerCardsContainer.innerHTML = '';
    dealerHand.forEach(card => {
        dealerCardsContainer.innerHTML += `
            <img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" 
                 alt="${card.value} of ${card.suit}" style="margin-right: 4px;" />
        `;
    });

    const dealerTotal = calculateTotal(dealerHand);
    document.getElementById('dealer-total').textContent = `Total: ${dealerTotal}`;
}

function dealerTurn() {
    let dealerTotal = calculateTotal(dealerHand);
    const dealerCardsContainer = document.getElementById('dealer-cards');

    revealDealerCards();

    while (dealerTotal < 17) {
        const card = drawCard();
        dealerHand.push(card);
        dealerCardsContainer.innerHTML += `
            <img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" 
                 alt="${card.value} of ${card.suit}" style="margin-right: 4px;" />
        `;
        dealerTotal = calculateTotal(dealerHand);
        document.getElementById('dealer-total').textContent = `Total: ${dealerTotal}`;
    }

    determineWinner();
}

function determineWinner() {
    const playerTotals = playerHands.map(hand => calculateTotal(hand));
    const dealerTotal = calculateTotal(dealerHand);
    let resultMessage = '';

    playerTotals.forEach((playerTotal, index) => {
        // Handle player busting
        if (playerTotal > 21) {
            resultMessage += `Hand ${index + 1}: Player busts! Dealer wins.<br>`;
        } else if (dealerTotal > 21) {
            resultMessage += `Hand ${index + 1}: Dealer busts! Player wins.<br>`;
        } else if (playerTotal > dealerTotal) {
            resultMessage += `Hand ${index + 1}: Player wins!<br>`;
        } else if (dealerTotal > playerTotal) {
            resultMessage += `Hand ${index + 1}: Dealer wins.<br>`;
        } else {
            resultMessage += `Hand ${index + 1}: It's a tie!<br>`;
        }
    });

    // Add all player and dealer cards to the discard pile at the end of the round
    discardPile.push(...dealerHand);
    playerHands.forEach(hand => discardPile.push(...hand));

    // Update discard pile counter
    discardPileCounter = discardPile.length;

    document.getElementById('result-message').innerHTML = resultMessage;
    displayCounters();
}



function displayCounters() {
    const shoeCounterElement = document.getElementById('shoe-counter');
    const discardPileCounterElement = document.getElementById('discard-pile-counter');

    shoeCounterElement.textContent = `Cards in Shoe: ${shoeCounter}`;
    discardPileCounterElement.textContent = `Cards in Discard Pile: ${discardPileCounter}`;
}
