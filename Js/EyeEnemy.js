import BaseEnemy from "./BaseEnemy.js";
import EyeBullet from "./EyeBullet.js";

/**
 * EyeEnemy.js
 * A variation of BaseEnemy that floats and shoots towards the player
 */

export default class EyeEnemy extends BaseEnemy {

    constructor(scene, x,y,  player) {
        super(scene, x,y, 'EyeEnemy', player);
        this.player = player;
        this.health = 10;
        this.setScale(0.5);
        this.setSize(80,80);
        this.body.setOffset(20, 20);

        this.deathAnimKey = 'Eye Enemy Death';

        this.speed = 0;

        this.shootCooldown = 5000;
        this.canShoot = true;

    }

    spawn(x, y, level) {
        super.spawn(x, y, level);

        this.health    = 10 + level * 2.5;
        this.xpGiven   = 100 + level * 2.5;

        return this;
    }


    update() {

        if (this.isDying) return;

        this.body.setVelocityY(0);
        this.body.setVelocityX(0);

        // Lets the eyeball float up and down
        if (!this.isFloating) {
            this.isFloating = true;
            this.scene.tweens.add({
                targets: this,
                y: this.y - 20,
                yoyo: true,
                repeat: -1,
                duration: 1500,
                ease: 'Sine.easeInOut'
            });
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        this.setRotation(angle + Math.PI); // Lets the eyeball face the player

        if (this.canShoot) {
            this.shoot();
            this.canShoot = false;
            this.scene.time.delayedCall(this.shootCooldown, () => {
                this.canShoot = true;
            });
        } // Continuously shoots when the timer is up


    }

    /**
     * Shoots bullet
     */
    shoot() {
        if (!this) return;
        const eyeBullet = this.scene.eyeBullets.get();

            if (!eyeBullet) return;

            eyeBullet.setPosition(this.x, this.y)
                .setActive(true)
                .setVisible(true);
            eyeBullet.fire(this.x, this.y, this.player.x, this.player.y);
    }


}