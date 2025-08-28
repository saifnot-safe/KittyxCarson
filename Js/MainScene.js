import Player from "./Player.js";
import ChaserEnemy from './ChaserEnemy.js';
import EnemySpawner from './EnemySpawner.js';
import Bullet from './Bullet.js';
import EyeBullet from './EyeBullet.js';
import HeartBullet from "./HeartBullet.js";
import LeanSpawner from "./LeanSpawner.js";

/**
 * MainScene.js
 * Used to preload, create, and update, all required assets and groups
 * including the player, enemy groups, and lean group
 */

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.gameStarted = false;
        this.revealRadius = 0;
    }

    preload() {
        this.load.tilemapTiledJSON('KittyMap','assets/KittyMap1.json');
        this.load.image('KittyTileset','assets/KittyTileset.png');
        this.load.image('KittyTilesetUpgrade','assets/KittyTilesetUpgrade.png');

        this.load.spritesheet('kitty', 'assets/Kitty Sprite2.png', {
            frameWidth: 43,
            frameHeight: 35
        });
        this.load.image('KittyBullet','assets/KittyBullet.png');
        this.load.image('bloodshot','assets/bloodshot2.png');
        this.load.image('tearshot','assets/tearshot.png');
        this.load.image('lean','assets/lean.png');

        this.load.spritesheet('PatrolEnemy', 'assets/Gore Guy Sprite3.png',
            {
                frameWidth: 660,
                frameHeight: 660
            });

        this.load.spritesheet('ChaserEnemy', 'assets/running guy.png',
            {
                frameWidth: 131,
                frameHeight: 130
            });

        this.load.spritesheet('HeartEnemy', 'assets/heart guy.png',
            {
                frameWidth: 100,
                frameHeight: 100
            });

        this.load.spritesheet('EyeEnemy', 'assets/eye guy.png',
            {
                frameWidth: 75,
                frameHeight: 75
            });

        this.load.spritesheet('enemy death', 'assets/Enemy Death.png',
            {
                frameWidth: 66,
                frameHeight: 66
            });

        this.load.audio('menuMusic', "assets/Audio/Green PurrRoom.wav");
        this.load.audio('gameMusic', "assets/Audio/Off The Meowter.wav");
        this.load.audio('startSound', "assets/Audio/KittyStartSound.wav");
        this.load.audio('hurt1', "assets/Audio/hurt1.wav");
        this.load.audio('hurt2', "assets/Audio/hurt2.wav");
        this.load.audio('hurt3', "assets/Audio/hurt3.wav");
        this.load.audio('hurt4', "assets/Audio/hurt4.wav");
        this.load.audio('munch', "assets/Audio/munch.mp3");
        this.load.audio('Enemy Death', "assets/Audio/Enemy Death.wav");

        // Preloading used assets
    }

    create() {

        this.gameStarted = false;

        this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.3 });
        this.gameMusic = this.sound.add('gameMusic', { loop: true, volume: 0.3 });
        this.startSound = this.sound.add('startSound', { volume: 0.6 });


        this.hurtSounds = [
            this.sound.add('hurt1', { volume: 0.6 }),
            this.sound.add('hurt2', { volume: 0.6 }),
            this.sound.add('hurt3', { volume: 0.6 }),
            this.sound.add('hurt4', { volume: 0.6 })
        ];

        this.munchSound = this.sound.add('munch', {volume: 0.4});

        this.enemyDeathSound = this.sound.add('Enemy Death', { volume: 1 });

        // Setting sounds

        const map = this.make.tilemap({key: 'KittyMap'});

        // Creating map

        const KittyTileset = map.addTilesetImage('KittyTileset[] (1)', 'KittyTileset');
        const KittyTilesetUpgrade = map.addTilesetImage('KittyTileset[] (2)', 'KittyTilesetUpgrade');

        // Creating tilesets

        const exteriorLayer = map.createLayer('Exterior', [KittyTileset]);
        const wallLayer = map.createLayer('Walls', [KittyTileset, KittyTilesetUpgrade]);
        const groundLayer = map.createLayer('Ground', [KittyTileset]);
        const decLayer = map.createLayer('Dec', [KittyTileset]);
        const foregroundLayer = map.createLayer('Foreground', [KittyTileset]);

        // Creating layers

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('kitty', { start:0, end: 3}),
            frameRate: 6,
            repeat: -1,
            yoyo: true
        });
        this.anims.create({
            key: 'running',
            frames: this.anims.generateFrameNumbers('kitty', {start:4, end:9}),
            frameRate: 6,
        })
        this.anims.create({
            key: 'jumping',
            frames: this.anims.generateFrameNumbers('kitty', {start:10,end:12}),
            frameRate: 6
        })
        this.anims.create({
            key: 'falling',
            frames: this.anims.generateFrameNumbers('kitty', {start:13,end:13}),
            frameRate: 6
        })
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('kitty', {start:14,end:16}),
            frameRate: 6
        })

        this.anims.create({
            key: 'patrol enemy walk',
            frames: this.anims.generateFrameNumbers('PatrolEnemy', {start:0,end: 2}),
            frameRate: 6,
            repeat: -1
        })

        this.anims.create({
            key: 'Patrol Enemy Death',
            frames: this.anims.generateFrameNumbers('PatrolEnemy', {start:0,end:0}),//{start:3,end: 27}),
            frameRate: 72,
            yoyo: true
        })

        this.anims.create({
            key: 'chaser enemy walk',
            frames: this.anims.generateFrameNumbers('ChaserEnemy', {start:0,end: 0}),
            frameRate: 6,
            repeat: -1
        })

        this.anims.create({
            key: 'Chaser Enemy Death',
            frames: this.anims.generateFrameNumbers('ChaserEnemy', {start:0,end: 0}),
            frameRate: 36,
            yoyo: true
        })

        this.anims.create({
            key: 'Eye Enemy Death',
            frames: this.anims.generateFrameNumbers('EyeEnemy', {start:0,end: 0}),
            yoyo: true
        })

        this.anims.create({
            key: 'Heart Enemy Death',
            frames: this.anims.generateFrameNumbers('HeartEnemy', {start:0,end: 0}),
            yoyo: true
        })

        // Defining anims

        this.playerStartX = 448;
        this.playerStartY = 500;
        this.player = new Player(this, 448, 500, 'kitty');
        this.physics.add.collider(this.player, groundLayer);
        this.scene.launch('UIScene', {player: this.player});

        this.input.on('pointerdown', () => {
            this.player.shoot();
        }); // Detects mouse left click and shoots if clicked

        this.input.keyboard.on('keydown-E', () => {
            this.player.shoot();
        });

        // Creating player and shooting controls


        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 50,
            runChildUpdate: true
        });

        this.eyeBullets = this.physics.add.group({
           classType: EyeBullet,
           maxSize: 50,
           runChildUpdate: true
        });

        this.heartBullets = this.physics.add.group({
            classType: HeartBullet,
            maxSize: 50,
            runChildUpdate: true
        });

        // Creating bullet groups

        const cam = this.cameras.main;
        cam.startFollow(this.player);
        cam.setZoom(2);
        cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        cam.roundPixels = true;
        // Setting world bounds
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Creating camera to zoom in and follow the player

        this.enemies = this.physics.add.group({runChildUpdate: true,  maxSize: 30});
        this.enemySpawner = new EnemySpawner(this, this.player, this.enemies);
        this.physics.add.collider(this.enemies, groundLayer);

        // Creating enemy group, spawn and setting up collision

        this.lean = this.physics.add.group({runChildUpdate: true,  maxSize: 1});
        this.leanSpawner = new LeanSpawner(this, this.player, this.lean);
        this.physics.add.collider(this.lean, groundLayer);
        this.physics.add.overlap(this.player, this.lean, (player, lean) => {
            this.munchSound.play();
                player.heal();
                lean.destroy();

        });

        // Creating lean spawning




        this.playerEnemyCollider = this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);
        // Creating collision between player and enemy that will call handlePlayerHit when they overlap
        this.playerEyeBulletCollider = this.physics.add.overlap(this.player, this.eyeBullets, this.handlePlayerHit, null, this);
        this.playerHeartBulletCollider = this.physics.add.overlap(this.player, this.heartBullets, this.handlePlayerHit, null, this);
        this.enemyBulletCollider = this.physics.add.overlap(this.enemies, this.bullets, this.handleEnemyHit, null, this);
        // Setting up collision for other objects


        this.spotlightRadius = 150;
        const gradientCanvas = this.textures.createCanvas('spotlightGradient', this.spotlightRadius * 2, this.spotlightRadius * 2);
        const ctx = gradientCanvas.getContext();

        const gradient = ctx.createRadialGradient(this.spotlightRadius, this.spotlightRadius, 0, this.spotlightRadius,this.spotlightRadius, this.spotlightRadius);
        // First three are the x,y and r of the gradient beginning, last three are the end
        // ColorStop defines color from 0-1
        gradient.addColorStop(0, 'rgba(255,255,255,1)'); //white opaque at 0
        gradient.addColorStop(1, 'rgba(255,255,255,0)'); //white transparent at 1
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.spotlightRadius * 2, this.spotlightRadius * 2);//fills canvas with gradient
        gradientCanvas.refresh(); // Allows ctx changes to occur

        this.spotlightTexture = this.make.renderTexture({
         width: this.cameras.main.width,
         height: this.cameras.main.height,
         add: true
     }).setDepth(10).setScrollFactor(0).setOrigin(0,0);

        // Setting up spotlight and gradient for shading

        this.platforms = [];
        const plat1 = this.add.rectangle(160, 394);
        this.physics.add.existing(plat1, true);
        plat1.body.setSize(192, 10);
        plat1.enemyCount = 0;
        const plat2 = this.add.rectangle(448, 330);
        this.physics.add.existing(plat2, true);
        plat2.body.setSize(256, 10);
        plat2.enemyCount = 0;
        const plat3 = this.add.rectangle(735, 394);
        this.physics.add.existing(plat3, true);
        plat3.body.setSize(192, 10);
        plat3.enemyCount = 0;
        this.platforms.push(plat1, plat2, plat3);

        // Setting up platform bounds and enemy count



        this.physics.add.collider(this.player, this.platforms, null, function (player, plat) {
            return player.body.velocity.y >= 0 && player.y < plat.y && (!player.cursors.down.isDown && !player.keys.S.isDown);
        }, this);
        // Null is an unneeded function, the third function is a collision filter, it returns true when the player velocity
        // is greater or equal to 0 and the player's position is above the platform so collision
        // only happens when those conditions are met, !player.cursors.down.isDown allows the player to dropdown

        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.lean, this.platforms);

        // Enemy and lean platform collision

        groundLayer.setCollisionByProperty({ collides: true });

        this.menuRevealed = false;

        this.events.once('MENU_REVEAL_COMPLETE', () => {
            this.menuMusic.play();
            this.menuRevealed = true;
            this.addStartListener();
        }); // Runs when the UI scene emits that the menu was revealed

        this.scene.get('UIScene').events.on('returnToMenu', () => {
            this.resetToMenu();
        });

        if (this.sys.game.device.input.touch) {
            this.dragging = false;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.dragDeltaX = 0;
            this.dragDeltaY = 0;

            this.input.on('pointerdown', pointer => {
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
                this.dragging = true;
            });

            this.input.on('pointermove', pointer => {
                if (!this.dragging) return;
                this.dragDeltaX = pointer.x - this.dragStartX;
                this.dragDeltaY = pointer.y - this.dragStartY;
            });

            this.input.on('pointerup', pointer => {
                this.dragging = false;
                this.dragDeltaX = 0;
                this.dragDeltaY = 0;
            });
        } // Sets up touch screen input for mobile

    }

    update() {
        this.spotlightTexture.clear(); // Rresets texture
        this.spotlightTexture.fill(0x000000, 0.7); // Fill with semi transparent black

        this.spotlightTexture.erase('spotlightGradient', this.player.x - this.spotlightRadius - this.cameras.main.scrollX, this.player.y - this.spotlightRadius - this.cameras.main.scrollY);
        // Erases circle in players position using created gradient texture

        this.player.update();

        if (!this.menuRevealed) return;

        this.enemySpawner.updateSpawnZones();

        if (this.player.health <= 0) this.handleGameOver();

    }

    /**
     * Hanndles damage taking, knockback, and temp invincibility when player is hit by an enemy
     * @param player
     * @param enemy
     */
    handlePlayerHit(player, enemy) {
        if (player.isInvincible) return;

        const randomHurt = Phaser.Math.RND.pick(this.hurtSounds);
        randomHurt.play();

        this.player.takeDamage(enemy.attackAmount)
        player.isInvincible = true;
        player.setAlpha(0.5);

       this.playerEnemyCollider.active = false;

        this.tweens.add({
            targets: player,
            alpha: 0.2,
            yoyo: true,
            repeat: 5,
            duration: 100,
            onComplete: () => player.setAlpha(1)
        }); // Invincibility effect

        this.time.delayedCall(1200, () => {
            player.isInvincible = false;
            player.setAlpha(1);
          this.playerEnemyCollider.active = true;
        });

        player.isKnockedBack = true;
       const knockbackStrength = 200;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        // Knockback direction
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        // Apply knockback
        player.setVelocityX(nx * knockbackStrength);
        player.setVelocityY(-200);
    }

    /**
     * Handles damage and knockback and visual effect when an enemy is hit by a bullet
     * @param enemy
     * @param bullet
     */
    handleEnemyHit(enemy, bullet) {
        if (!bullet.active) return;
        this.player.score += Math.floor(Math.random() * 4) + 1;

        enemy.isKnockedBack = true;
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        // Knocback direction


        enemy.setVelocityX(nx * this.player.stats.Knockback );
        enemy.setVelocityY(-200);

        bullet.setActive(false);
        bullet.setVisible(false);
        enemy.takeDamage(this.player.stats.Attack)
    }

    /**
     * Starts the game when the user clicks on the main menu
     */
    addStartListener() {
        if (!this.menuRevealed || this.awaitingStartClick || this.gameStarted) return;
        this.awaitingStartClick = true;
            this.input.once('pointerdown',  () => {
                this.awaitingStartClick = false;
                const UIScene = this.scene.get('UIScene');
                UIScene.events.emit('GAME_STARTED');
                this.gameStarted = true;
                this.menuMusic.stop();
                this.startSound.play();
                this.enemySpawner.start();
                this.leanSpawner.start();

                this.startSound.once('complete', () => {
                    this.gameMusic.play();
                });

            });
    }

    handleGameOver() {
        if (this.gameOver) return;
        this.physics.pause();
        this.gameOver = true;
        this.gameMusic.stop();
        this.scene.get('UIScene').events.emit('gameOver');
    }

    /**
     * Resets every object and spawner in game when the game ends
     */
    resetToMenu() {
        this.gameStarted = false;
        this.gameOver = false;

        this.player.setPosition(this.playerStartX, this.playerStartY);
        this.player.setFlipX(false);
        this.player.reset();
        this.enemySpawner?.reset();
        this.leanSpawner?.reset?.();

        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.destroy();
            }
        });
        this.bullets.children.iterate(bullet => {
            if (bullet && bullet.active) {
                bullet.destroy();
            }
        });
        this.eyeBullets.children.iterate(eyeBullet => {
            if (eyeBullet && eyeBullet.active) {
                eyeBullet.destroy();
            }
        });
        this.heartBullets.children.iterate(heartBullet => {
            if (heartBullet && heartBullet.active) {
                heartBullet.destroy();
            }
        });

        this.enemies.clear(true, true);

        this.bullets.clear(true, true);
        this.eyeBullets.clear(true, true);
        this.heartBullets.clear(true, true);

        this.lean.clear(true, true);

        this.physics.resume();

        this.scene.get('UIScene').events.emit('resetUI');

        this.menuMusic.play();

        this.menuRevealed = true;
        this.addStartListener();

        this.scene.get('UIScene').events.emit('RETURN_TO_MENU');
    }

}