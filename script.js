// Screen
let screen;
let screenWidth = 360;
let screenHeight = 640;
let context;

// Bat
let batWidth = 56; // Width x Height = 508 x 288, so the ratio is 7:4
let batHeight = 28;
let batX = screenWidth/8;
let batY = screenHeight/2;
let batImage;

let bat = {
    x : batX,
    y : batY,
    width : batWidth,
    height : batHeight
}

// Pipes
let pipeArray = [];
let pipeWidth = 64; // Width x Height = 384 x 3072, so the ratio is 1:8
let pipeHeight = 512;
let pipeX = screenWidth;
let pipeY = 0;

let topPipeImage;
let bottomPipeImage;

// Physics
let velocityX = -2; // Speed for pipes to move to the left
let velocityY = 0; // Bat Jump Speed
let gravity = 0.4;

let gameStarted = false;
let gameOver = false;

let score = 0;

window.onload = function() {
    // Display Screen
    screen = document.getElementById("screen"); // Must same as ID in HTML
    screen.height = screenHeight;
    screen.width = screenWidth;
    context = screen.getContext("2d");

    // Display Bat
    batImage = new Image();
    batImage.src = "./assets/Bat.png";
    batImage.onload = function() {
        context.drawImage(batImage, bat.x, bat.y, bat.width, bat.height);
    }

    topPipeImage = new Image();
    topPipeImage.src = "./assets/TopPipe.png"

    bottomPipeImage = new Image();
    bottomPipeImage.src = "./assets/BottomPipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Display Pipe every 1.5s

    document.addEventListener("keydown", moveBat);

}

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, screen.width, screen.height);

    if (!gameStarted) {
        context.drawImage(batImage, bat.x, bat.y, bat.width, bat.height);

        context.fillStyle = "white";
        context.font = "30px 'Tiny5'";
        context.textAlign = "center";
        context.fillText("Press Space to Start", screen.width / 2, 120);
        return;
    }

    if (gameOver) {
        // Don't update positions — just redraw the current state
        context.drawImage(batImage, bat.x, bat.y, bat.width, bat.height);

        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }

        context.fillStyle = "white";
        context.font = "50px 'Tiny5'";
        context.textAlign = "center";
        context.fillText(Math.floor(score), screen.width / 2, 60);
        context.fillText("Game Over", screen.width / 2, 120);
        return; // Prevent gravity/pipe movement
    }

    // Gravity
    velocityY += gravity;
    bat.y = Math.max(bat.y + velocityY, 0);
    context.drawImage(batImage, bat.x, bat.y, bat.width, bat.height);

    if (bat.y > screen.height) {
        gameOver = true;
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bat.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bat, pipe)) {
            gameOver = true;
        }
    }

    // Clear old pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Score
    context.fillStyle = "white";
    context.font = "50px 'Tiny5'";
    context.textAlign = "center";
    context.fillText(Math.floor(score), screen.width / 2, 60);
}


function placePipes() {
    if (!gameStarted || gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = screen.height/4;

    let topPipe = {
        img : topPipeImage,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImage,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBat(e) {
    if (e.code == "Space" || e.code == "ArrowUp") {
        if (!gameStarted) {
            gameStarted = true;
            return;
        }

        if (gameOver) {
            // Reset everything
            bat.y = batY;
            velocityY = 0;
            pipeArray = [];
            score = 0;
            gameOver = false;
            gameStarted = false; // Go back to "Press Space to Start"
            return;
        }

        // Regular jump
        velocityY = -6;
    }
}



function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}