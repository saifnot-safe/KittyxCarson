/**
 * EyeBullet.js
 * A bullet object that is shot by EyeEnemy
 * Handles direction and lifespan
 */

export default class Eyelet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'tearshot');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.attackAmount = 30;

        this.setScale(2);
        this.speed = 300;

        this.body.setAllowGravity(false);


    }

    /**
     * Fires bullet
     * @param x position of the bullet
     * @param y position of the bullet
     * @param playerX is the player's x position
     * @param playerY is the player's y position
     */
    fire(x, y, playerX, playerY) {
        this.body.setAllowGravity(false);

        const dx = playerX - x;
        const dy = playerY - y;
        const angle = Math.atan2(dy, dx);
        this.setRotation(angle);
        // Sets bullet in direction of the player

        this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed)
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        this.scene.time.delayedCall(1000 - 100, () => {
            if (!this.scene || !this.scene.tweens) return;
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0,
                duration: 100,
                onComplete: () => {
                    this.body.enable = false;
                    this.setActive(false);
                    this.setVisible(false);
                    this.setAlpha(1);
                    this.setScale(2);
                }
            });
        }); // Timer
    }


}