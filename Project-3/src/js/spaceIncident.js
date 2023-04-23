/*
Zaki Bonfoh
spaceIncident.js
November 14, 2019
This file contains the logic of the game
*/

var scene,
    astronaut,
    screws,
    score,
    collectSound,
    scoreElement,
    gameOverContainer,
    gameOverMessage,
    gameOverBackground,
    oxygenBar,
    oxygen,
    oxygenLevelElement,
    playContainer,
    background,
    gameState,
    nbScrews = 4,
    winningScore = 15;

function Oxygen() {
    this.level = 100;
    this.update = function () {
        this.level -= 0.1;
        oxygenBar.setAttribute("style", "width:" + this.level + "%");
        oxygenLevelElement.innerText = Math.round(this.level) + "%";
        if(this.level <= 0) { // If oxygen level is less than or equal to 0, stop game
            gameOver();
        }
    };
    return this;
}

function Astronaut() {
    tAstronaut = new Sprite(scene, "src/images/astronaut.png", 60, 60);
    tAstronaut.setSpeed(1);
    tAstronaut.maxSpeed = 7;
    tAstronaut.minSpeed = -5;
    tAstronaut.updatePosition = function () {
        if (keysDown[K_LEFT]) {
            this.changeAngleBy(-10);
        }
        if (keysDown[K_RIGHT]) {
            this.changeAngleBy(10);
        }
        if (keysDown[K_UP]) {
            this.changeSpeedBy(1);
            if (this.speed > this.maxSpeed) {
                this.setSpeed(this.maxSpeed);
            }
        }
        if (keysDown[K_DOWN]) {
            this.changeSpeedBy(-1);
            if (this.speed < this.minSpeed) {
                this.setSpeed(this.minSpeed);
            }
        }
    };
    return tAstronaut;
}

function Screw() {
    var image = Math.random() < 0.5 ? "bolt.png" : "screw.png";
    tScrew = new Sprite(scene, "src/images/" + image, 15, 15);
    tScrew.setPosition(Math.random() * tScrew.cWidth, 0);
    tScrew.changeAngleBy((Math.random() * 360) - 45);
    tScrew.setSpeed(Math.random() * (7 - 5) + 5);
    tScrew.regenerate = function () {
        this.changeAngleBy((Math.random() * 360) - 45);
        this.setPosition(Math.random() * tScrew.cWidth, 0);
    };
    tScrew.rebounce = function () {
        this.changeAngleBy((Math.random() * 360) - 45);
    };
    return tScrew;
}

function init() {
    gameState = 0;
    score = 0;
    screws = Array(nbScrews);

    scoreElement = document.getElementById("scoreValue");
    oxygenBar = document.getElementById("oxygenBar");
    oxygenLevelElement = document.getElementById("oxygenLevel");
    playContainer = document.getElementById("playContainer");
    gameOverMessage = document.getElementById("gameOverMessage");
    gameOverContainer = document.getElementById("gameOverContainer");
    gameOverBackground = document.getElementById("gameOverBackground");

    scene = new Scene();
    scene.setBG('#070f2b');
    scene.setSize(800, 500);
    scene.setPos(0, 0);

    collectSound = new Sound("src/sounds/collect.wav");
    background = new Sprite(scene, "src/images/background.png", 800, 500);
    background.setPosition(800 / 2, 500 / 2);
    background.setSpeed(0);

    astronaut = new Astronaut();
    oxygen = new Oxygen();
    for (var i = 0; i < nbScrews; i++) {
        screws[i] = new Screw();
    }


    scene.start();
}

function update() {
    if (gameState === 1) {
        scene.clear();
        astronaut.updatePosition();
        background.update();
        oxygen.update();
        for (var i = 0; i < nbScrews; i++) {
            if(astronaut.collidesWith(screws[i])) {
                collectSound.play();
                screws[i].regenerate();
                updateScore();
            }
            screws[i].update();
        }
        astronaut.update();
    }
}

function updateScore() {
    score += 1;
    scoreElement.innerText = score;
    scoreElement.classList.add("animation");
    setTimeout(() => {
       scoreElement.classList.remove("animation");
    }, 500);
}

function gameOver() {

    gameOverMessage.innerText = (score >= winningScore) ? "Mission Accomplished!" : "Mission failed :(";
    var color = (score >= winningScore) ? "#145742" : "#571414";
    gameOverBackground.setAttribute("style", "background-color: " + color + "!important;");

    //console.log("GAME OVER");
    scene.stop();
    oxygenBar.setAttribute("style", "width:0%");
    setTimeout(() => {
        gameOverContainer.setAttribute("style", "display:flex !important;");
    }, 500)
}


function play() {

    playContainer.classList.add("hide");
    setTimeout(() => {
        playContainer.setAttribute("style", "display:none;");
        gameState = 1;
    }, 150);

}

function playAgain() {
    window.location.reload();
}