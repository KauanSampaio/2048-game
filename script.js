let grid, score, timer, time, gameStarted;

document.getElementById("new-game").addEventListener("click", initGame);
document.getElementById("tryagain").addEventListener("click", initGame);
document.addEventListener("keydown", handleInput);

function initGame() {
    grid = createEmptyGrid();
    score = 0;
    time = 0;
    timer = 0;
    gameStarted = false;
    updateScore();
    addRandomTile();
    addRandomTile();
    drawGrid();
    hideGameOverMessage();
}

let pauseButton = document.getElementById("pause-resume");
let isPaused = false;

pauseButton.addEventListener("click", () => {
    if(isPaused) {
        resumeGame();
    }
    else {
        pauseGame();
    }
});

function pauseGame() {
    isPaused = true;
    clearInterval(timer);
    pauseButton.textContent = "Resume";
}

function resumeGame() {
    isPaused = false;
    startTime();
    pauseButton.textContent = "Pause";
}

function startTime() {
    clearInterval(timer);
    timer = setInterval(() => {
        if(!isPaused) {
            time++;
            document.getElementById("game-time").textContent = `Time: ${formatTime(time)}`;
        }
    }, 1000);
}

function createEmptyGrid() {
    return [...Array(4)].map(() => Array(4).fill(0));
}

function addRandomTile() {
    let emptyTiles = [];
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            if(grid[i][j] === 0) {
                emptyTiles.push({i, j});
            }
        }
    }

    if(emptyTiles.length) {
        let { i, j } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        grid[i][j] = Math.random() > 0.9 ? 4 : 2;
    }
}

function drawGrid() {
    const gridContainer = document.getElementById("grid-container");
    gridContainer.innerHTML = "";
    grid.forEach((row, i) => {
        row.forEach((value, j) => {
            let tile = document.createElement("div");
            tile.className = "tile" + (value ? ` tile-${value}` : "");
            tile.textContent = value || "";
            gridContainer.appendChild(tile);
        });
    });

    if(isGameOver()) {
        showGameOverMessage();
        clearInterval(timer);
    }
}

function handleInput(e) {
    if(isGameOver()) {
        return;
    }

    let key = e.key;
    if(key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
        if(!gameStarted){
            startTime();
            gameStarted = true;
        }

        let oldGrid = JSON.stringify(grid);
        moveTiles(key);
        mergeTile(key);
        moveTiles(key);
        
        if(oldGrid !== JSON.stringify(grid)) {
            addRandomTile();
        }
        
        drawGrid();
        updateScore();
    }
}

function moveTiles(direction) {
    let isVertical = direction === "ArrowUp" || direction === "ArrowDown";
    let isForward = direction === "ArrowRight" || direction === "ArrowDown";

    for(let i = 0; i < 4; i++) {
        let row = [];
        for(let j = 0; j < 4; j++){
            let cell = isVertical ? grid[j][i] : grid[i][j];
            if(cell) row.push(cell);
        }

        let missing = 4 - row.length;
        let zeros = Array(missing).fill(0);
        row = isForward ? zeros.concat(row) : row.concat(zeros);

        for(let j = 0; j < 4; j++) {
            if(isVertical) {
                grid[j][i] = row[j];
            }
            else {
                grid[i][j] = row[j];
            }
        }
    }
}

function mergeTile(direction) {
    let isVertical = direction === "ArrowUp" || direction === "ArrowDown";
    let isForward = direction === "ArrowRight" || direction === "ArrowDown";

    for(let i = 0; i < 4; i++){
        for(let j = isForward ? 3 : 0; isForward ? j > 0 : j < 3; isForward ? j-- : j++){
            let current = isVertical ? grid[j][i] : grid[i][j];
            let next = isVertical ? grid[isForward ? j - 1 : j + 1][i] : grid[i][isForward ? j - 1 : j + 1];
            if(current !== 0 && current === next) {
                let mergeTile = current * 2;
                isVertical ? grid[j][i] = mergeTile : grid[i][j] = mergeTile;
                isVertical ? grid[isForward ? j - 1 : j + 1][i] = 0 : grid[i][isForward ? j - 1 : j + 1] = 0;
                score += mergeTile;
                break;
            }
        }
    }
}

function updateScore() {
    document.getElementById("game-score").textContent = `Score: ${score}`;
}

function formatTime(timeInSeconds){
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;

    return minutes.toString().padStart(2, "0") + ':' + seconds.toString().padStart(2, "0");
}

function isGameOver() {
    return isGridFull() && !canMakeMove();
}

function isGridFull() {
    return grid.every(row => row.every(cell => cell !== 0));
}

function canMakeMove() {
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++){
            let value = grid[i][j];
            if(value !== 0) {
                if(i < 3 && value === grid[i + 1][j]) return true;
                if(j < 3 && value === grid[i][j + 1]) return true;
            }
        }
    }

    return false;
}

function showGameOverMessage() {
    const gameOverMessage = document.getElementById("game-over");
    gameOverMessage.style.cssText = "display:block;";
}

function hideGameOverMessage() {
    const gameOverMessage = document.getElementById("game-over");
    gameOverMessage.style.cssText = "display:none;";
    initGame();
}

initGame();