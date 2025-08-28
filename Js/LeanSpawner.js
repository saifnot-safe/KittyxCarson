import Lean from './lean.js';

/**
 * LeanSpawner.js
 * Used to initiate enemy spawning in game
 * Handles frequency and location
 */

export default class LeanSpawner {
    constructor(scene, player, leanGroup) {
        this.scene = scene;
        this.player = player;
        this.leanGroup = leanGroup;

        this.scheduleNextSpawn();

    }

    scheduleNextSpawn() {
        const delay = Phaser.Math.Between(10000, 18000);

       this.spawnTimer = this.scene.time.delayedCall(delay, () => {
            this.spawn();
            this.scheduleNextSpawn();
        });
    }

    /**
     * Used on game end/when returning to main menu
     */
    reset() {
        if (!this.spawnTimer) return;
        this.scene.time.removeEvent(this.spawnTimer);
        this.spawnTimer = null;
    }

    start() {
        if (this.spawnTimer) return;

        const delay = Phaser.Math.Between(10000, 18000);

        this.spawnTimer = this.scene.time.delayedCall(delay, () => {
            this.spawn();
            this.scheduleNextSpawn();
        });
    }

    spawn() {
        if (!this.scene.gameStarted) return;
        if (this.leanGroup.countActive(true) >= 1) return;

        const validPlatforms = this.scene.platforms;

        if (validPlatforms.length === 0) return;

        const platform = Phaser.Utils.Array.GetRandom(validPlatforms);
        const bounds = platform.getBounds();
        // Gets random platform to spawn lean on and sets bounds

        const x = Phaser.Math.Between(bounds.left + 10, bounds.right - 10);
        const y = bounds.top;

        const lean = new Lean (this.scene, x, y);
        this.leanGroup.add(lean);
    }
}