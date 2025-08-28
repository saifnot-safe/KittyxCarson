/**
 * HeartBullet.js
 * A bullet object that is shot by HeartEnemy
 * Handles direction and lifespan
 */

export default class HeartBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bloodshot');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.body.setAllowGravity(true);

        this.speedY = 100;
        this.body.setVelocityY(this.speedY);
        this.damage = 10;

    }

    shoot(x, y) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);

        this.attackAmount = 30;

        this.body.setAllowGravity(true);
        this.body.setGravityY(-this.scene.physics.world.gravity.y + 200);
        this.body.setImmovable(false);
        this.body.setVelocityY(Phaser.Math.Between(-500, -400));
        this.body.setVelocityX(Phaser.Math.Between(-100, 100));

    };


    update() {
        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        this.setRotation(angle);
        this.isHazard = false;

    }



}
