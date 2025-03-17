const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;
const gravity = 1.5;
// --- Player Class ---
class Player {
    constructor() {
        this.position = { x: 100, y: 400 };
        this.velocity = { x: 0, y: 0 };
        this.width = 32;
        this.height = 36;
        this.speed = 8;
        this.frameIndex = 0;
        this.frameCount = 3;
        this.frameTimer = 0;
        this.frameInterval = 2;
        this.image = new Image();
        this.image.src = 'https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('Player sprite loaded!');
        };
    }
    draw() {
        const scale = 3;
        const spriteW = 16, spriteH = 19;
        const scaledW = spriteW * scale, scaledH = spriteH * scale;
        this.width = scaledW;
        this.height = scaledH;
        if (this.imageLoaded) {
            c.drawImage(
                this.image,
                this.frameIndex * spriteW, 0,
                spriteW, spriteH,
                this.position.x, this.position.y,
                scaledW, scaledH
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
        // Sprite Animation
        if (this.velocity.x !== 0) {
            this.frameTimer++;
            if (this.frameTimer > this.frameInterval) {
                this.frameIndex = (this.frameIndex + 1) % this.frameCount;
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
// --- Platform Class ---
class Platform {
    constructor(x, y, imageSrc) {
        this.position = { x, y };
        this.width = canvas.width;
        this.height = 100;
        this.velocity = { x: -3, y: 0 };
        this.image = new Image();
        this.image.src = imageSrc;
        this.imageLoaded = false;
        this.image.onload = () => this.imageLoaded = true;
    }
    draw() {
        if (this.imageLoaded) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }
    update() {
        this.position.x += this.velocity.x;
        if (this.position.x + this.width < 0) {
            this.position.x = canvas.width;
        }
        this.draw();
    }
}
// --- Obstacle Class ---
class Obstacle {
    constructor(x, y, imageSrc) {
        this.position = { x, y };
        this.width = Math.random() > 0.5 ? 80 : 50;
        this.height = Math.random() > 0.5 ? 40 : 30;
        this.velocity = {x: -2, y: 0};
        this.image = new Image();
        this.image.src = imageSrc;
        this.imageLoaded = false;
        this.image.onload = () => this.imageLoaded = true;
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
        this.position.x += this.velocity.x;
        this.draw();
    }
}
// --- Collectible Class ---
class Collectible {
    constructor(x, y, imageSrc) {
        this.position = { x, y };
        this.width = 30;
        this.height = 30;
        this.image = new Image();
        this.image.src = imageSrc;
        this.imageLoaded = false;
        this.image.onload = () => this.imageLoaded = true;
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
// --- Global Variables ---
const player = new Player();
let platforms = [], obstacles = [], collectibles = [];
let scrollOffset = 0, score = 0, gameOver = false;
const baseScrollSpeed = 2.5;
let scrollSpeed = baseScrollSpeed;
let lives = 3; // Number of lives

// --- Level Generation ---
function generateLevel() {
    platforms = [], 
    obstacles = [], 
    collectibles = [];
    let nextObstacleX = 400;
    let nextCollectibleX = 10;
    for (let i = -5; i < 10; i++) {
        let x = i * canvas.width;
        platforms.push(new Platform(x, 490, './plform.png'));

        if (x >= nextObstacleX) {
            obstacles.push(new Obstacle(x + Math.random(), 450, './Screenshot 2025-03-13 112821.png'));
            nextObstacleX += 700 + Math.random() * 300;
        }
        if (x >= nextCollectibleX) {
            collectibles.push(new Collectible(x + Math.random(), 420, './coin.png'));
            nextCollectibleX += 600 + Math.random() * 200;
        }
    }
}
generateLevel();
// --- Background ---
const backgroundImage = new Image();
backgroundImage.src = './bg.png';
let backgroundLoaded = false;
backgroundImage.onload = () => {
    backgroundLoaded = true;
    animate();
};
function drawBackground() {
    if (backgroundLoaded) {
        c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        c.fillStyle = 'skyblue';
        c.fillRect(0, 0, canvas.width, canvas.height);
    }
}
// --- Score Display ---
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'fixed';
scoreDisplay.style.top = '10px';
scoreDisplay.style.left = '10px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontSize = '24px';
scoreDisplay.style.fontWeight = 'bold';
document.body.appendChild(scoreDisplay);
// --- Lives Display ---
const livesDisplay = document.createElement('div');
livesDisplay.style.position = 'fixed';
livesDisplay.style.top = '40px';
livesDisplay.style.left = '10px';
livesDisplay.style.color = 'white';
livesDisplay.style.fontSize = '24px';
livesDisplay.style.fontWeight = 'bold';
livesDisplay.innerText = `Lives: ${lives}`;
document.body.appendChild(livesDisplay);
// --- Game Over Overlay ---
const gameOverOverlay = document.createElement('div');
Object.assign(gameOverOverlay.style, {
    position: 'fixed', 
    top: '0', 
    left: '0', 
    width: '100%', 
    height: '100%',
    background: 'rgba(0, 0, 0, 0.7)', 
    display: 'none',
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center', 
    color: 'red', 
    fontSize: '32px', 
    fontWeight: 'bold'
});
gameOverOverlay.innerHTML = `<div>You Lost!</div>`;
const restartButton = document.createElement('button');
restartButton.innerText = 'Restart';
Object.assign(restartButton.style, {
    marginTop: '20px',
     padding: '10px 20px', 
     fontSize: '18px',
    background: 'white',
     border: 'none', 
     borderRadius: '5px', 
     cursor: 'pointer'
});
restartButton.onclick = () => {
    gameOverOverlay.style.display = 'none';
    restartGame();
};
gameOverOverlay.appendChild(restartButton);
document.body.appendChild(gameOverOverlay);
// --- Restart Game ---
function restartGame() {
    gameOver = false;
    score = 0;
    lives = 3; // Reset lives
    livesDisplay.innerText = `Lives: ${lives}`;
    scrollOffset = 0;
    player.reset();
    generateLevel();
    animate();
}
// --- Animate Loop ---
const keys = {
    right: { pressed: false },
    left: { pressed: false }
};
function animate() {
    if (gameOver) return;
    requestAnimationFrame(animate);
    drawBackground();
    platforms.forEach(p => p.update());
    obstacles.forEach(o => o.update());
    collectibles.forEach(c => c.draw());
    player.update();

    // Movement
    if (!keys.left.pressed) player.velocity.x = 0.4;
    if (keys.left.pressed) player.velocity.x = -2;
    if (keys.right.pressed) {
        scrollOffset += scrollSpeed;
        platforms.forEach(p => p.position.x -= scrollSpeed);
        obstacles.forEach(o => o.position.x -= scrollSpeed);
        collectibles.forEach(c => c.position.x -= scrollSpeed);

        // Generate new obstacles and collectibles dynamically
        if (scrollOffset > canvas.width) {
            scrollOffset = 0; // Reset scroll offset
            const lastPlatformX = platforms[platforms.length - 1].position.x;
            platforms.push(new Platform(lastPlatformX + canvas.width, 490, './plform.png'));

            const lastObstacleX = obstacles.length > 0 ? obstacles[obstacles.length - 1].position.x : 400;
            obstacles.push(new Obstacle(lastObstacleX + 700 + Math.random() * 300, 450, './Screenshot 2025-03-13 112821.png'));

            const lastCollectibleX = collectibles.length > 0 ? collectibles[collectibles.length - 1].position.x : 10;
            collectibles.push(new Collectible(lastCollectibleX + 600 + Math.random() * 200, 420, './coin.png'));
        }
    }

    // Platform Collision
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
        }
    });

    // Obstacle Collision
    obstacles.forEach(ob => {
        if (player.position.x < ob.position.x + ob.width &&
            player.position.x + player.width > ob.position.x &&
            player.position.y < ob.position.y + ob.height &&
            player.position.y + player.height > ob.position.y) {
            lives -= 1; // Decrease lives
            livesDisplay.innerText = `Lives: ${lives}`;
            player.reset(); // Reset player position
            if (lives <= 0) {
                gameOver = true;
                gameOverOverlay.style.display = 'flex';
            }
        }
    });

    // Collectibles Collision
    collectibles.forEach((item, i) => {
        if (player.position.x < item.position.x + item.width &&
            player.position.x + player.width > item.position.x &&
            player.position.y < item.position.y + item.height &&
            player.position.y + player.height > item.position.y) {
            score += 10;
            collectibles.splice(i, 1);
        }
    });

    scoreDisplay.innerText = `Score: ${score}`;
}

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