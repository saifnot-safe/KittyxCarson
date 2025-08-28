/**
 * Bullet.js
 * A bullet object that can be shot by the player
 * Handles visuals, anim and lifespan
 */

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'KittyBullet');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.speed = 300;
        this.lifespan = 300;

        this.body.setAllowGravity(false);

        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: this.lifespan,
            ease: 'sine.inout'
        }); // bullet anim

    }

    /**
     * Fires bullet
     * @param x is the player's x position
     * @param y is the player's y position
     * @param flipX determines the direction the player is facing
     * @param player
     */
    fire(x, y, flipX, player) {
        this.body.setAllowGravity(false);

        if (flipX) this.setPosition(x - 30, y + 10); // Flips bullet position if player is flipped
        else this.setPosition(x + 30, y + 10);
        this.setVelocityX(flipX ? -this.speed : this.speed);
        this.setActive(true);
        this.setVisible(true);
        this.lifespan = player.stats.Range;
        this.scene.time.delayedCall(this.lifespan - 100, () => {
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0,
                duration: 100,
                onComplete: () => {
                    this.setActive(false);
                    this.setVisible(false);
                    this.setAlpha(1);
                    this.setScale(2);
                }
            });
        }); // Bullet anim
    }



}