let movingLeft = false;
let movingRight = false;
let menuImage;
let backgroundImage;
let obstacleImage;
let gameOver = false;
let explosions = [];
let player;
let obstacles = [];
let bullets = [];
let score = 0;
let gameStarted = false;
const initialSpawnRate = 60;
const maxObstacleSpeed = 10;
const speedIncrement = 0.1;
let obstacleSpeed = 3;
let gamePaused = false;

function preload() {
    menuImage = loadImage('img/menu.jpg');
    backgroundImage = loadImage('img/Fresh idea.png');
    obstacleImage = loadImage('img/asteroid.png');
}

function setup() {
    createCanvas(windowWidth - 20, windowHeight - 1);
    drawMenu();
    player = new Player();
    setInterval(increaseObstacleSpeed, 20000);
}


function drawMenu() {
    background(menuImage); 
    textAlign(CENTER, CENTER);

    fill(255);
    textSize(36);
    text("AstroShip", width / 2, height / 2 - 50);

    fill(255);
    rect(width / 2 - 60, height / 2 + 15, 120, 30);
    fill(0);
    textSize(16);
    text("Livello 1", width / 2, height / 2 + 30);
}

function draw() {
    if (!gameStarted) {
        return; // Esce dalla funzione draw() se il gioco non è ancora iniziato
    }

    image(backgroundImage, 0, 0, windowWidth, windowHeight);

    if (!gameOver) {
        player.update();
        player.show();
    }

    if (!gameOver && !gamePaused) {
        obstacleSpeed = min(maxObstacleSpeed, obstacleSpeed + speedIncrement);
    }

    if (gamePaused) {
        drawMenu();
        mousePressed();
        return;
    }

    let spawnRate = initialSpawnRate;

    let obstacleCount = 1 + floor(score / 20);

    if (frameCount % spawnRate === 0) {
        for (let i = 0; i < obstacleCount; i++) {
            let obstacleX = random(width);
            let obstacleY = -100;
            while (tooClose(obstacleX, obstacleY)) {
                obstacleX = random(width);
            }
            let obstacle = new Obstacle(obstacleX, obstacleY, obstacleSpeed);
            obstacles.push(obstacle);
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].show();

        for (let j = obstacles.length - 1; j >= 0; j--) {
            if (bullets[i].hits(obstacles[j])) {
                let obstacleCenter = obstacles[j].getCenter();
                let explosion = new Explosion(obstacleCenter.x, obstacleCenter.y);
                explosions.push({ explosion: explosion, obstacle: obstacles[j] });
                obstacles.splice(j, 1);
                bullets.splice(i, 1);
                score++;
                break;
            }
        }

        if (bullets[i] && bullets[i].offscreen()) {
            bullets.splice(i, 1);
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].hits(player)) {
            console.log("Game over!");
            gameOver = true;
            break;
        }

        if (obstacles[i].offscreen()) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].explosion.update();
        let explosion = explosions[i].explosion;
        if (explosions[i].obstacle) {
            let obstacleCenter = explosions[i].obstacle.getCenter();
            explosion.show(obstacleCenter.x, obstacleCenter.y);
        }
        if (explosion.isFinished()) {
            explosions.splice(i, 1);
        }
    }


    if (!gameOver) {
        // Genera gli ostacoli in base al tempo di spawn
        if (frameCount % spawnRate === 0) {
            let obstacle = new Obstacle();
            obstacles.push(obstacle);
        }
    }

    
    if (!gameOver) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].show();

            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1);
                score++;
            }
        }
    }

    if (gameOver) {
        background(backgroundImage);
        textAlign(CENTER);
        textSize(50);
        fill(255);
        text("Game Over", width / 2, height / 2);
        return;
    }

    if (!gameOver && score>=200) {
        background(backgroundImage);
        textAlign(CENTER);
        textSize(50);
        fill(255);
        text("You Win", width / 2, height / 2);
        return;
    }

    textSize(20);
    text("Score: " + score, 40, 30);
}



function tooClose(x, y) {
    for (let i = 0; i < obstacles.length; i++) {
        let d = dist(x, y, obstacles[i].x, obstacles[i].y);
        if (d < 100) { 
            return true;
        }
    }
    return false;
}

function increaseObstacleSpeed() {
    obstacleSpeed += speedIncrement;
}

function mousePressed() {
    if (!gameStarted) {
        if (mouseX > width / 2 - 60 && mouseX < width / 2 + 60) {
            if (mouseY > height / 2 + 15 && mouseY < height / 2 + 30) {
                console.log("Livello 1 iniziato!");
                gameStarted = true;
            }
        }
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        movingLeft = true;
    } else if (keyCode === RIGHT_ARROW) {
        movingRight = true;
    } else if (key === ' ') {
        let bullet = new Bullet(player.x, player.y);
        bullets.push(bullet);
    } else if (keyCode === ENTER && gameOver) {
        restartGame(); 
    }
}


function restartGame() {
    gameOver = false;
    gamePaused = false;
    score = 0;
    player = new Player();
    obstacles = [];
    bullets = [];
    explosions = [];
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        movingLeft = false;
    } else if (keyCode === RIGHT_ARROW) {
        movingRight = false;
    }
}


class Player {
    constructor() {
        this.img = loadImage('img/astro.png');
        this.x = width / 2;
        this.y = height - 50;
        this.speed = 8;
        this.scale = 2;
        this.width = 20 * this.scale;
        this.height = 20 * this.scale;
    }

    update() {
        if (!gameOver) {
            if (movingLeft) {
                this.x -= this.speed;
            } else if (movingRight) {
                this.x += this.speed;
            }

            this.x = constrain(this.x, 0, width - this.width);
        }
    }


    show() {
        image(this.img, this.x, this.y, this.width, this.height);
    }

    hits(obstacle) {
        if (!gameOver && !this.exploded) {
            let playerCenter = this.getCenter();
            let obstacleCenter = obstacle.getCenter();
            let dX = obstacleCenter.x - playerCenter.x;
            let dY = obstacleCenter.y - playerCenter.y;
            let distance = sqrt(dX * dX + dY * dY);
            //console.log("distanza tra player e ostacolo:", distance);
            let hit = distance < this.width / 2 + obstacle.size / 2;
            if (hit) {
                gameOver = true;
                return true;
            }
        }
        return false; // Indica che non c'è stata alcuna collisione
    }
    getCenter() {
        let centerX = this.x + this.width / 2;
        let centerY = this.y + this.height / 2;
        return createVector(centerX, centerY);
    }
}

class Obstacle {
    constructor(x, y, speed) {
        this.x = x; // Posizione iniziale sull'asse X
        this.y = y; // Posizione iniziale sull'asse Y
        this.speed = speed; // Velocità dell'ostacolo
        this.size = 50; // Dimensione dell'ostacolo
    }

    update() {
        this.y += this.speed;
    }

    show() {
        image(obstacleImage, this.x, this.y, this.size, this.size);
    }

    offscreen() {
        return this.y > height + this.size;
    }

    hits(player) {
        let playerCenter = player.getCenter();
        let obstacleCenter = this.getCenter();
        let dX = obstacleCenter.x - playerCenter.x;
        let dY = obstacleCenter.y - playerCenter.y;
        let distance = sqrt(dX * dX + dY * dY);
        let hit = distance < this.size / 2 + player.width / 2;
        if (hit) {
            gameOver = true;
        }
        return hit;
    }

    getCenter() {
        let centerX = this.x + this.size / 2;
        let centerY = this.y + this.size / 2;
        return createVector(centerX, centerY);
    }
}


class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.size = 10;
    }

    update() {
        this.y -= this.speed;
    }

    show() {
        fill(255);
        ellipse(this.x, this.y, this.size, this.size);
    }

    offscreen() {
        return this.y < 0;
    }

    hits(obstacle) {
        let dX = this.x - obstacle.x - obstacle.size / 2;
        let dY = this.y - obstacle.y - obstacle.size / 2;
        let distance = sqrt(dX * dX + dY * dY);
        let hit = distance < this.size / 2 + obstacle.size / 2;
        if (hit) {
            let obstacleCenter = obstacle.getCenter();
            let explosion = new Explosion(obstacleCenter.x, obstacleCenter.y);
            explosions.push({ explosion: explosion, obstacle: obstacle }); 
        }
        return hit;
    }
    

    
}
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frameIndex = 0; // Indice del frame dell'animazione
        this.frames = []; // Array di immagini per l'animazione
        this.loaded = false; // Flag per indicare se l'esplosione è completamente caricata
        this.finished = false; // Imposta il flag 'finished' su false all'inizio
        const numFrames = 4;
        const explosionSize = 100;
        for (let i = 1; i <= numFrames; i++) {
            let img = loadImage('img/explosions/' + i + '.png', () => {
                img.resize(explosionSize, explosionSize);
                this.frames.push(img);
                if (this.frames.length === numFrames) {
                    this.loaded = true;
                }
            });
        }
    }
    
    update() {
        if (!this.loaded || this.finished) return;
        
        this.frameIndex++;
        if (this.frameIndex >= this.frames.length - 1) {
            // Reset the frame index to loop the animation
            this.frameIndex = 0;
            // Set the 'finished' flag to true when the animation loops back to the beginning
            this.finished = true;
        } else {
            // Set the 'finished' flag to false if the animation is still in progress
            this.finished = false;
        }
    }
    
    
    // Metodo per mostrare l'animazione dell'esplosione
    show(centerX, centerY) {
        // Se l'esplosione non è completamente caricata o se l'immagine è undefined, esci dalla funzione
        if (!this.loaded || !this.frames[this.frameIndex]) return;

        const explosionSize = this.frames[this.frameIndex].width;
        const x = centerX - explosionSize / 2;
        const y = centerY - explosionSize / 2;
        image(this.frames[this.frameIndex], x, y);
    }

    isFinished() {
        return this.finished;
    }
}