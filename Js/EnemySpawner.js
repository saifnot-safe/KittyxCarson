import ChaserEnemy from './ChaserEnemy.js';
import PatrolEnemy from './PatrolEnemy.js';
import EyeEnemy from './EyeEnemy.js';
import HeartEnemy from "./HeartEnemy.js";

/**
 * EnemySpawner.js
 * Used to initiate enemy spawning in game
 * Handles spawn zones, frequency and quantity
 */

export default class EnemySpawner {
    constructor(scene, player, enemyGroup) {
        this.scene = scene;
        this.player = player;
        this.enemyGroup = enemyGroup;

        const cam = scene.cameras.main;
        this.spawnZones = {
            left: {
                xMin: cam.worldView.x - 100,
                xMax: cam.worldView.x - 50,
                yMin: cam.worldView.y,
                yMax: cam.worldView.y + cam.height
            },
            right: {
                xMin: cam.worldView.x + cam.width + 50,
                xMax: cam.worldView.x + cam.width + 100,
                yMin: cam.worldView.y,
                yMax: cam.worldView.y + cam.height
            }
        }; // creates spawn zones outside of player view


        this.spawnTimer = this.scene.time.addEvent({
            delay: 1200,
            loop: true,
            callback: this.trySpawnEnemy,
            callbackScope: this
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

    /**
     * Starts spawn timer
     */
    start() {
        if (this.spawnTimer) return;
        this.spawnTimer = this.scene.time.addEvent({
            delay: 1200,
            loop: true,
            callback: this.trySpawnEnemy,
            callbackScope: this
        });
    }

    trySpawnEnemy() {
        if (!this.scene.gameStarted) return;
        const level = this.player.level;

        // Weighted pool based on level
        const pool = [];

        if (level >= 1) pool.push('patroller');
        if (level >= 2) pool.push('chaser');
        if (level >= 4) pool.push('eyeball');
        if (level >= 5) pool.push('heart');

        // Add weights (duplicate types to increase odds)
        if (level >= 5) {
            pool.push('chaser', 'patroller'); // Extra weight for early types
        }

        const type = Phaser.Utils.Array.GetRandom(pool);

        switch (type) {
            case 'patroller': this.spawnPatroller(); break;
            case 'chaser': this.spawnChaser(); break;
            case 'eyeball': this.spawnEyeball(); break;
            case 'heart': this.spawnHeart(); break;
        }

        // Increase spawn frequency over time
        this.spawnTimer.delay = Math.max(1000, 5000 / (1 + Math.log10(level + 1)));
    }

    /**
     * Updates spawn zones as player moves (keeps them out of player view)
     */
    updateSpawnZones() {
        const cam = this.scene.cameras.main;
        const world = this.scene.physics.world.bounds;

        const leftXMin = Math.max(world.x, cam.worldView.x - 100);
        const leftXMax = Math.max(world.x, cam.worldView.x - 25);
        const rightXMin = Math.min(world.right, cam.worldView.right + 25);
        const rightXMax = Math.min(world.right, cam.worldView.right + 100);
        const yMin = Math.max(world.y, cam.worldView.y);
        const yMax = Math.min(world.bottom, cam.worldView.bottom);

        this.spawnZones = {
            left: {xMin: leftXMin, xMax: leftXMax, yMin: yMin, yMax: yMax},
            right: {xMin: rightXMin, xMax: rightXMax, yMin: yMin, yMax: yMax}
        };
    }

    /**
     * Sets max amount of enemies based off level
     * @param playerLevel
     * @returns max number of enemies
     */
    getMaxEnemies(playerLevel) {
        return 3 + playerLevel * 0.25;
    }

    spawnPatroller() {
        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) return;

        const zoneKeys = Object.keys(this.spawnZones);
        const spawnZone = this.spawnZones[zoneKeys[Phaser.Math.Between(0, zoneKeys.length - 1)]];//picks random key

        const spawnLocation = Phaser.Math.Between(1, 4); // Sets a 75% chance of patrollers spawning on platforms

        const MAX_ENEMIES_PER_PLATFORM = 1;

        if (spawnLocation != 1) {
            const cam = this.scene.cameras.main;

            // Use your array of rectangles (platforms[])
            const validPlatforms = this.scene.platforms.filter(platform => {
                const bounds = platform.getBounds();
                return (
                    (bounds.right < cam.worldView.x - 50 || bounds.left > cam.worldView.right + 50) &&
                    (platform.enemyCount || 0) < MAX_ENEMIES_PER_PLATFORM
                );
            }); // Makes sure there is space on platforms for a patroller to spawn or else patrollers spawn on ground

            if (validPlatforms.length === 0) return;

            const platform = Phaser.Utils.Array.GetRandom(validPlatforms);

            const bounds = platform.getBounds();

            const x = Phaser.Math.Between(bounds.left + 10, bounds.right - 10);
            const y = bounds.top - 10; // Manually sets platform bounds since platforms are not collidable

            const enemy = new PatrolEnemy(this.scene, x, y, this.player, platform);
            enemy.spawn(x, y, this.player.level);
            this.enemyGroup.add(enemy);

            platform.enemyCount = (platform.enemyCount || 0) + 1;
            enemy.platform = platform; // Save reference to reduce later on death

        } else {
            const x = Phaser.Math.Between(spawnZone.xMin, spawnZone.xMax);
            const y = 500 // Ground spawning

            const enemy = new PatrolEnemy(this.scene, x, y, this.player, null);
            enemy.spawn(x, y, this.player.level);
            this.enemyGroup.add(enemy);
        }
    }

    spawnChaser() {
        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) return;
        const zoneKeys = Object.keys(this.spawnZones);
        const spawnZone = this.spawnZones[zoneKeys[Phaser.Math.Between(0, zoneKeys.length - 1)]];//picks random key

        const x = Phaser.Math.Between(spawnZone.xMin, spawnZone.xMax);//picks random x coord
        const y = 500;
        const enemy = new ChaserEnemy(this.scene, x, y, this.player);
        enemy.spawn(x, y, this.player.level);
        this.enemyGroup.add(enemy);
    }

    spawnEyeball() {

        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) {
            return;
        }

        let x, y;
        if (this.player.y >= 400) {
            const world = this.scene.physics.world.bounds;
            x = Phaser.Math.Between(world.x+100, world.width-100);
            y = Phaser.Math.Between(250, 300);
        } else {
            const zoneKeys = Object.keys(this.spawnZones);
            const sz     = this.spawnZones[zoneKeys[ Phaser.Math.Between(0, zoneKeys.length-1) ]];
            x = Phaser.Math.Between(sz.xMin, sz.xMax);
            y = Phaser.Math.Between(250, 300);
        } // Allows eyeballs to spawn closer to the bottom than spawnzones allow if the player is low on the map
        // (I noticed eyeballs were only spawning on the edges of the map)

        const enemy = new EyeEnemy(this.scene, x, y, this.player);
        enemy.spawn(x, y, this.player.level);
        this.enemyGroup.add(enemy);
    }

    spawnHeart() {

        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) {
            return;
        }

        const zoneKeys = Object.keys(this.spawnZones);
        const spawnZone = this.spawnZones[zoneKeys[Phaser.Math.Between(0, zoneKeys.length - 1)]];//picks random key


        const zoneWidth = spawnZone.xMax - spawnZone.xMin;
        const centerMin = spawnZone.xMin + zoneWidth * 0.25;
        const centerMax = spawnZone.xMax - zoneWidth * 0.25;
        const x = Phaser.Math.Between(centerMin, centerMax);

        const y = 485;


        const tooClose = this.enemyGroup.getChildren().some(e =>
            e.active && e instanceof HeartEnemy && Math.abs(e.x - x) < 100
        );
        if (tooClose) return;
        // Checks if any hearts are close to the x spawn point to prevent hearts overlapping

            const enemy = new HeartEnemy(this.scene, x, y, this.player, null);
            enemy.spawn(x, y, this.player.level);
            this.enemyGroup.add(enemy);
    }

}

