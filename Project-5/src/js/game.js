/*
 * Zaki Bonfoh
 * game.js
 * December 12, 2019
 * This file contains the logic of the game
 */

var scene,
    background,
    gameState,
    sceneWidth,
    sceneHeight,
    lives,
    explosionState,
    immunity,
    immunityStateTime,
    frozen,
    frozenStateTime,
    playerTank,
    enemyTank,
    explosion,
    groundLevel,
    BULLETS,
    ENEMYBULLETS,
    maxBullets,
    bulletCountElement,
    hp,
    enemyHp,
    hpElement,
    hpBarElement,
    enemyHpElement,
    enemyHpBarElement,
    car,
    impact,
    bomb,
    bonus,
    bonusElement,
    bonusActive,
    bonusTimeout,
    playContainer,
    damagePoints = {},
    mode = {},
    gameOverMessage,
    gameOverContainer,
    gameOverBackground,
    explosionSound,
    bonusSound;

function playMode(m) {
    if(m === 'normal') {
        damagePoints.toEnemy = .5;
        damagePoints.fromBomb = 20;
        damagePoints.fromCar = 15;
        damagePoints.fromEnemy = 5;
        mode.tTime = 24;
        mode.vSpeed = 3;
        mode.bombReset = 5000;
        mode.carReset = 5000;
        mode.carSpeed = -7;
        mode.bombSpeed = 7;
    } else if (m === 'hard') {
        damagePoints.toEnemy = .4;
        damagePoints.fromBomb = 20;
        damagePoints.fromCar = 20;
        damagePoints.fromEnemy = 8;
        mode.tTime = 24;
        mode.vSpeed = 5;
        mode.bombReset = 3000;
        mode.carReset = 5000;
        mode.carSpeed = -8.5;
        mode.bombSpeed = 8.5;
    } else if (m === 'easy') {
        damagePoints.toEnemy = 1.5;
        damagePoints.fromBomb = 10;
        damagePoints.fromCar = 8;
        damagePoints.fromEnemy = 2;
        mode.tTime = 48;
        mode.vSpeed = 1.5;
        mode.bombReset = 8000;
        mode.carReset = 8000;
        mode.carSpeed = -5;
        mode.bombSpeed = 5;
    }

    playerTank = new PlayerTank();
    enemyTank = new EnemyTank();
    car = new Car();
    impact = new Impact();
    bomb = new Bomb();
    explosion = new Explosion();
    bonus = new Bonus();

    setTimeout(function () {
        car.moving = true;
        bomb.moving = true;
    }, 4000);

    setTimeout(function () {
        bonus.moving = true;
    }, 6000);

    play()
}

function init() {
    lives = 3;
    sceneWidth = 1068;
    sceneHeight = 600;
    gameState = 0;
    groundLevel = 490;
    BULLETS = [];
    ENEMYBULLETS = [];
    maxBullets = 60;
    explosionState = 0;
    immunity = false;
    immunityStateTime = 60;
    frozen = false;
    frozenStateTime = 24;
    hp = 100;
    enemyHp = 100;
    bonusActive = false;
    bonusTimeout;

    damagePoints;
    mode;

    playContainer = document.getElementById("playContainer");
    bulletCountElement = document.getElementById("bulletCount");
    hpElement = document.getElementById("hp");
    hpBarElement = document.getElementById("hpBar");
    enemyHpElement = document.getElementById("enemyHp");
    enemyHpBarElement = document.getElementById("enemyHpBar");
    bonusElement = document.getElementById("bonus");
    gameOverMessage = document.getElementById("gameOverMessage");
    gameOverContainer = document.getElementById("gameOverContainer");
    gameOverBackground = document.getElementById("gameOverBackground");
    bulletCountElement.innerText = maxBullets;

    scene = new Scene();
    scene.setSize(sceneWidth, sceneHeight);
    scene.setPos(0, 0);

    explosionSound = new Sound('src/sounds/explosion.mp3');
    bonusSound = new Sound('src/sounds/collect.wav');

    background = new Sprite(scene, "src/images/background.png", sceneWidth, sceneHeight);
    background.setPosition(sceneWidth / 2, sceneHeight / 2);
    background.setSpeed(0);

    scene.start();
}

/**
 * Update
 */
function update() {
    if (gameState === 1) {
        scene.clear();

        background.update();
        playerTank.checkKeys();
        playerTank.update();
        enemyTank.turret.update();
        enemyTank.update();
        enemyTank.move();
        car.update();
        car.move();
        impact.update();
        bomb.update();
        bomb.move();
        explosion.update();
        bonus.update();
        bonus.move();

        /**
         * Check collisions
         */
        for(var i = 0; i < BULLETS.length; i++) {
            if(BULLETS[i] && BULLETS[i].collidesWith(enemyTank)) {
                animateEnemyHp();
                BULLETS[i].hide();
                enemyHp -= damagePoints.toEnemy;
            }
            if(BULLETS[i] && BULLETS[i].collidesWith(car)) {
                impact.boom({ x: car.x, y: car.y });
                BULLETS[i].hide();
                car.destroy();
                explosionSound.play();
            }
            if(BULLETS[i] && BULLETS[i].collidesWith(bomb)) {
                impact.boom({ x: car.x, y: car.y });
                BULLETS[i].hide();
                bomb.moving = false;
                bomb.hide();
                bomb.hidden = true;
                impact.boom({ x: (bomb.x+20), y: bomb.y });
            }
        }
        for(var j = 0; j < ENEMYBULLETS.length; j++) {
            if(ENEMYBULLETS[j] && ENEMYBULLETS[j].collidesWith(playerTank)) {
                ENEMYBULLETS[j].hide();
                if(!immunity) hp -= damagePoints.fromEnemy;
            }
        }
        if(car.collidesWith(playerTank)) {
            if(!immunity) freezeTemporarily();
            impact.boom({ x: car.x, y: car.y });
            car.destroy();
            if(!immunity) hp -= damagePoints.fromCar;
            explosionSound.play();
            if(!immunity) {
                playerTank.setSpeed(-4);
                setTimeout(() => {
                    playerTank.setSpeed(0);
                },600)
            }
        }
        if(bomb.collidesWith(playerTank)) {
            bomb.reset();
            bomb.hidden = true;
            if(!immunity) freezeTemporarily();
            if(!immunity) hp -= damagePoints.fromBomb;
            explosionSound.play();
        }
        if(bonus.collidesWith(playerTank)) {
            bonus.reset();
            randomBonus();
            bonusSound.play();
        }

        if(!bonusActive) window.clearTimeout(bonusTimeout);
        updateBullets();
        updateHp();

    }

}

/**
 * Random bonus
 */
function randomBonus() {
    Math.random() < .5 ? bonusHp() : ( Math.random() < .5 ? bonusNoDamage() : bonusUnlimitedBullets());
    animateBonus();
}

function bonusHp()  {
    bonusActive = true;
    bonusElement.innerText = '+20 HP';
    hp += 20;
    bonusTimeout = setTimeout(function () {
        bonusActive = false;
        bonusElement.innerText = 'No bonus';
    }, 2000)
}

function bonusNoDamage() {
    bonusActive = true;
    bonusElement.innerText = 'No damage';
    playerTank.setImage('src/images/tank_gold.png');
    immunity = true;
    bonusTimeout = setTimeout(function () {
        playerTank.setImage('src/images/tank.png');
        bonusActive = false;
        immunity = false;
        bonusElement.innerText = 'No bonus';
    }, 10000)
}

function bonusUnlimitedBullets() {
    bonusActive = true;
    bonusElement.innerText = 'Unlimited bullets';
    maxBullets = 500;
    BULLETS.length = [];
    bulletCountElement.innerText = 500;
    bonusTimeout = setTimeout(function () {
        maxBullets = 30;
        BULLETS = [];
        bulletCountElement.innerText = 30;
        bonusActive = false;
        bonusElement.innerText = 'No bonus';
    }, 10000)
}

function animateBonus() {
    bonusElement.classList.add("animation");
    setTimeout(() => {
        bonusElement.classList.remove("animation");
    }, 500);
}
function animateEnemyHp() {
    enemyHpElement.classList.add("animation");
    setTimeout(() => {
        enemyHpElement.classList.remove("animation");
    }, 500);
}

/**
 * Freeze player tempararily
 */
function freezeTemporarily() {
    frozen = true;
    setTimeout(function () {
        frozen = false;
    }, 1000)
}

/**
 * Update HP
 */
function updateHp() {
    if(hp > 100) hp = 100;
    if(hp < 0) hp = 0;
    if(hp < 50) hpBarElement.classList.add('orange');
    if(enemyHp < 50) enemyHpBarElement.classList.add('orange');
    if(hp >= 50) hpBarElement.classList.remove('orange');
    hpBarElement.setAttribute("style", "width:" + hp + "%");
    enemyHpBarElement.setAttribute("style", "width:" + enemyHp + "%");
    if(hp <= 0) gameOver(false);
    if(enemyHp <= 0) gameOver(true);
}


/**
 * Update Bullets
 */
function updateBullets() {
    for(var i = 0; i < BULLETS.length; i++) {
        if(BULLETS[i]) {
            BULLETS[i].fire();
            BULLETS[i].checkGravity();
            BULLETS[i].update();
        }
    }
    for(var j = 0; j < ENEMYBULLETS.length; j++) {
        if(ENEMYBULLETS[j]) {
            ENEMYBULLETS[j].fire();
            ENEMYBULLETS[j].checkGravity();
            ENEMYBULLETS[j].update();
        }
    }
}

/**
 * Game Over
 */
function gameOver(won) {

    var color = won ? "#145742" : "#571414";
    gameOverBackground.setAttribute("style", "background-color: " + color + "!important;");

    if(!won)
        gameOverMessage.innerText = "You lost!";

    setTimeout(() => {
        scene.stop();
        gameOverContainer.setAttribute("style", "display:flex !important;");
    }, 500)
}

/**
 * Play
 */
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