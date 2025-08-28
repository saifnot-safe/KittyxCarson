
import MainScene from './MainScene.js';
import UIScene from './UIScene.js';

/**
 * main.js
 * Starts and configures the Kitty Carson game using Phaser.js
 */

window.addEventListener('click', () => {
    document.body.classList.add('started');
}, { once: true }); // Used to remove cursor pointer gesture once user clicks the black screen
// to start the game

window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('blackCover');
        if (loadingScreen) loadingScreen.remove();
    }, 1500);
}); // Removes temporary loading black screen


const config = {
    type: Phaser.AUTO,
    width: 896,
    height: 576,
    backgroundColor: '#ffffff',
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity:{y:600}
        }


    },
    scene: [MainScene, UIScene]
};

const game = new Phaser.Game(config);
