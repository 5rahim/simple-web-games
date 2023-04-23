/*
Zaki Bonfoh
game.js
November 27, 2019
This file contains the logic of the game
*/

var scene,
    ship,
    asteroids,
    score,
    explosionSound,
    missileSound,
    livesElement,
    scoreElement,
    gameOverContainer,
    gameOverMessage,
    gameOverBackground,
    playContainer,
    background,
    gameState,
    nbAsteroids = 4,
    immunity,
    immunityStateTime,
    lives,
    explosion,
    explosionState,
    frozen,
    frozenStateTime,
    missileArray,
    maxNbMissiles = 50,
    missilesElement,
    miniAsteroids,
    hasDestroyedOneAsteroid,
    rebounds;

function init() {
    gameState = 0;
    score = 0;
    asteroids = [];
    miniAsteroids = [];
    immunity = true;
    immunityStateTime = 60;
    lives = 3;
    frozen = false;
    frozenStateTime = 24;
    missileArray = [];
    hasDestroyedOneAsteroid = false;
    rebounds = 0;

    livesElement = document.getElementById("lives");
    scoreElement = document.getElementById("scoreBar");
    playContainer = document.getElementById("playContainer");
    gameOverMessage = document.getElementById("gameOverMessage");
    gameOverContainer = document.getElementById("gameOverContainer");
    gameOverBackground = document.getElementById("gameOverBackground");
    missilesElement = document.getElementById("missilesCount");

    scene = new Scene();
    scene.setSize(950, 750);
    scene.setPos(0, 0);

    explosionSound = new Sound("src/sounds/explosion.mp3");
    missileSound = new Sound("src/sounds/fire.mp3");
    background = new Sprite(scene, "src/images/background.png", 950, 750);
    background.setPosition(950 / 2, 750 / 2);
    background.setSpeed(0);

    // Create ship, explision, asteroids
    ship = new Ship();
    explosion = new Explosion();
    explosionState = false;
    for (var i = 0; i < nbAsteroids; i++) {
        asteroids[i] = new Asteroid('normal', null, null);
    }


    scene.start();
}

function update() {
    if (gameState === 1) {
        scene.clear();
        ship.updatePosition();
        explosion.updatePosition();
        background.update();
        updateImmunity();
        updateFrozenState();
        for (var i = 0; i < nbAsteroids; i++) {
            // If ship isn't immune, check collisions with asteroids
            if(!immunity && ship.collidesWith(asteroids[i])) {
                explosionSound.play();
                asteroids[i].regenerate();
                updateLives();
            }
            // Check collisions between missiles and asteroids
            for(var l = 0; l < missileArray.length; l++) {
                if(missileArray[l] && missileArray[l].collidesWith(asteroids[i])) {
                    missileArray[l].hide();
                    explosionSound.play();
                    miniAsteroids.push(new Asteroid('mini', asteroids[i].x, asteroids[i].y));
                    miniAsteroids.push(new Asteroid('mini', asteroids[i].x, asteroids[i].y));
                    miniAsteroids.push(new Asteroid('mini', asteroids[i].x, asteroids[i].y));
                    miniAsteroids.push(new Asteroid('mini', asteroids[i].x, asteroids[i].y));
                    asteroids[i].regenerate();
                    updateScore();
                }
            }
            // Check collisions between asteroids
            for(var k = 0; k < nbAsteroids; k++) {
                if(i !== k && asteroids[i].collidesWith(asteroids[k])) { // if asteroids[i] is not asteroids[k], check collision
                    asteroids[i].rebound();
                    rebounds++;
                    if(rebounds >= 30) { // Regenerate an asteroid after 30 rebounds to avoid a bug where 2 asteroids are colliding endlessly
                        asteroids[i].regenerate();
                        rebounds = 0;
                    }
                }
            }
            asteroids[i].update();
            asteroids[i].updateAngle();
        }

        // Mini asteroids
        for(var n = 0; n < miniAsteroids.length; n++) {
            if(miniAsteroids[n]) {

                // Check collisions between missiles and mini asteroids
                for(var y = 0; y < missileArray.length; y++) {
                    if(missileArray[y] && missileArray[y].collidesWith(miniAsteroids[n])) {
                        missileArray[y].hide();
                        miniAsteroids[n].hide();
                    }
                }

                // Check collisions between mini asteroids and ship
                if(!immunity && miniAsteroids[n].collidesWith(ship)) {
                    updateLives();
                    miniAsteroids[n].hide();
                }

                miniAsteroids[n].update();
            }
        }
        // Update each missile in missileArray
        for(var j = 0; j < missileArray.length; j++) {
            if(missileArray[j]) {
                missileArray[j].fire();
                missileArray[j].update();
            }
        }
        ship.update();
        explosion.update();
    }
    decrement();
}

function decrement() { // Decrement score only if the player has destroyed at least one asteroid
    if(hasDestroyedOneAsteroid) {
            score -= .08;
        updateScoreUI();
        if(score <= 0) {
            gameOver(false);
        }
    }
}

function updateScore() {

    if(score === 0)
        hasDestroyedOneAsteroid = true;

    if(score<30)
        score += 10;
    else
        score += 7;

    updateScoreUI();

    if(score >= 100) {
        gameOver(true); // Win
    }

}

function updateScoreUI() {
    if(score >= 0)
        scoreElement.setAttribute("style", "width:" + score + "%");
}


function updateFrozenState() {
    if(frozen && frozenStateTime > 0) { // If the ship is frozen, decrease frozen state time
        frozenStateTime--;
    }
    if(frozenStateTime === 0) { // After 1 second of being frozen,
        ship.regenerate(); // Regenerate the ship
        immunity = true; // Activate temporary immunity
        immunityStateTime = 60; // Reset immunity state time
        frozen = false; // Unfreeze the ship
        explosionState = false; // Hide explosion sprite
        frozenStateTime = 24; // Reset freezing time
    }
}

/**
 * Temporary immunity
 */
function updateImmunity() {
    if(immunity && (immunityStateTime > 0)) { // If the ship is immune, decrease immunity state time
        immunityStateTime--;
    }
    if(immunityStateTime === 0) { // After x seconds of temporary immunity
        immunity = false; // Deactivate immunity
        ship.resetImage(); // Reset normal sprite
        immunityStateTime = 120; // Reset immunity state time
    }
}

/**
 * Called when collision occurs
 * Update lives
 * Display the explosion
 * Change the ship's image
 * Freeze the ship
 * Activate immunity
 */
function updateLives() {
    livesElement.classList.add("animation");
    if(lives > 0) {
        livesElement.setAttribute("style", "background-image: url('src/images/lives"+ (lives - 1) +".png')");
        explosionState = true;
        explosion.boom(); // Show explosion sprite
        immunity = true; // Activate immunity
        ship.immunityImage(); // Change sprite
        frozen = true; // Freeze ship
        ship.setSpeed(0); // Speed 0
        lives--; // Decrease lives
    } else { // If the ship has no more lives
        explosion.boom(); // Show explosion sprite
        gameOver(false);
    }
    setTimeout(() => {
       livesElement.classList.remove("animation");
    }, 500);
}

function gameOver(won) {
    scene.stop();

    if(!won)
        gameOverMessage.innerText = "You lost!";

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