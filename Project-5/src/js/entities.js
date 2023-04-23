var tankW = 1067 / 13,
    tankH = 725 / 13,
    turretW = 451 / 12,
    turretH = 139 / 12,
    carW = 232 / 4,
    carH = 245 / 4;

/**
 * Impact
 */
function Impact() {
    tImpact = new Sprite(scene, "src/images/explosion2.png", 124 / 2, 123 / 2);
    tImpact.setSpeed(0);
    tImpact.hide();

    tImpact.boom = function ({x,y}) {
        this.setPosition(x-20,y);
        this.show();
        setTimeout(function () {
            tImpact.hide();
        }, 500)
    };
    return tImpact;
}

/**
 * Explosion
 */
function Explosion() {
    tExplosion = new Sprite(scene, "src/images/explosion.png", 256 / 2.5, 256 / 2.5);
    tExplosion.setSpeed(0);
    tExplosion.hide();

    tExplosion.boom = function (x) {
        this.setPosition(x, groundLevel - 22);
        this.show();
        setTimeout(function () {
            tExplosion.hide();
        }, 500)
    };
    return tExplosion;
}

/**
 * Player Tank
 */
function PlayerTank() {

    tTank = new Sprite(scene, "src/images/tank.png", tankW, tankH);

    tTank.tankType = 'player';
    tTank.setSpeed(0);
    tTank.setPosition(100, groundLevel);

    tTank.turret = new Sprite(scene, "src/images/turret.png", turretW, turretH);

    tTank.vSpeed = 4;
    tTank.checkKeys = function() {
        if (keysDown[K_A] && this.x >= 28 && !frozen) {
            this.changeXby(-this.vSpeed);
        }

        if (keysDown[K_D] && this.x <= 500 && !frozen) {
            this.changeXby(this.vSpeed);
        }

        hpElement.setAttribute("style", `left:calc(${this.x}px - 35px);`);

        /**
         * Turret
         */
        this.turret.setPosition(this.x, this.y-25);
        // Rotate turrer
        if (keysDown[K_W]) {
            this.turret.changeImgAngleBy(-8);
            if (this.turret.getImgAngle() < 0) {
                this.turret.setImgAngle(0);
            }
        }
        if (keysDown[K_S]) {
            this.turret.changeImgAngleBy(8);
            if (this.turret.getImgAngle() > 90) {
                this.turret.setImgAngle(90);
            }
        }

        if (keysDown[K_SPACE] && !frozen && BULLETS.length <= maxBullets) {
            // Fire bullet
            fireBullet(tTank);

            bulletCountElement.innerText = (maxBullets - BULLETS.length) >= 0 ? maxBullets - BULLETS.length : 0;

            if(BULLETS.length === maxBullets) {
                setTimeout(() => {
                    BULLETS = [];
                    bulletCountElement.innerText = maxBullets;
                }, 3000);
            }

        }

        this.turret.update();

    };

    return tTank;

}

/**
 * EnemyTank
 */
function EnemyTank() {

    tEnemy = new Sprite(scene, "src/images/tank2.png", tankW, tankH);

    tEnemy.tankType = 'enemy';
    tEnemy.turret = new Sprite(scene, "src/images/turret.png", turretW, turretH);
    tEnemy.turret.setImgAngle(-90);

    tEnemy.setPosition(900, groundLevel);

    tEnemy.direction = false;
    tEnemy.tdirection = false;
    tEnemy.mTime = 120;
    tEnemy.tTime = mode.tTime;
    tEnemy.vSpeed = mode.vSpeed;
    tEnemy.move = function() {

        // mTime
        if(this.mTime >= 0 && this.direction) {
            this.setSpeed(this.vSpeed);
        }
        if(this.mTime >= 0 && !this.direction) {
            this.setSpeed(-this.vSpeed);
        }
        if(this.mTime <= 0) {
            this.setSpeed(0);
            this.direction = !this.direction;
            this.mTime = 72;
        }
        if(this.x <= 500) {
            this.direction = !this.direction;
            this.setSpeed(mode.vSpeed)
        }
        if(this.x >= 1000) {
            this.direction = !this.direction;
            this.setSpeed(mode.vSpeed)
        }
        if(this.mTime >= 0) this.mTime--;

        enemyHpElement.setAttribute("style", `left:calc(${this.x}px - 35px);`);

        /**
         * Turret
         */
        this.turret.setPosition(this.x-20, this.y-25);

        // tTime
        if(this.tdirection) {
            this.turret.changeImgAngleBy(-.5);
            if (this.turret.getImgAngle() < -90) {
                this.tdirection = !this.tdirection
            }
        }
        if(!this.tdirection) {
            this.turret.changeImgAngleBy(.5);
            if (this.turret.getImgAngle() > 0) {
                this.tdirection = !this.tdirection
            }
        }
        if (this.turret.getImgAngle() > -40) {
            this.tdirection = !this.tdirection
        }
        if(this.tTime <= 0) {
            this.tTime = mode.tTime;
            fireBullet(this);
            if(ENEMYBULLETS.length === maxBullets) {
                setTimeout(() => {
                    ENEMYBULLETS = [];
                }, 3000);
            }
        }

        if(this.tTime >= 0) this.tTime--;

    };

    return tEnemy;

}

/**
 * Bullet
 */
function Bullet(owner) {
    tBullet = new Sprite(scene, "src/images/bullet.png", 10, 10);

    tBullet.owner = owner;
    tBullet.setBoundAction(DIE);
    tBullet.setPosition(tBullet.owner.x+10, tBullet.owner.y-25);
    tBullet.setMoveAngle(tBullet.owner.turret.getImgAngle() + Math.random() + (Math.random() < .5 ? 2 : 1));

    tBullet.fire = function() {
        this.setSpeed(20);
    };

    tBullet.checkGravity = function(){
        if(this.y >= groundLevel + 10) {
            this.hide();
        }
        this.addVector(180, 1);
    };

    return tBullet;
}

/**
 * Car
 */
function Car() {

    tCar = new Sprite(scene, "src/images/car.png", carW, carH);
    tCar.setPosition(1000, groundLevel);
    tCar.setSpeed(0);
    tCar.hide();

    tCar.moving = false;

    tCar.move = function() {

        if(this.moving) {
            this.show();
            this.setSpeed(mode.carSpeed);
        }

        if(this.x <= 28) {
            this.moving = false;
            this.hide();
            this.setPosition(1000, groundLevel);
            setTimeout(function() {
                tCar.setPosition(1000, groundLevel);
                tCar.moving = true;
            }, mode.carReset)
        }

    };

    tCar.destroy = function () {
        this.moving = false;
        this.hide();
        this.setPosition(1000, groundLevel);
        setTimeout(function() {
            tCar.setPosition(1000, groundLevel);
            tCar.moving = true;
        }, 5000)
    };

    return tCar

}
/**
 * Bomb
 */
function Bomb() {

    tBomb = new Sprite(scene, "src/images/bomb.png", 256/5, 116/5);
    tBomb.defaultH = 800;
    tBomb.setPosition(100, tBomb.defaultH);
    tBomb.setSpeed(0);
    tBomb.hide();
    tBomb.hidden = true;
    tBomb.setAngle(180);

    tBomb.moving = false;
    tBomb.a;

    tBomb.reset = function() {
        if(!this.hidden) {
            explosion.boom(this.x);
            explosionSound.play();
        }
        this.moving = false;
        this.hide();
        this.setPosition((Math.random() * (400 - 100 + 1) + 100), tBomb.defaultH);
        this.a = setTimeout(function() {
            tBomb.setPosition((Math.random() * (400 - 100 + 1) + 100), tBomb.defaultH);
            tBomb.moving = true;
            tBomb.hidden = false;
        }, mode.bombReset)
    };

    tBomb.move = function() {

        if(this.moving) {
            this.hidden = false;
            this.show();
            this.setSpeed(mode.bombSpeed);
            window.clearTimeout(this.a)
        }

        if(this.y >= groundLevel) {
            this.reset();
            this.hidden = true;
        }

    };

    tBomb.destroy = function () {
        this.reset()
    };

    return tBomb

}


/**
 * Bonus
 */
function Bonus() {

    tBonus = new Sprite(scene, "src/images/bonus.png", 256/5, 160/5);
    tBonus.defaultH = 800;
    tBonus.setPosition(100, tBonus.defaultH);
    tBonus.setSpeed(0);
    tBonus.hide();
    tBonus.setAngle(180);

    tBonus.moving = false;
    tBonus.a;

    tBonus.reset = function() {
        this.moving = false;
        this.hide();
        this.setPosition((Math.random() * (400 - 100 + 1) + 100), tBonus.defaultH);
        this.a = setTimeout(function() {
            tBonus.setPosition((Math.random() * (400 - 100 + 1) + 100), tBonus.defaultH);
            tBonus.moving = true;
        }, 10000);
    };

    tBonus.move = function() {
        if(this.moving) {
            this.show();
            this.setSpeed(4);
            window.clearTimeout(this.a)
        }
        if(this.y >= groundLevel) this.reset()
    };

    tBonus.destroy = function () {
        this.reset()
    };

    return tBonus

}

function fireBullet(owner) {
    if(owner.tankType === 'player') BULLETS[BULLETS.length + 1] = new Bullet(owner);
    if(owner.tankType === 'player' && owner.x >= 28) owner.changeXby(-1);
    if(owner.tankType === 'enemy') ENEMYBULLETS[ENEMYBULLETS.length + 1] = new Bullet(owner);
}