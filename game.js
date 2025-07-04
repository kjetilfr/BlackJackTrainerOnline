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

function startGame() {
    const shoeSize = document.getElementById('shoe-size').value;
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


function displayHands() {
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    const dealerTotalContainer = document.getElementById('dealer-total');
    const resultMessageContainer = document.getElementById('result-message');

    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';
    resultMessageContainer.innerHTML = '';

    // Display the player's hands
    playerHands.forEach((hand, index) => {
        let handHTML = `<div style="margin-bottom: 16px;">`;

        // Display cards in the player's hand
        hand.forEach(card => {
            handHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" 
                         alt="${card.value} of ${card.suit}" style="margin-right: 4px;" />`;
        });

        const total = calculateTotal(hand);

        // Display the total for the hand below the cards
        handHTML += `<div style="margin-top: 8px;">Total: ${total}</div>`;

        // Display buttons for the current hand only if the hand is not busted and it's the active hand
        if (total <= 21 && index === currentHandIndex) {
            handHTML += `
                <div style="margin-top: 8px;">
                    <button onclick="hit(${index})">Hit</button>
                    <button onclick="stand()">Stand</button>
                </div>
            `;
        } else if (total > 21) {
            // If the hand is busted, disable further action for this hand
            handHTML += `<div style="margin-top: 8px; color: red;">Busted!</div>`;
        }

        handHTML += `</div>`;  // Close the hand block

        playerCardsContainer.innerHTML += handHTML;
    });

    // Display the dealer's hand (only showing the second card initially)
    dealerCardsContainer.innerHTML = `
        <img src="cards/card_back.png" alt="Dealer's hidden card" style="margin-right: 4px;" />
        <img src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png" 
             alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />
    `;

    // Initially show only the total for the dealer's visible card
    dealerTotalContainer.textContent = `Total: ${calculateTotal([dealerHand[1]])}`;
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
