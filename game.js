// Array for card values and suits
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let shoe = [];
let playerHand = [];
let dealerHand = [];
let deckCount = 6; // Default shoe size (6 decks)

// Initialize the game by setting up the shoe
function startGame() {
    const shoeSize = document.getElementById('shoe-size').value;
    deckCount = parseInt(shoeSize);
    createShoe(deckCount);
    document.getElementById('settings-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    dealCards();
}

// Create the shoe with the specified number of decks
function createShoe(numDecks) {
    shoe = [];
    for (let i = 0; i < numDecks; i++) {
        for (let suit of suits) {
            for (let value of values) {
                shoe.push({ suit: suit, value: value });
            }
        }
    }
    shuffleShoe();
}

// Shuffle the shoe
function shuffleShoe() {
    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }
}

// Deal initial cards
function dealCards() {
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    displayHands();
}

// Draw a card from the shoe
function drawCard() {
    return shoe.pop();
}

// Display the player's and dealer's hands
function displayHands() {
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');

    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';

    // Display player cards
    playerHand.forEach(card => {
        playerCardsContainer.innerHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" alt="${card.value} of ${card.suit}" />`;
    });

    // Display dealer cards
    dealerHand.forEach(card => {
        dealerCardsContainer.innerHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" alt="${card.value} of ${card.suit}" />`;
    });
}

// Format the card value (prepend '0' for values 2-9, except for 10)
function formatCardValue(value) {
    if (value === '10') {
        return value; // No leading zero needed for 10
    }
    return value.padStart(2, '0'); // Add leading zero for 2-9
}

// Player hits (draws a card)
function hit() {
    playerHand.push(drawCard());
    displayHands();
}

// Player stands (ends their turn)
function stand() {
    // Implement dealer logic here (dealer will draw until reaching 17 or more)
    alert('Player stands!');
    // TODO: Implement game over logic and winner determination
}

