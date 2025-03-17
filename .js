const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;
const gravity = 1.5; 

// Player class
class Player {
    constructor() {
        this.position = { x: 100, y: 400 };
        this.velocity = { x: 0, y: 0 };
        this.width = 32; 
        this.height = 36; 
        this.speed = 12
        this.frameIndex = 0;
        this.frameCount = 3; 
        this.frameTimer = 0;
        this.frameInterval = 2; 

        this.image = new Image();
        this.image.src = 'https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png';

        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('Player sprite loaded successfully!');
        };

        this.image.onerror = () => {
            console.error('Error loading player sprite. Check the file path.');
        };
    }

    draw() {
        if (this.imageLoaded) {
            const scale = 3;
            const spriteWidth = 16; 
            const spriteHeight = 19; 
            const scaledWidth = spriteWidth * scale;
            const scaledHeight = spriteHeight * scale;

            this.width = scaledWidth
            this.height = scaledHeight

            // Animate sprite when moving
            c.drawImage(
                this.image,
                this.frameIndex * spriteWidth, 0, 
                spriteWidth, spriteHeight, 
                this.position.x, this.position.y, // Position on canvas
                scaledWidth, scaledHeight // Drawn size
            );
        } else {
            c.fillStyle = 'red';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
        }

        // Update animation frame
        if (this.velocity.x !== 0) {
            this.frameTimer++;
            if (this.frameTimer > this.frameInterval) {
                this.frameIndex = (this.frameIndex + 1) % this.frameCount; // Cycle through frames
                this.frameTimer = 0;
            }
        } else {
            this.frameIndex = 0; 
        }
    }

    reset() {
        this.position = { x: 100, y: 400 };
        this.velocity = { x: 0, y: 0 };
    }
}

// Platform class
class Platform {
    constructor(x, y, imageSrc) {
        this.position = { x, y };
        this.width = canvas.width;
        this.height = 100;
        this.velocity = { x: -3, y: 0 }; // Faster movement
        this.image = new Image();
        this.image.src = imageSrc;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
    draw() {
        if (this.imageLoaded) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }
    update() {
        this.position.x += this.velocity.x; // Update position based on velocity

        // Reset platform position when it moves off-screen
        if (this.position.x + this.width < 0) {
            this.position.x = canvas.width;
        }

        this.draw();
    }
}

// Obstacle class
class Obstacle {
    constructor(x, y, imageSrc) {
        this.position = { x, y };
        this.width = Math.random() > 0.5 ? 80 : 50;
        this.height = Math.random() > 0.5 ? 40 : 30;
        this.velocity = { x: -2, y: 0 }; // Move left at a speed of 2

        this.image = new Image();
        this.image.src = imageSrc;
        this.imageLoaded = false;

        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            c.fillStyle = 'red';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.position.x += this.velocity.x; // Update position based on velocity

        // Reset obstacle position when it moves off-screen
        if (this.position.x + this.width < 0) {
            this.position.x = canvas.width + Math.random() * 500; // Reset to a random position
        }

        this.draw();
    }
}

class Collectible {
    constructor(x, y, imageSrc) {
        this.position = { x, y};
        this.width = 30;
        this.height = 30;

        this.image = new Image ();
        this.image.src = imageSrc
        this.imageLoaded = false;

        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
    draw() {
        if (this.imageLoaded) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            c.fillStyle = 'yellow';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
}
let baseScrollSpeed = 2.5;
let scrollSpeed = baseScrollSpeed;
let score = 0;
let gameOver = false;
const player = new Player();
let Collectibles = [];
let platforms = [];
let obstacles = [];
let scrollOffset = 0;

// Generate infinite platforms and obstacles
function generateLevel() {
    platforms = [];
    obstacles = [];
    Collectibles = [];

    for (let i = -5; i < 10; i++) { // Generate enough platforms
        let x = i * canvas.width; // Make sure each platform connects
        platforms.push(new Platform(x, 490, './plform.png'));

        // Add two obstacles on each platform
        if (x >= obstacles) {
            obstacles.push(new Obstacle(x + Math.random() * 200 + 300, 450, './Screenshot 2025-03-13 112821.png'));
            obstacles += 600 + Math.random() * 300;
          }
        
        // Add a collectible on every second platform
        if (i % 2 === 0) {
            let collectibleImage = './coin.png';
            Collectibles.push(new Collectible(x + 600, 420, collectibleImage)); // Place above ground
        }
    }
}

generateLevel();
const keys = {
    right: { pressed: false },
    left: { pressed: false }
};

// Load background image
const backgroundImage = new Image();
backgroundImage.src = './bg.png';

let backgroundLoaded = false;
backgroundImage.onload = () => {
    backgroundLoaded = true;
    console.log('Background loaded successfully!');
    animate();
};

backgroundImage.onerror = () => {
    console.error('Error loading background image. Check the file path.');
};

// Function to draw the background
function drawBackground() {
    if (backgroundLoaded) {
        c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        c.fillStyle = 'skyblue'; // Fallback color if image doesn't load
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
}
const gameOverOverlay = document.createElement('div');
gameOverOverlay.style.position = 'fixed';
gameOverOverlay.style.top = '0';
gameOverOverlay.style.left = '0';
gameOverOverlay.style.width = '100%';
gameOverOverlay.style.height = '100%';
gameOverOverlay.style.background = 'rgba(0, 0, 0, 0.7)';
gameOverOverlay.style.display = 'flex';
gameOverOverlay.style.flexDirection = 'column';
gameOverOverlay.style.alignItems = 'center';
gameOverOverlay.style.justifyContent = 'center';
gameOverOverlay.style.color = 'red';
gameOverOverlay.style.fontSize = '35px';
gameOverOverlay.style.fontWeight = 'bold';
gameOverOverlay.style.display = 'none'; // Initially hidden

const message = document.createElement('div');
message.innerText = 'You Lost!';
gameOverOverlay.appendChild(message);

const restartButton = document.createElement('button');
restartButton.innerText = 'Restart';
restartButton.style.marginTop = '20px';
restartButton.style.padding = '10px 20px';
restartButton.style.fontSize = '18px';
restartButton.style.cursor = 'pointer';
restartButton.style.background = 'white';
restartButton.style.border = 'none';
restartButton.style.borderRadius = '5px';

restartButton.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    restartGame();
});

gameOverOverlay.appendChild(restartButton);
document.body.appendChild(gameOverOverlay);


function restartGame() {
    gameOver = false; 
    player.reset();
    scrollOffset = 0;
    score = 0;
    scrollSpeed = baseScrollSpeed;
    generateLevel();
    gameOverOverlay.style.display = 'none'; 
    animate();
}


 
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'fixed';
scoreDisplay.style.top = '10px';
scoreDisplay.style.left = '10px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontSize = '24px';
scoreDisplay.style.fontWeight = 'bold';
document.body.appendChild(scoreDisplay);


function animate() {
    if (gameOver) return; // Stops the game loop when you lose

    requestAnimationFrame(animate);
    drawBackground();

    platforms.forEach(platform => platform.update()); // Update platforms
    Collectibles.forEach(collectible => collectible.draw()); // Coins remain fixed
    player.update();

    // Automatic movement
    if (!keys.left.pressed) {
        player.velocity.x = 0.4;
    } else {
        player.velocity.x = -2;
    }

    if (keys.right.pressed) {
        scrollOffset += scrollSpeed;
        platforms.forEach(platform => platform.position.x -= scrollSpeed);
        Collectibles.forEach(collectible => collectible.position.x -= scrollSpeed);
    }

    // Collision detection with platforms
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0; // Stop falling
        }
    });

    // Collision detection with obstacles (Game Over)
    obstacles.forEach(obstacle => {
        if (player.position.x < obstacle.position.x + obstacle.width &&
            player.position.x + player.width > obstacle.position.x &&
            player.position.y < obstacle.position.y + obstacle.height &&
            player.position.y + player.height > obstacle.position.y) {

            console.log('Game Over!');
            gameOver = true;
            gameOverOverlay.style.display = 'flex'; // Show pop-up
        }
    });

    // Collision detection with collectibles (Increase score)
    Collectibles.forEach((collectible, index) => {
        if (
            player.position.x < collectible.position.x + collectible.width &&
            player.position.x + player.width > collectible.position.x &&
            player.position.y < collectible.position.y + collectible.height &&
            player.position.y + player.height > collectible.position.y
        ) {
            score += 10;
            Collectibles.splice(index, 1);
        }
    });

    scoreDisplay.innerText = `score: ${score}`;
}
animate(); // to start the game

addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
        case 37:
            keys.left.pressed = true;
            player.velocity.x = -player.speed;
            break;
        case 68:
        case 39:
            keys.right.pressed = true;
            player.velocity.x = player.speed * 2;
            break;
        case 87:
        case 38:
            if (player.velocity.y === 0) {
                player.velocity.y = -29;
            }
            break;
    }
});
addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
        case 37:
            keys.left.pressed = false;
            if (!keys.right.pressed) player.velocity.x = 0;
            break;
        case 68:
        case 39:
            keys.right.pressed = false;
            if (!keys.left.pressed) player.velocity.x = 0;
            break;
    }
});