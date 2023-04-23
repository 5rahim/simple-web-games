/*
Zaki Bonfoh
entities.js
November 27, 2019
This file contains the logic of the game
*/

/**
 * Explosion
 */
function Explosion() {
    tExplosion = new Sprite(scene, "src/images/explosion.png", 124, 123);

    // Explosion sprite follows the ship
    // If there's no collision, hide the sprite
    tExplosion.updatePosition = function () {
        !explosionState && tExplosion.hide();
        this.setPosition(ship.x, ship.y);
    };
    // Show the explision sprite
    tExplosion.boom = function () {
      this.show();
    };
    return tExplosion;
}


/**
 * Spaceship
 */
function Ship() {
    tShip = new Sprite(scene, "src/images/ship2.png", 71 - 10, 79.5 - 10);
    tShip.setImgAngle(180);
    tShip.setSpeed(1);
    tShip.maxSpeed = 9;
    tShip.minSpeed = .5;
    tShip.resetImage = function() {
      tShip.changeImage("src/images/ship.png");
    };
    tShip.immunityImage = function() {
        tShip.changeImage("src/images/ship2.png");
    };
    tShip.updatePosition = function () {
        if (!frozen && keysDown[K_LEFT]) {
            this.changeAngleBy(-10);
        }
        if (!frozen && keysDown[K_RIGHT]) {
            this.changeAngleBy(10);
        }
        if (!frozen && keysDown[K_UP]) {
            this.changeSpeedBy(1);
            if (this.speed > this.maxSpeed) {
                this.setSpeed(this.maxSpeed);
            }
        }
        if (!frozen && keysDown[K_DOWN]) {
            this.changeSpeedBy(-.5);
            if (this.speed < this.minSpeed) {
                this.setSpeed(this.minSpeed);
            }
        }
        // If ship isn't frozen, immune and the maximum number of missiles has not been reached
        if (!frozen && !immunity && keysDown[K_SPACE] && missileArray.length <= maxNbMissiles) {
            // Create a new missile in missileArray, missileArray is updated in the update() function
            missileArray[missileArray.length + 1] = new Missile();
            missileSound.play();
            // Change UI text
            missilesElement.innerText = (maxNbMissiles - missileArray.length) >= 0 ? maxNbMissiles - missileArray.length : 0;
            // Empty the missileArray after 4 seconds if maximum is reached to avoid updating too many missiles
            if(missileArray.length === maxNbMissiles) {
                setTimeout(() => {
                    missileArray = [];
                    missilesElement.innerText = maxNbMissiles;
                }, 3000)
            }
        }
    };
    tShip.regenerate = function () {
        this.changeAngleBy((Math.random() * 360) - 45);
        this.setPosition(Math.random() * tShip.cWidth, 0);
    };
    return tShip;
}

/**
 * Asteroid
 */
function Asteroid(type, positionX, positionY) {
    var width;
    var height;
    var size;
    // Set size
    if(type === 'normal') {
        if(Math.random() < .5) {
            width = (66*1.1);
            height = (49.5*1.1);
            size = 1;
        } else {
            width = (66*1.4);
            height = (49.5*1.4);
            size = 0;
        }
    }
    // Set sprite
    tAsteroid = type === 'normal' ? new Sprite(scene, "src/images/asteroid.png", width, height) : new Sprite(scene, "src/images/asteroid2.png", 20, 20);

    if(type === 'normal') {
        tAsteroid.setPosition(Math.random() * tAsteroid.cWidth, Math.random() * tAsteroid.cHeight);
    } else {
        tAsteroid.setPosition(positionX, positionY); // Last position of the destroyed asteroid
        tAsteroid.setBoundAction(DIE);
        tAsteroid.setSpeed(7);
    }

    size === 0 ? tAsteroid.setSpeed(3) : tAsteroid.setSpeed(6); // Different speeds according to size

    tAsteroid.changeAngleBy((Math.random() * 360) - 45);
    tAsteroid.regenerate = function () {
        this.changeAngleBy((Math.random() * 360) - 45);
        this.setPosition(Math.random() * tAsteroid.cWidth, 0);
    };
    tAsteroid.rebound = function () {
        this.changeAngleBy(180);
        tAsteroid.updateAngle();
    };
    tAsteroid.updateAngle = function () {
        this.changeImgAngleBy(Math.random() * (10 - 5 + 1)) + 5;
    };
    return tAsteroid;
}

/**
 * Missile
 */
function Missile(){
    tMissile = new Sprite(scene, "src/images/missile.png", 32/2, 102/2);
    tMissile.setPosition(ship.x, ship.y);
    tMissile.setAngle(ship.getImgAngle() - 90);
    tMissile.setImgAngle(ship.getImgAngle());
    tMissile.setBoundAction(DIE);

    tMissile.fire = function() {
        this.setSpeed(25);
    };

    return tMissile;
}
