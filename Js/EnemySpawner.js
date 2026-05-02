import ChaserEnemy from './ChaserEnemy.js';
import PatrolEnemy from './PatrolEnemy.js';
import EyeEnemy from './EyeEnemy.js';
import HeartEnemy from "./HeartEnemy.js";

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
        };

        this.spawnTimer = this.scene.time.addEvent({
            delay: 1200,
            loop: true,
            callback: this.trySpawnEnemy,
            callbackScope: this
        });
    }

    reset() {
        if (!this.spawnTimer) return;
        this.scene.time.removeEvent(this.spawnTimer);
        this.spawnTimer = null;
    }

    start() {
        if (this.spawnTimer) return;
        this.spawnTimer = this.scene.time.addEvent({
            delay: 1200,
            loop: true,
            callback: this.trySpawnEnemy,
            callbackScope: this
        });
    }

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
            left: { xMin: leftXMin, xMax: leftXMax, yMin, yMax },
            right: { xMin: rightXMin, xMax: rightXMax, yMin, yMax }
        };
    }

    trySpawnEnemy() {
        if (!this.scene.gameStarted) return;

        const level = this.player.level;
        const spawnInView = Math.random() < 0.3;

        const pool = [];
        if (level >= 1) pool.push('patroller');
        if (level >= 2) pool.push('chaser');
        if (level >= 4) pool.push('eyeball');
        if (level >= 5) pool.push('heart');
        if (level >= 5) pool.push('chaser', 'patroller');

        const type = Phaser.Utils.Array.GetRandom(pool);

        switch (type) {
            case 'patroller': this.spawnPatroller(spawnInView); break;
            case 'chaser': this.spawnChaser(spawnInView); break;
            case 'eyeball': this.spawnEyeball(); break;
            case 'heart': this.spawnHeart(spawnInView); break;
        }

        this.spawnTimer.delay = Math.max(1000, 5000 / (1 + Math.log10(level + 1)));
    }

    getMaxEnemies(level) {
        return 3 + level * 0.5;
    }

    getInViewX() {
        const cam = this.scene.cameras.main;
        const padding = 80;
        const minDist = 120;

        let x;
        do {
            x = Phaser.Math.Between(
                cam.worldView.x + padding,
                cam.worldView.right - padding
            );
        } while (Math.abs(x - this.player.x) < minDist);

        return x;
    }

    applySpawnEffect(enemy) {
        enemy.isSpawning = true;
        enemy.setAlpha(0.3);

        if (enemy.body) enemy.body.enable = false;

        const flicker = this.scene.tweens.add({
            targets: enemy,
            alpha: { from: 0.2, to: 0.8 },
            duration: 100,
            yoyo: true,
            repeat: 6
        });

        this.scene.time.delayedCall(800, () => {
            enemy.isSpawning = false;
            flicker.stop(); // fixes alpha bug
            enemy.setAlpha(1);
            if (enemy.body) enemy.body.enable = true;
        });
    }

    spawnChaser(spawnInView) {
        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) return;

        let x, y = 500;

        if (spawnInView) {
            x = this.getInViewX();
        } else {
            const zoneKeys = Object.keys(this.spawnZones);
            const sz = this.spawnZones[zoneKeys[Phaser.Math.Between(0, zoneKeys.length - 1)]];
            x = Phaser.Math.Between(sz.xMin, sz.xMax);
        }

        const enemy = new ChaserEnemy(this.scene, x, y, this.player);
        enemy.spawn(x, y, this.player.level);

        this.applySpawnEffect(enemy);
        this.enemyGroup.add(enemy);
    }

    spawnPatroller(spawnInView) {
        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) return;

        const spawnLocation = Phaser.Math.Between(1, 4);
        const MAX_ENEMIES_PER_PLATFORM = 1;
        const cam = this.scene.cameras.main;

        if (spawnLocation !== 1) {
            const validPlatforms = this.scene.platforms.filter(platform => {
                const bounds = platform.getBounds();
                return (
                    (
                        spawnInView ||
                        bounds.right < cam.worldView.x - 50 ||
                        bounds.left > cam.worldView.right + 50
                    ) &&
                    (platform.enemyCount || 0) < MAX_ENEMIES_PER_PLATFORM
                );
            });

            if (validPlatforms.length === 0) return;

            const platform = Phaser.Utils.Array.GetRandom(validPlatforms);
            const bounds = platform.getBounds();

            const x = Phaser.Math.Between(bounds.left + 10, bounds.right - 10);
            const y = bounds.top - 10;

            const enemy = new PatrolEnemy(this.scene, x, y, this.player, platform);
            enemy.spawn(x, y, this.player.level);

            this.applySpawnEffect(enemy);
            this.enemyGroup.add(enemy);

            platform.enemyCount = (platform.enemyCount || 0) + 1;
            enemy.platform = platform;

        } else {
            let x = spawnInView ? this.getInViewX() : Phaser.Math.Between(
                this.spawnZones.left.xMin,
                this.spawnZones.right.xMax
            );

            const y = 500;

            const enemy = new PatrolEnemy(this.scene, x, y, this.player, null);
            enemy.spawn(x, y, this.player.level);

            this.applySpawnEffect(enemy);
            this.enemyGroup.add(enemy);
        }
    }

    spawnEyeball() {
        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) return;

        const world = this.scene.physics.world.bounds;
        const x = Phaser.Math.Between(world.x + 100, world.width - 100);
        const y = Phaser.Math.Between(250, 300);

        const enemy = new EyeEnemy(this.scene, x, y, this.player);
        enemy.spawn(x, y, this.player.level);

        this.applySpawnEffect(enemy);
        this.enemyGroup.add(enemy);
    }

    spawnHeart(spawnInView) {
        if (this.enemyGroup.countActive(true) >= this.getMaxEnemies(this.player.level)) return;

        let x = spawnInView ? this.getInViewX() : Phaser.Math.Between(
            this.spawnZones.left.xMin,
            this.spawnZones.right.xMax
        );

        const y = 485;

        const tooClose = this.enemyGroup.getChildren().some(e =>
            e.active && e instanceof HeartEnemy && Math.abs(e.x - x) < 100
        );
        if (tooClose) return;

        const enemy = new HeartEnemy(this.scene, x, y, this.player);
        enemy.spawn(x, y, this.player.level);

        this.applySpawnEffect(enemy);
        this.enemyGroup.add(enemy);
    }
}