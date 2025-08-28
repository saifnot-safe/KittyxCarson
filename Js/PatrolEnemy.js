import BaseEnemy from "./BaseEnemy.js";

/**
 * PatrolEnemy.js
 * A variation of BaseEnemy that patrols a specified area
 */

export default class PatrolEnemy extends BaseEnemy {

    constructor(scene, x,y,  player, platform) {
        super(scene, x,y, 'PatrolEnemy', player);
        this.player = player;
        this.platform = platform;


        this.setScale(0.12);
        this.setSize(400,500);
        this.body.setOffset(120, -50);

        this.deathAnimKey = 'Patrol Enemy Death';
        this.patrolPointA = Math.max(x - 100, 0);
        this.patrolPointB = Math.min(x + 100, this.scene.physics.world.bounds.width);

        if (this.platform) { // Platform patrol bounds
            const bounds = this.platform.getBounds();
            const buffer = 1;
            this.patrolPointA = bounds.left + buffer;
            this.patrolPointB = bounds.right - buffer;
        } else { // Floor patrol bounds
            this.patrolPointA = Math.max(x - 100, 0);
            this.patrolPointB = Math.min(x + 100, this.scene.physics.world.bounds.width);
        }

        this.facingRight = true;

        this.targetX = this.patrolPointB;

    }
    spawn(x, y, level) {

        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        this.level = level;
        this.health = 30 + level * 10;
        this.xpGiven = 75 + level * 2.5;
        this.attackAmount = 5 + level * 2.5;

    }


    update() {
        if (this.isDying) return;

        if (this.isKnockedBack) {
            this.scene.time.delayedCall(300, () => {
                this.isKnockedBack = false;
            });
            return;
        }

        if (this.anims.currentAnim?.key !== 'patrol enemy walk' && this.anims.currentAnim?.key !== 'patrol enemy death') {
            this.anims.play('patrol enemy walk', true);
        }

        if (!this.body.blocked.down) return;

        // Move enemy toward targetX
        const direction = this.targetX > this.x ? 1 : -1;
        this.setVelocityX(direction * this.speed);
        this.flipX = direction < 0;

        // Switch direction if close to targetX
        if (Math.abs(this.x - this.targetX) < 5) {
            this.targetX = this.targetX === this.patrolPointA ? this.patrolPointB : this.patrolPointA;
        }

    }

}