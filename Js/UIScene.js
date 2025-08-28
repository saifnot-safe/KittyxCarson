/**
 * UIScene.js
 * Handles all user interface loading, creation and updates
 */
export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');

    }

    init(data) {
        this.player = data.player;
    }

    preload() {
        this.load.audio('menuMusic', "assets/Audio/Green PurrRoom.wav");
        this.load.image('xpOverlay', 'assets/XPOverlay.png');
        this.load.image('healthOverlay', 'assets/Health Bar Overlay.png');
        this.load.image('title', 'assets/Kitty Carson Title 2.png');
        this.load.image('button', 'assets/button.png')

    }
    create() {
        const { width, height } = this.cameras.main;

        this.title = this.add.image(width/2, 125, 'title');
        this.title.setScale(2);

        this.pressToPlay = this.add.text(width / 2 - 10, height / 2 - 30, 'Press to Start', {
            fontFamily: 'Pixellari',
            fontSize: '24px',
            fill: '#ffffff'
        })
            .setOrigin(0.5)
            .setAlpha(0);

        // Flashing effect
        this.tweens.add({
            targets: this.pressToPlay,
            alpha: 1,
            duration: 800,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.flashTween = this.tweens.add({
                    targets: this.pressToPlay,
                    alpha: 0,
                    duration: 1500,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            }
        });


        // Bobbing effect
        this.tweens.add({
            targets: this.title,
            y: this.title.y + 20,
            alpha: 1,
            duration: 1000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.title,
                    y: this.title.y - 10,
                    duration: 1500,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });


            }
        });

        this.healthLabel = this.add
            .text(170, 15, 'Health ', {
                fontFamily: 'Chopin Script',
                fontSize: '36px',
                fill: '#b31010'
            });

        this.xpLabel = this.add.text(140, 47, 'lvl  ' + this.player.level, {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff'
        });

        this.scoreLabel = this.add.text(800, 27, 'Score:  ' + this.player.score, {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff'
        });

        const uiStart = -80;
        const uiTarget = 0;

        this.healthBar = this.add.graphics();
        this.healthBar.fillStyle(0x741b11, 1);
        this.healthBar.fillRect(25, 30, 130, 10);
        this.healthOverlay = this.add.image(90, 35, 'healthOverlay')
        this.healthOverlay.setScale(1.25);

        this.xpBar = this.add.graphics();
        this.xpBar.fillStyle(0xd4d4d4, 1);
        this.xpBar.fillRect(26, 52, 103, 6);
        this.xpOverlay = this.add.image(77, 55, 'xpOverlay');

        this.fullHealthBar = 130;
        this.fullXpBar = 103;

        this.topUI = this.add.container(0, uiStart, [
            this.healthLabel,
            this.xpLabel,
            this.healthBar,
            this.healthOverlay,
            this.xpBar,
            this.xpOverlay,
            this.scoreLabel
        ]);

        this.upgradeMenu = this.add.container(-210, 400);

        const colors = {
            Health: 0xdfa6e0,
            Attack: 0xfa8282,
            Range: 0x978cdb,
            Reload: 0x6bdbb4,
            Knockback: 0xe8dba7,
        };

        const stats = ['Health', 'Attack', 'Range', 'Reload', 'Knockback'];
        const maxBlocks = 8;
        this.statBars = {};

        // Adds buttons for each stat
        stats.forEach((stat, statIndex) => {
            const btnY = 10 + statIndex * 30;
            const btn = this.add.image(110, btnY, 'button').setTint(colors[stat]).setInteractive()
                .on('pointerdown', () => {this.player.applyUpgrade(stat), btn.setAlpha(0.5)});

            // Adds blocks for each stat
            this.statBars[stat] = [];
            for (let i = 0; i < maxBlocks; i++) {
                const block = this.add.rectangle(
                    i * 12,
                     5 + statIndex * 30,
                    10,10,
                    0x555555
                ).setOrigin(0);
                this.upgradeMenu.add(block);
                this.statBars[stat].push(block);

            }
            // Stat names
            const label = this.add.text(0, btnY, `${stat}`, {fontSize: '12px',  fontFamily: 'Pixellari', color: '#f8f8f8'})
                .setOrigin(0, 1.5);

            btn.on('pointerover', () => {
                btn.setAlpha(0.7);
            });

            btn.on('pointerout', () => {
                btn.setAlpha(1);
            });

            this.upgradeMenu.add([btn, label]);
        });

        this.levelUpText = this.add.text(55, -27, 'Level up! x' + this.player.upgradePoints, {
            fontSize: '18px',
            fontFamily: 'Pixellari',
            color: '#eaefef',

        }).setOrigin(0.5);
        this.levelUpText.setVisible(false);

        this.upgradeMenu.add(this.levelUpText);

        this.menuOverlay = this.add
            .renderTexture(0, 0, width, height)
            .setOrigin(0, 0)
            .setDepth(100)
            .setScrollFactor(0);
        this.menuOverlay.fill(0x000000, 1);

        this.eraseCircle = this.make.graphics({ add: false });
        this.eraseCircle.fillStyle(0xffffff, 1);

        this.gameOverContainer = this.add.container(0, 0).setVisible(false);

        let overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.75).setOrigin(0);
        let gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Game Over', { fontFamily: 'Chopin Script', fontSize: '48px', fill: '#800e0e' }).setOrigin(0.5);
        let returnButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 20, 'Return to Menu', { fontFamily: 'Pixellari', fontSize: '32px', fill: '#efefef' }).setOrigin(0.5).setInteractive();

        returnButton.on('pointerdown', () => {
            this.gameOverContainer.setVisible(false);
            this.events.emit('returnToMenu');
        });
        returnButton.on('pointerover', () => {
            returnButton.setAlpha(0.6);
        });
        returnButton.on('pointerout', () => {
            returnButton.setAlpha(1);
        });

        this.gameOverContainer.add([overlay, gameOverText, returnButton]);

        this.events.on('gameOver', () => {
            this.gameOverContainer.setVisible(true);
        });

        this.input.once('pointerdown',  () => this.revealMainMenu());
        this.input.keyboard.once('keydown', () => this.revealMainMenu());

        this.menuRevealed = false;

        // Removes main menu UI when the game starts
        this.events.on('GAME_STARTED', () => {
            this.tweens.killTweensOf(this.title);
            if (this.flashTween) {
                this.flashTween.stop();
                this.flashTween = null;
            }
            this.pressToPlay.destroy();
            this.tweens.add({
                targets   : this.topUI,
                y         : uiTarget,
                ease      : 'Cubic.out',
                duration  : 500
            });
            this.tweens.add({
                targets   : this.title,
                y         : uiStart,
                ease      : 'Cubic.out',
                duration  : 500
            });

        });

        this.events.on('resetUI', () => {
            this.hideUpgradeMenu();
        });

        // Resets main menu
        this.events.on('RETURN_TO_MENU', () => {

            if (this.title) {
                this.tweens.killTweensOf(this.title);
                this.title.destroy();
            }

            if (this.pressToPlay) {
                this.tweens.killTweensOf(this.pressToPlay);
                this.pressToPlay.destroy();
            }

            this.hideUpgradeMenu();

            this.topUI.y = -80;

            this.title = this.add.image(width / 2, 125, 'title');
            this.title.setScale(2);

            this.pressToPlay = this.add.text(width / 2 - 10, height / 2 - 30, 'Press to Start', {
                fontFamily: 'Pixellari',
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: this.pressToPlay,
                alpha: 1,
                duration: 800,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.flashTween = this.tweens.add({
                        targets: this.pressToPlay,
                        alpha: 0,
                        duration: 1500,
                        ease: 'Sine.easeInOut',
                        yoyo: true,
                        repeat: -1
                    });
                }
            });

            this.tweens.add({
                targets: this.title,
                y: this.title.y + 20,
                alpha: 1,
                duration: 1000,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: this.title,
                        y: this.title.y - 10,
                        duration: 1500,
                        ease: 'Sine.easeInOut',
                        yoyo: true,
                        repeat: -1
                    });
                }
            });
        });



    }

    update() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x46110b, 1);
        this.healthBar.fillRect(25, 30, this.fullHealthBar * this.player.health/this.player.stats.maxHealth, 10);

        this.xpBar.clear();
        this.xpBar.fillStyle(0x8c8d90, 1);
        this.xpBar.fillRect(26, 52, this.fullXpBar * this.player.xpEarned/this.player.xpNeeded, 6);
        this.xpLabel.setText('lvl  ' + this.player.level);

        this.scoreLabel.setText('Score:  ' + this.player.score);

    }

    revealMainMenu() {
        if (this.menuRevealed) return;
        this.menuRevealed = true;

        const { width, height } = this.cameras.main;
        const maxRadius = Math.hypot(width, height);

        this.tweens.addCounter({
            from: 0,
            to:   maxRadius,
            duration: 1000,
            ease:     'linear',
            onUpdate: tween => {
                const r = tween.getValue();
                this.eraseCircle.clear();

                const steps = 20;
                for (let i = 0; i < steps; i++) {
                    const stepRadius = (r * i) / steps;
                    const alpha = 1 - Math.pow(i / steps, 2);
                    this.eraseCircle.fillStyle(0xffffff, alpha);
                    this.eraseCircle.fillCircle(0, 0, stepRadius);
                }

                this.menuOverlay.clear();
                this.menuOverlay.fill(0x000000, 1);
                this.menuOverlay.erase(this.eraseCircle, width / 2, height / 2);
            },
            onComplete: () => {
                this.eraseCircle.destroy();
                this.menuOverlay.destroy();

                const mainScene = this.scene.get('MainScene');
                mainScene.events.emit('MENU_REVEAL_COMPLETE');
            }
        });
    }


    showUpgradeMenu() {
        this.tweens.add({
            targets: this.upgradeMenu,
            x: 10,
            ease: 'Power2',
            duration: 1000
        });

        this.levelUpText.setText('LEVEL UP! x' + this.player.upgradePoints)
        this.levelUpText.setVisible(true);
        this.tweens.add({
            targets: this.levelUpText,
            alpha: { from: 1, to: 0 },
            yoyo: true,
            repeat: 5,
            duration: 300,
            ease: 'Sine.easeInOut'
        });

    }

    hideUpgradeMenu() {
        this.tweens.add({
            targets: this.upgradeMenu,
            x: -210,
            ease: 'Power2',
            duration:1000
        });
    }

    updateStatBlocks(stat, level, color) {
        this.levelUpText.setText('LEVEL UP! x' + this.player.upgradePoints)
        const blocks = this.statBars[stat];
        for (let i = 0; i < blocks.length; i++) {
            if (i < level) {
                blocks[i].fillColor = color;
            } else {
                blocks[i].fillColor = 0x555555;
            }
        }
    }

}