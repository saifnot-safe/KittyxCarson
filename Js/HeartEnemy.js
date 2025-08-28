import BaseEnemy from "./BaseEnemy.js";

/**
 * HeartEnemy.js
 * A variation of BaseEnemy that shoots up into the air
 */

export default class HeartEnemy extends BaseEnemy {

    constructor(scene, x,y,  player) {
        super(scene, x,y, 'HeartEnemy', player);
        this.player = player;

        this.setScale(1)
        this.setSize(50,60);
        this.body.setOffset(25, 10);

        this.deathAnimKey = 'Heart Enemy Death';

        this.speed = 0;

        this.beatInterval = 2000;
        this.isBeating = false;
        this.startBeating();


    }

    startBeating() {
        this.isBeating = true;
        this.beatTimer = this.scene.time.addEvent({
            delay: this.beatInterval,
            loop: true,
            callback: () => {
                this.beatAnimation();
                this.shootBlood();
            }
        });
    }

    beatAnimation() {
        if (!this.scene || !this.scene.tweens) return;
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 0.5,
            scaleY: this.scaleY * 1.1,
            yoyo: true,
            duration: 300,
        });

    } shootBlood() {
        if (!this) return;
        const bloodX = this.x + Phaser.Math.Between(-50, 50);
        const bloodY = this.y;
        const bullet = this.scene.heartBullets.get();
        if (bullet) bullet.shoot(bloodX, bloodY);
    }



    update() {
        if (this.isDying) return;
        this.body.setVelocityY(0);
        this.body.setVelocityX(0);

    }

    death() {
        super.death();
        if (this.beatTimer) {
            this.beatTimer.remove();
        }
    }

    destroy(fromScene) {
        if (this.beatTween) {
            this.beatTween.stop();
            this.beatTween = null;
        }
        if (this.beatTimer) {
            this.beatTimer.remove();
            this.beatTimer = null;
        }

        super.destroy(fromScene);
    }



}