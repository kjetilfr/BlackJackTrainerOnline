// Array for card values and suits
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
// Map face cards (J, Q, K) to their numeric values for splitting purposes
const faceCardValue = { 'J': 10, 'Q': 10, 'K': 10, '10': 10 };

let shoe = [];
let playerHands = [];  // Now we will manage multiple hands
let dealerHand = [];
let splitHand = false;  // Track whether the player has split
let deckCount = 6; // Default shoe size (6 decks)

// Initialize the game by setting up the shoe
function startGame() {
    const shoeSize = document.getElementById('shoe-size').value;
    deckCount = parseInt(shoeSize);
    createShoe(deckCount);  // Create the shoe when starting the game
    document.getElementById('settings-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    document.getElementById('result-message').innerHTML = '';  // Clear previous results
    playerHands = [];  // Reset hands
    splitHand = false; // Reset split condition
    dealCards();  // Deal initial cards
}

// Create the shoe (deck) based on the number of decks selected
function createShoe(numDecks) {
    shoe = [];  // Clear any previous cards in the shoe
    for (let i = 0; i < numDecks; i++) {
        for (let suit of suits) {
            for (let value of values) {
                shoe.push({ suit: suit, value: value });
            }
        }
    }
    shuffleShoe();  // Shuffle the deck after creating it
}

// Shuffle the shoe (deck)
function shuffleShoe() {
    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];  // Swap the elements
    }
}

// Deal initial cards
function dealCards() {
    playerHands = [
        [drawCard(), drawCard()]
    ];
    dealerHand = [drawCard(), drawCard()];
    displayHands();

    // Show split button if the player can split (two identical cards)
    if (playerHands[0][0].value === playerHands[0][1].value) {
        document.getElementById('split-btn').style.display = 'inline-block';
    } else {
        document.getElementById('split-btn').style.display = 'none';
    }
}

// Draw a card from the shoe
function drawCard() {
    return shoe.pop();  // Pop a card off the shoe
}

// Display the player's and dealer's hands
function displayHands() {
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    const playerTotalContainer = document.getElementById('player-total');
    const dealerTotalContainer = document.getElementById('dealer-total');

    playerCardsContainer.innerHTML = '';  // Clear current cards
    dealerCardsContainer.innerHTML = '';  // Clear current dealer cards

    // Display all player's hands
    playerHands.forEach((hand, index) => {
        hand.forEach(card => {
            playerCardsContainer.innerHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" alt="${card.value} of ${card.suit}" />`;
        });
        playerCardsContainer.innerHTML += `<br>Hand ${index + 1}: Total: ${calculateTotal(hand)}<br>`;
    });

    // Display dealer's cards (hide the first card initially)
    dealerCardsContainer.innerHTML += `<img src="cards/card_back.png" alt="Dealer's hidden card" />`;  // Hide first card
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png" alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />`;  // Show second card

    // Display totals for the player and dealer (face-up card only for dealer)
    playerTotalContainer.textContent = `Total: ${calculateTotal(playerHands[0])}`;
    dealerTotalContainer.textContent = `Total: ${calculateTotal([dealerHand[1]])}`;
}

// Format the card value (prepend '0' for values 2-9, except for 10, J, Q, K, A)
function formatCardValue(value) {
    if (['A', 'J', 'Q', 'K', '10'].includes(value)) {
        return value;  // No leading zero for A, J, Q, K, or 10
    }
    return value.padStart(2, '0');  // Add leading zero for 2-9
}

// Calculate the total value of a hand
function calculateTotal(hand) {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
        if (['J', 'Q', 'K'].includes(card.value)) {
            total += 10;
        } else if (card.value === 'A') {
            aceCount += 1;
            total += 11;  // Initially treat Ace as 11
        } else {
            total += parseInt(card.value);  // Add the card's value
        }
    });

    // Adjust for Aces: If the total is over 21 and we have Aces, treat them as 1
    while (total > 21 && aceCount > 0) {
        total -= 10;  // Adjust Ace from 11 to 1
        aceCount -= 1;
    }

    return total;
}

// Player hits (draws a card) on a specific hand
function hit(handIndex) {
    playerHands[handIndex].push(drawCard());
    displayHands();
}

// Player stands (ends their turn)
function stand() {
    // Reveal dealer's first card
    const dealerCardsContainer = document.getElementById('dealer-cards');
    dealerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[0].suit}_${formatCardValue(dealerHand[0].value)}.png" alt="${dealerHand[0].value} of ${dealerHand[0].suit}" />`;  // Show first card
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png" alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />`;  // Show second card

    // Dealer's turn logic
    dealerTurn();
}

// Function to check if two cards can be split (if they have the same value)
function canSplit(card1, card2) {
    return getCardValue(card1) === getCardValue(card2);
}

// Helper function to get the numeric value of a card
function getCardValue(card) {
    if (['J', 'Q', 'K', '10'].includes(card.value)) {
        return 10;
    }
    return parseInt(card.value); // For numbered cards 2-9
}

// Split the hand if the player has two identical value cards
function split() {
    // Ensure the player can only split if they have two cards and they are of the same value
    if (playerHands[0].length === 2 && canSplit(playerHands[0][0], playerHands[0][1])) {
        // Create a second hand
        const secondHand = [playerHands[0].pop(), drawCard()];
        playerHands.push(secondHand);
        splitHand = true;
    }
    displayHands();
    document.getElementById('split-btn').style.display = 'none';  // Hide split button after splitting
}


// Dealer's turn: Dealer hits until total is 17 or higher
function dealerTurn() {
    let dealerTotal = calculateTotal([dealerHand[1]]);  // Start with only the face-up card
    const dealerCardsContainer = document.getElementById('dealer-cards');

    // Draw cards for the dealer while the total is below 17
    while (dealerTotal < 17) {
        const card = drawCard();
        dealerHand.push(card);
        dealerCardsContainer.innerHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" alt="${card.value} of ${card.suit}" />`;
        dealerTotal = calculateTotal(dealerHand);
        // Update the dealer's total after each card is drawn
        document.getElementById('dealer-total').textContent = `Total: ${dealerTotal}`;
    }

    // After dealer stands, check who wins
    determineWinner();
}

// Determine the winner based on hand totals
function determineWinner() {
    const playerTotals = playerHands.map(hand => calculateTotal(hand));
    const dealerTotal = calculateTotal(dealerHand);

    let resultMessage = '';

    playerTotals.forEach((playerTotal, index) => {
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

    // Show result message on the screen
    document.getElementById('result-message').innerHTML = `<h3>${resultMessage}</h3>`;
}
