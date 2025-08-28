/**
 * BaseEnemy.js
 * A base class used to define core traits of all enemies and is
 * extended when creating variations of each enemy
 */
export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, player) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;

        this.health = 30;
        this.xpGiven = 75;

        this.setScale(0.12);
        this.setSize(400, 500);
        this.body.setOffset(120, -50);

        this.setCollideWorldBounds(true);
        this.isKnockedBack = false;
        this.isDying = false;
        this.speed = 70;
        this.attackAmount = 15;
    }

    /**
     * Handles Enemy Spawning
     * @param x position
     * @param y positon
     * @param level of the player
     */
    spawn(x, y, level) {

        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        this.level = level;
        this.health = 30 + level * 2.5;
        this.xpGiven = 75 + level * 2.5;
        this.attackAmount = 5 + level * 2.5;

    }

    /**
     * Handles damage done to enemy
     * @param amount of damage
     */
    takeDamage(amount) {
        this.health -= amount;
        this.setTint(0xff0000);
        this.setAlpha(0.6);

        this.scene.time.delayedCall(100, () => {
            this.clearTint();
            this.setAlpha(1);
        }); // damage effect

        if (this.health <= 0) {
            this.death();
        } // calls death function on zero health
    }

    /**
     * Handles enemy death and animation
     */
    death() {
        this.player.score += Math.floor(Math.random() * 26) + 75;
        this.isDying = true;
        const key = this.deathAnimKey || 'enemy death';
        this.anims.play(key);
        this.body.enable = false;
        this.scene.events.emit('enemyKilled', this);

        this.scene.enemyDeathSound.play();

        if (this.platform && this.platform.enemyCount > 0) {
            this.platform.enemyCount--;
        }

        this.once(`animationcomplete-${key}`, () => {
            this.setActive(false);
            this.setVisible(false);
            this.destroy();
        });

        this.player.earnXP(this.xpGiven);
    }

    update() {
        if (this.isDying || this.isKnockedBack) return;
    }
}
