import MainScene from './MainScene.js';
import UIScene from './UIScene.js';

/**
 * Clean Phaser setup for Kitty Carson
 * No hacks, no black screen, no forced click
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    backgroundColor: '#000000',

    pixelArt: true,
    roundPixels: true,

    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 600 }
        }
    },

    scene: [MainScene, UIScene]
};

const game = new Phaser.Game(config);
