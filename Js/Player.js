/**
 * Player.js
 * Handles the player and their stats, health state, level state and controls
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {

constructor(scene, x,y, texture) {
    super(scene, x,y, texture);

    this.uiScene = this.scene.scene.get('UIScene');

    this.stats = {
        maxHealth: 100,
        Attack: 10,
        Range: 200,
        Reload: 1000,
        Knockback: 10
    };
    this.statLevels = {
        Health: 0,
        Attack: 0,
        Range: 0,
        Reload: 0,
        Knockback: 0
    };

    this.dmgTaken = 0;

    this.level = 1;
    this.score = 0;
    this.xpNeeded = 100;
    this.xpEarned = 0;
    this.upgradePoints = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.isAttacking = false;
    this.setDragX(200);

    this.setScale(2);
    this.setSize(20,20);
    this.setBounce(0);

    this.setCollideWorldBounds(true);

    this.isInvincible = false;

    // Keyboard input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
}

    shoot() {
    if (!this.scene.gameStarted) return;

    if (this.isAttacking) return;

    this.isAttacking = true;
    this.anims.play('attack', true);
    const bullet = this.scene.bullets.get();
    if (bullet) {
        bullet.fire(this.x, this.y, this.flipX, this);
    }

    this.scene.time.delayedCall(this.stats.Reload, () => {
        this.isAttacking = false;
    });

}

get health() {
    return this.stats.maxHealth - this.dmgTaken;
}


takeDamage(amount) {
   this.dmgTaken = Math.min(this.stats.maxHealth, this.dmgTaken + amount);
}

heal() {
    this.dmgTaken =  Math.max(0, this.dmgTaken - 20 - 2 * this.level);
}


earnXP(amount) {
    this.xpEarned = Math.min(this.xpNeeded, this.xpEarned + amount);
    if (this.xpEarned >= this.xpNeeded) {
        this.levelUp();
    }
}

levelUp() {
    this.score += 250;
    this.level += 1;
    this.upgradePoints += 1;
    this.xpEarned = 0;
    this.xpNeeded =  Math.floor(100 * Math.pow(1.25, this.level));

    this.uiScene.showUpgradeMenu();

}

    /**
     * Upgrades the stat chosen by the player without exceeding a maximum of 8 upgrades
     * @param stat is the stat chosen by the player
     */
    applyUpgrade(stat) {
    if (this.statLevels[stat] >= 8) return; // So stats don't exceed the maximum
        switch (stat) {
            case 'Health':
                this.upgradePoints -= 1;
                this.stats.maxHealth += 20;
                this.statLevels[stat] += 1;
                this.uiScene.updateStatBlocks('Health', this.statLevels.Health, 0xdfa6e0);

                if (this.upgradePoints < 1) {
                    this.uiScene.hideUpgradeMenu();
                }
                break;
            case 'Attack':
                this.upgradePoints -= 1;
                this.stats.Attack += 5;
                this.statLevels[stat] += 1;
                this.uiScene.updateStatBlocks('Attack', this.statLevels.Attack, 0xfa8282);

                if (this.upgradePoints < 1) {
                    this.uiScene.hideUpgradeMenu();
                }
                break;
            case 'Range':
                this.upgradePoints -= 1;
                this.stats.Range += 150;
                this.statLevels[stat] += 1;
                this.uiScene.updateStatBlocks('Range', this.statLevels.Range,0x978cdb);

                if (this.upgradePoints < 1) {
                    this.uiScene.hideUpgradeMenu();
                }
                break;
            case 'Reload':
                this.upgradePoints -= 1;
                this.stats.Reload = Math.max(100, this.stats.Reload - 100);
                this.statLevels[stat] += 1;
                this.uiScene.updateStatBlocks('Reload', this.statLevels.Reload, 0x6bdbb4);

                if (this.upgradePoints < 1) {
                    this.uiScene.hideUpgradeMenu();
                }
                break;
            case 'Knockback':
                this.upgradePoints -= 1;
                this.stats.Knockback += 50;
                this.statLevels[stat] += 1;
                this.uiScene.updateStatBlocks('Knockback', this.statLevels.Knockback, 0xe8dba7);

                if (this.upgradePoints < 1) {
                    this.uiScene.hideUpgradeMenu();
                }
                break;

        }

    }

    /**
     * Used on game end/when returning to main menu
     */
    reset() {

        this.stats = {
            maxHealth: 100,
            Attack: 10,
            Range: 200,
            Reload: 1000,
            Knockback: 10
        };

        this.statLevels = {
            Health: 0,
            Attack: 0,
            Range: 0,
            Reload: 0,
            Knockback: 0
        };

        this.uiScene.updateStatBlocks('Health', this.statLevels.Health, 0xdc87df);
        this.uiScene.updateStatBlocks('Attack', this.statLevels.Health, 0xdc87df);
        this.uiScene.updateStatBlocks('Range', this.statLevels.Health, 0xdc87df);
        this.uiScene.updateStatBlocks('Reload', this.statLevels.Health, 0xdc87df);
        this.uiScene.updateStatBlocks('Knockback', this.statLevels.Health, 0xdc87df);


        this.dmgTaken = 0;

        this.level = 1;
        this.score = 0;
        this.xpNeeded = 100;
        this.xpEarned = 0;
        this.upgradePoints = 0;

    }

update() {
    if (!this.scene.gameStarted) {
        this.anims.play('idle', true);
        return;
    }
    const speed = 160;
    const jumpSpeed = -440;
    const onGround = this.body.blocked.down;

    if (this.isKnockedBack) {
        this.scene.time.delayedCall(300, () => {
            this.isKnockedBack = false;
        });
        return;
    }

    // Grab drag info from MainScene
    const mainScene = this.scene;
    const isTouch = mainScene.sys.game.device.input.touch;
    const dragging = isTouch && mainScene.dragging;
    const deltaX = dragging ? mainScene.dragDeltaX : 0;
    const deltaY = dragging ? mainScene.dragDeltaY : 0;

    let moveLeft = this.cursors.left.isDown || this.keys.A.isDown;
    let moveRight = this.cursors.right.isDown || this.keys.D.isDown;
    let jump = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;
    let down = this.cursors.down.isDown || this.keys.S.isDown;

    // Setting up mobile dragging
    if (dragging) {
        const threshold = 10;
        moveLeft = deltaX < -threshold;
        moveRight = deltaX > threshold;
        jump = jump || (deltaY < -30 && onGround); // Drag up to jump
        down = down || (deltaY > 30 && !onGround); // Drag down in air to fall faster (optional)
    }

    // Horizontal movement
    if (moveLeft) {
        this.setVelocityX(-speed);
        if (onGround) this.anims.play('running', true);
        this.setFlipX(true);
    } else if (moveRight) {
        this.setVelocityX(speed);
        if (onGround) this.anims.play('running', true);
        this.setFlipX(false);
    } else {
        this.setVelocityX(0);
        if (onGround) this.anims.play('idle', true);
    }

    // Vertical movement
    if (jump && onGround) {
        this.setVelocityY(jumpSpeed);
        this.anims.play('jumping', true);
    }
    if (down && !onGround) {
        this.setVelocityY(-jumpSpeed / 1.25);
        this.anims.play('falling', true);
    }

    if (!onGround && this.body.velocity.y > 0) {
        this.anims.play('falling', true);
    }
}

}