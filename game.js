let playerHands = [];  // Now we will manage multiple hands
let splitHand = false;  // Track whether the player has split

// Initialize the game by setting up the shoe
function startGame() {
    const shoeSize = document.getElementById('shoe-size').value;
    deckCount = parseInt(shoeSize);
    createShoe(deckCount);
    document.getElementById('settings-page').style.display = 'none';
    document.getElementById('game-page').style.display = 'block';
    document.getElementById('result-message').innerHTML = '';  // Clear previous results
    playerHands = [];  // Reset hands
    splitHand = false; // Reset split condition
    dealCards();
}

// Deal initial cards
function dealCards() {
    playerHands = [
        [drawCard(), drawCard()]
    ];
    dealerHand = [drawCard(), drawCard()];
    displayHands();
    
    // Show split button if the player can split
    if (playerHands[0][0].value === playerHands[0][1].value) {
        document.getElementById('split-btn').style.display = 'inline-block';
    } else {
        document.getElementById('split-btn').style.display = 'none';
    }
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
    
    // Display player's hands
    playerHands.forEach((hand, index) => {
        hand.forEach(card => {
            playerCardsContainer.innerHTML += `<img src="cards/card_${card.suit}_${formatCardValue(card.value)}.png" alt="${card.value} of ${card.suit}" />`;
        });
        playerCardsContainer.innerHTML += `<br>Hand ${index + 1}: Total: ${calculateTotal(hand)}<br>`;
    });

    // Display dealer's cards (hide the first card initially)
    dealerCardsContainer.innerHTML += `<img src="cards/card_back.png" alt="Dealer's hidden card" />`; // Hide first card
    dealerCardsContainer.innerHTML += `<img src="cards/card_${dealerHand[1].suit}_${formatCardValue(dealerHand[1].value)}.png" alt="${dealerHand[1].value} of ${dealerHand[1].suit}" />`; // Show second card
    
    // Display totals
    playerTotalContainer.textContent = `Total: ${calculateTotal(playerHands[0])}`;
    dealerTotalContainer.textContent = `Total: ${calculateTotal([dealerHand[1]])}`; // Show total for face-up card only
}

// Player hits (draws a card)
function hit(handIndex) {
    playerHands[handIndex].push(drawCard());
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

// Split the hand if the player has two identical cards
function split() {
    if (playerHands[0].length === 2 && playerHands[0][0].value === playerHands[0][1].value) {
        // Create a second hand
        const secondHand = [playerHands[0].pop(), drawCard()];
        playerHands.push(secondHand);
        splitHand = true;
    }
    displayHands();
    document.getElementById('split-btn').style.display = 'none'; // Hide split button after splitting
}

// Dealer's turn: Dealer hits until total is 17 or higher
function dealerTurn() {
    let dealerTotal = calculateTotal([dealerHand[1]]); // Start with only the face-up card
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
