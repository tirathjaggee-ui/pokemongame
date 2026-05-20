// checks if javascript file connected properly
console.log("js file loaded");


// stores first clicked card
let firstCard = undefined;

// stores second clicked card
let secondCard = undefined;

// stops clicking while cards are being checked
let lockBoard = false;

// counts clicks
let clicks = 0;

// counts matched pairs
let pairsMatched = 0;

// total pairs in game
let totalPairs = 0;

// time left
let timeLeft = 0;

// starting time
let totalTime = 0;

// timer
let timerId = undefined;

// checks if game started
let gameStarted = false;

// stores selected difficulty
let difficulty = "easy";


// runs when page loads
$(document).ready(setup);


// sets up buttons
function setup() {

    // default selected button
    $("#easyBtn").addClass("selected");

    // easy button
    $("#easyBtn").on("click", function () {
        difficulty = "easy";
        $(".difficultyBtn").removeClass("selected");
        $("button").removeClass("selected");
        $("#easyBtn").addClass("selected");
    });

    // medium button
    $("#mediumBtn").on("click", function () {
        difficulty = "medium";
        $("button").removeClass("selected");
        $("#mediumBtn").addClass("selected");
    });

    // hard button
    $("#hardBtn").on("click", function () {
        difficulty = "hard";
        $("button").removeClass("selected");
        $("#hardBtn").addClass("selected");
    });

    // start button
    $("#startBtn").on("click", function () {
        startGame();
    });

    // reset button
    $("#resetBtn").on("click", function () {
        startGame();
    });

    // power up button
    $("#powerBtn").on("click", function () {
        alert("Power Up!");
        powerUp();
    });

    // dark theme
    $("#darkBtn").on("click", function () {
        $("body").addClass("dark");
    });

    // light theme
    $("#lightBtn").on("click", function () {
        $("body").removeClass("dark");
    });
}


// starts game
async function startGame() {

    // reset values
    firstCard = undefined;
    secondCard = undefined;
    lockBoard = false;
    clicks = 0;
    pairsMatched = 0;
    gameStarted = true;

    // clear old timer
    clearInterval(timerId);

    // clear old board
    $("#game_grid").html("");

    // remove old grid classes
    $("#game_grid").removeClass("easyGrid");
    $("#game_grid").removeClass("mediumGrid");
    $("#game_grid").removeClass("hardGrid");

    // easy difficulty
    if (difficulty == "easy") {
        totalPairs = 3;
        timeLeft = 100;
        $("#game_grid").addClass("easyGrid");
    }

    // medium difficulty
    else if (difficulty == "medium") {
        totalPairs = 6;
        timeLeft = 200;
        $("#game_grid").addClass("mediumGrid");
    }

    // hard difficulty
    else {
        totalPairs = 12;
        timeLeft = 300;
        $("#game_grid").addClass("hardGrid");
    }

    // save starting time
    totalTime = timeLeft;

    // loading message
    $("#message").html("Loading Pokemon...");

    // load cards
    await loadPokemonCards();

    // update status
    updateStatus();

    // start timer
    startTimer();

    // game message
    $("#message").html("Match all the Pokemon!");
}


// loads pokemon cards
async function loadPokemonCards() {

    // stores pokemon already picked
    let pickedIds = [];

    // stores html
    let cardHTML = "";

    // keeps going until enough pairs are picked
    while (pickedIds.length < totalPairs) {

        // random pokemon id
        let randomId = Math.floor(Math.random() * 150) + 1;

        // only use pokemon once
        if (!pickedIds.includes(randomId)) {

            pickedIds.push(randomId);

            // fetch pokemon from API
            let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

            // convert to json
            let pokemon = await response.json();

            // get pokemon image
            let image = pokemon.sprites.other["official-artwork"].front_default;

            // add pair of cards
            cardHTML += makeCard(randomId, image);
            cardHTML += makeCard(randomId, image);
        }
    }

    // place cards on page
    $("#game_grid").html(cardHTML);

    // shuffle cards
    shuffleCards();

    // add click event to cards
    $(".card").on("click", function () {
        flipCard($(this));
    });
}


// creates one card
function makeCard(id, image) {

    return `
        <div class="card" data-id="${id}">
            <img class="front_face" src="${image}" alt="">
            <img class="back_face" src="back.webp" alt="">
        </div>
    `;
}


// shuffles cards
function shuffleCards() {

    let cards = $(".card");

    for (let i = 0; i < cards.length; i++) {

        let randomOrder = Math.floor(Math.random() * cards.length);

        $(cards[i]).css("order", randomOrder);
    }
}


// flips card
function flipCard(card) {

    // stop if game not started
    if (gameStarted == false) {
        return;
    }

    // stop while checking cards
    if (lockBoard == true) {
        return;
    }

    // stop matched card click
    if (card.hasClass("matched")) {
        return;
    }

    // stop same card click twice
    if (firstCard && card[0] == firstCard[0]) {
        return;
    }

    // flip card
    card.addClass("flip");

    // count click
    clicks++;

    // first card
    if (!firstCard) {
        firstCard = card;
        updateStatus();
        return;
    }

    // second card
    secondCard = card;

    updateStatus();

    checkMatch();
}


// checks matching
function checkMatch() {

    lockBoard = true;

    let firstId = firstCard.attr("data-id");
    let secondId = secondCard.attr("data-id");

    // match
    if (firstId == secondId) {

        // waits before cards turn gray
        setTimeout(function () {

            firstCard.addClass("matched");
            secondCard.addClass("matched");

            firstCard.off("click");
            secondCard.off("click");

            pairsMatched++;

            firstCard = undefined;
            secondCard = undefined;

            lockBoard = false;

            updateStatus();

            checkWin();

        }, 700);
    }

    // no match
    else {

        setTimeout(function () {

            firstCard.removeClass("flip");
            secondCard.removeClass("flip");

            firstCard = undefined;
            secondCard = undefined;

            lockBoard = false;

        }, 1000);
    }
}

// updates status
function updateStatus() {

    $("#clicks").html(clicks);
    $("#pairsMatched").html(pairsMatched);
    $("#totalPairs").html(totalPairs);
    $("#pairsLeft").html(totalPairs - pairsMatched);

    // shows seconds passed
    $("#timer").html(totalTime - timeLeft);

    // shows total time
    $("#totalTime").html(totalTime);
}


// starts timer
function startTimer() {

    timerId = setInterval(function () {

        timeLeft--;

        updateStatus();

        if (timeLeft <= 0) {
            loseGame();
        }

    }, 1000);
}


// checks win
function checkWin() {

    if (pairsMatched == totalPairs) {

        clearInterval(timerId);

        gameStarted = false;

        $("#message").html("You Won!");
    }
}


// loses game
function loseGame() {

    clearInterval(timerId);

    gameStarted = false;

    lockBoard = true;

    $("#message").html("Game Over!");
}


// power up
function powerUp() {

    if (gameStarted == false) {
        return;
    }

    let cards = $(".card");

    for (let i = 0; i < cards.length; i++) {

        if (!$(cards[i]).hasClass("matched")) {
            $(cards[i]).addClass("flip");
        }
    }

    setTimeout(function () {

        for (let i = 0; i < cards.length; i++) {

            if (!$(cards[i]).hasClass("matched")) {
                $(cards[i]).removeClass("flip");
            }
        }

        firstCard = undefined;
        secondCard = undefined;

    }, 2000);
}