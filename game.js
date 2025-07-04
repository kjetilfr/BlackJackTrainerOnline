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
    const playerTotalContainer = document.getElementById('player-total');
    const dealerTotalContainer = document.getElementById('dealer-total');

    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';

    // Display player cards
    playerHand.forEach(card => {
        playerCardsContainer.innerHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" alt="${card.value} of ${card.suit}" />`;
    });

    // Display dealer's cards (hide the first card)
    dealerCardsContainer.innerHTML += `<img src="cards/card_back.png" alt="Dealer's hidden card" />`; // Hide first card
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png" alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />`; // Show second card

    // Display totals
    playerTotalContainer.textContent = `Total: ${calculateTotal(playerHand)}`;
    dealerTotalContainer.textContent = `Total: ${calculateTotal(dealerHand)}`;
}

// Format the card value (prepend '0' for values 2-9, except for 10)
function formatCardValue(value) {
    if (value > 0 && value < 10) {
        return value; // No leading zero needed for 10 or Facecards
    }
    return value.padStart(2, '0'); // Add leading zero for 2-9
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
            total += 11; // Initially treat Ace as 11
        } else {
            total += parseInt(card.value); // Add the card's value
        }
    });

    // Adjust for Aces: If the total is over 21 and we have Aces, treat them as 1
    while (total > 21 && aceCount > 0) {
        total -= 10; // Adjust Ace from 11 to 1
        aceCount -= 1;
    }

    return total;
}

// Player hits (draws a card)
function hit() {
    playerHand.push(drawCard());
    displayHands();
}

// Player stands (ends their turn)
function stand() {
    // Reveal dealer's first card
    const dealerCardsContainer = document.getElementById('dealer-cards');
    dealerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[0].suit}_${formatCardValue(dealerHand[0].value)}.png" alt="${dealerHand[0].value} of ${dealerHand[0].suit}" />`; // Show first card
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png" alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />`; // Show second card

    // Dealer's turn logic
    dealerTurn();
}

// Dealer's turn: Dealer hits until total is 17 or higher
function dealerTurn() {
    let dealerTotal = calculateTotal(dealerHand);
    while (dealerTotal < 17) {
        dealerHand.push(drawCard());
        dealerTotal = calculateTotal(dealerHand);
        displayHands(); // Update display with each new card drawn
    }

    // After dealer stands, check who wins
    determineWinner();
}

// Determine the winner based on hand totals
function determineWinner() {
    const playerTotal = calculateTotal(playerHand);
    const dealerTotal = calculateTotal(dealerHand);

    let resultMessage = '';

    if (playerTotal > 21) {
        resultMessage = 'Player busts! Dealer wins.';
    } else if (dealerTotal > 21) {
        resultMessage = 'Dealer busts! Player wins.';
    } else if (playerTotal > dealerTotal) {
        resultMessage = 'Player wins!';
    } else if (dealerTotal > playerTotal) {
        resultMessage = 'Dealer wins!';
    } else {
        resultMessage = 'It\'s a tie!';
    }

    alert(resultMessage);
}
