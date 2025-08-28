import BaseEnemy from "./BaseEnemy.js";

/**
 * ChaserEnemy.js
 * A variation of BaseEnemy that chases the player
 */

export default class ChaserEnemy extends BaseEnemy {

    constructor(scene, x,y,  player) {
        super(scene, x,y, 'ChaserEnemy', player);
        this.player = player;

        this.setScale(0.5);
        this.setSize(80,80);
        this.body.setOffset(20, 20);

        this.deathAnimKey = 'Chaser Enemy Death';

        this.speed = 120;

    }

    spawn(x, y, level) {

        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        this.level = level;
        this.health = 30 + level * 2.5;
        this.xpGiven = 75 + level * 2.5;
        this.attackAmount = 5 + level * 2.5;
        this.speed = 120 + level * 2.5;


    }

    update() {
        if (this.isDying) return;

        if (this.isKnockedBack) {
            this.scene.time.delayedCall(300, () => {
                this.isKnockedBack = false;
            });
            return;
        }
        if (this.anims.currentAnim?.key !== 'chaser enemy walk' || this.anims.currentAnim?.key !== 'chaser enemy death' ) {
            this.anims.play('chaser enemy walk', true);
        }
        else return;


        if (!this.player) return;

        // handles player chasing
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const angle = Math.atan2(dy, dx);

        if(this.body.blocked.down) {
            const velocityX = Math.cos(angle) * this.speed;
            this.setVelocityX(velocityX);
            this.flipX = velocityX < 0;
        }

    }



    }