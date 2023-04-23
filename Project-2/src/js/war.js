/*
Zaki Bonfoh
war.js
October 24, 2019
This file contains the logic of the game
*/

var body = document.getElementById("body"),
    playContainer = document.getElementById("play"),
    gameContainer = document.getElementById("game"),
    tieSignal = document.getElementById("tieSignal"),
    tieSignalText = document.getElementById("tieSignalText"),
    leftCardContainer = document.getElementById("leftCardContainer"),
    rightCardContainer = document.getElementById("rightCardContainer"),
    yourScoreText = document.getElementById("yourScore"),
    computersScoreText = document.getElementById("computersScore"),
    dealButton = document.getElementById("dealButton");

var cards = [2,3,4,5,6,7,8,9,10,11,12,13],
    allowClick = true,
    tie = false,
    tiePhase = 0,
    yourScore = 0,
    computersScore = 0,
    maxPoints = 20,
    currentWinner;

function init() {

    hide(playContainer, () => {
        show(gameContainer);
    });

}

function newGame() {
    location.reload();
}


function deal() {

    // If the button can be clicked (Used to prevent multiple clicks per second)
    if(allowClick) {
        allowClick = false;

        if(!tie) { // If there is no tie, generate random card numbers and update scores
            updateScores();
        }

        /** Handle a tie **/
        if(yourCardNumber === computersCardNumber && tiePhase === 0) { // If there is a tie, start sequence
            tie = true;
            war();
            tiePhase++;
        }
        else if (tiePhase === 1) { // In this phase, "put down" default cards
            yourCardNumber = 0;
            computersCardNumber = 0;
            tiePhase++;
        }
        else if (tiePhase === 2) { // In this phase, "put down" new cards and update scores
            updateScores();
            tiePhase++;
        }

        // Hide deal / "next turn" button (only for 1 second)
        dealButton.classList.add("hide");

        /** Show cards and scores after a short delay  **/
        window.setTimeout(() => {

            dealButton.innerText = "Next turn";
            displayCard(yourCardNumber, leftCardContainer);
            displayCard(computersCardNumber, rightCardContainer);
            highlightTurnWinner();
            yourScoreText.innerHTML = "Your score: " + yourScore;
            computersScoreText.innerHTML = "Computer's score: " + computersScore;
            checkVictory();

            /** If there is no tie the next turn, go back to normal  **/
            if(yourCardNumber !== computersCardNumber && tiePhase === 3) {
                endWar();
                tiePhase = 0;
                tie = false; // End war sequence
            } else if (yourCardNumber === computersCardNumber && tiePhase === 3) { // If there was a tie and there is another tie the next turn
                tiePhase = 1; // Reset war sequence
            }


        }, 500);

        // Show "Next turn" button after short delay
        window.setTimeout(() => {
            dealButton.classList.remove("hide");
            allowClick = true;
        }, 1000);


    }


}

function checkVictory() {

    if(yourScore === maxPoints || computersScore === maxPoints) {
        dealButton.setAttribute("style", "display:none");
    }
    if(yourScore === maxPoints) {
        tieSignalText.innerText = "You won!";
        show(tieSignal);
    } else if (computersScore === maxPoints) {
        tieSignalText.innerText = "Computer won!";
        show(tieSignal);
    }

}

function updateScores() {

    yourCardNumber = getRandomCardNumber();
    computersCardNumber = getRandomCardNumber();

    if(yourCardNumber > computersCardNumber) {
        yourScore++;
        currentWinner = "you";
    }
    if(yourCardNumber < computersCardNumber) {
        computersScore++;
        currentWinner = "computer";
    }

}

function highlightTurnWinner() {

    if(yourCardNumber > computersCardNumber) {
        yourScoreText.setAttribute("style", "font-weight:bold;");
        computersScoreText.setAttribute("style", "font-weight:normal;");
    }
    if(yourCardNumber < computersCardNumber) {
        yourScoreText.setAttribute("style", "font-weight:normal;");
        computersScoreText.setAttribute("style", "font-weight:bold;");
    }

}

function getRandomCardNumber() {
    return cards[Math.floor(Math.random() * 12)]; // cards[0] to cards[11]
}


function war() { // Do some customizations when there is a tie

    window.setTimeout(() => {
        body.classList.add("war"); // Set the body background color to black
        show(tieSignal) // Show tie signal
    }, 500);

}

function endWar() {
    body.classList.remove("war"); // Reset the default body background color
    tieSignal.classList.remove("show"); // Remove the tie signal
    tieSignal.classList.add("hide");
}

function displayCard(number, element) {
    element.innerHTML = `<img src="src/images/card_${number}.png" alt="card_${number}.png">`;
}

function hide(element, showFunction) {
    element.classList.add("hide");
    window.setTimeout(() => {
        element.setAttribute("style", "display:none;");
        showFunction();
    }, 300)
}

function show (element) {element.classList.add("show"); }