/**
 * Lean.js
 * An object that is meant to be picked up by the player to restore health
 */

export default class LeanPickup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'lean');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.125);
        this.setSize(100, 450);
        this.setDepth(0);

    }

}
