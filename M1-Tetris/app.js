const ROWS = 20;
const COLUMNS = 10;
const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const scoreElement = document.querySelector("#score");

// Each row is a separate array. Zero means an empty cell.
const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

const TETROMINOES = {
    I: [[1, 1, 1, 1]],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

function createRandomPiece() {
    const types = Object.keys(TETROMINOES);
    // The browser initializes Math.random(); no fixed seed is supplied.
    const type = types[Math.floor(Math.random() * types.length)];
    // Copy each row so changes to this piece won't change the definitions.
    const shape = TETROMINOES[type].map(row => [...row]);

    return {
        type,
        shape,
        x: Math.floor((COLUMNS - shape[0].length) / 2),
        y: 0
    };
}

let activePiece = createRandomPiece();
let gameOver = false;
let score = 0;
scoreElement.textContent = `Score: ${score}`;

function canPlace(shape, x, y) {
    for (let row = 0; row < shape.length; row += 1) {
        for (let column = 0; column < shape[row].length; column += 1) {
            if (shape[row][column] === 0) {
                continue;
            }

            const boardX = x + column;
            const boardY = y + row;

            // Check bounds before reading the board array.
            if (boardX < 0 || boardX >= COLUMNS || boardY < 0 || boardY >= ROWS) {
                return false;
            }
            if (board[boardY][boardX] !== 0) {
                return false;
            }
        }
    }
    return true;
}

function rotatePiece() {
    if (gameOver) return;
    const shape = activePiece.shape;
    // Columns become rows, read from bottom to top for clockwise rotation.
    const rotated = Array.from({ length: shape[0].length }, (_, column) =>
        shape.map(row => row[column]).reverse()
    );

    // Try the current position first, then nearby horizontal positions.
    for (const offset of [0, -1, 1, -2, 2, -3, 3]) {
        const nextX = activePiece.x + offset;
        if (canPlace(rotated, nextX, activePiece.y)) {
            activePiece.shape = rotated;
            activePiece.x = nextX;
            drawBoard();
            return;
        }
    }
}

function drawBoard() {
    boardElement.textContent = "";

    for (let row = 0; row < ROWS; row += 1) {
        for (let column = 0; column < COLUMNS; column += 1) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            // Translate the board position into a position inside the piece.
            const pieceRow = row - activePiece.y;
            const pieceColumn = column - activePiece.x;
            const isPieceCell =
                !gameOver &&
                pieceRow >= 0 && pieceRow < activePiece.shape.length &&
                pieceColumn >= 0 && pieceColumn < activePiece.shape[pieceRow].length &&
                activePiece.shape[pieceRow][pieceColumn] === 1;

            const pieceType = isPieceCell ? activePiece.type : board[row][column];
            if (pieceType !== 0) {
                cell.classList.add(`piece-${pieceType}`);
            }

            boardElement.appendChild(cell);
        }
    }
}

drawBoard();

const DROP_INTERVAL = 500;

function lockPiece() {
    for (let row = 0; row < activePiece.shape.length; row += 1) {
        for (let column = 0; column < activePiece.shape[row].length; column += 1) {
            if (activePiece.shape[row][column] === 1) {
                board[activePiece.y + row][activePiece.x + column] = activePiece.type;
            }
        }
    }
}

function clearLines() {
    let cleared = 0;

    for (let row = ROWS - 1; row >= 0; row -= 1) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLUMNS).fill(0));
            cleared += 1;
            // Check this position again: the row above has moved into it.
            row += 1;
        }
    }

    score += cleared * 100;
    scoreElement.textContent = `Score: ${score}`;
}

function dropPiece() {
    if (gameOver) return;

    if (canPlace(activePiece.shape, activePiece.x, activePiece.y + 1)) {
        activePiece.y += 1;
    } else {
        lockPiece();
        clearLines();
        activePiece = createRandomPiece();

        if (!canPlace(activePiece.shape, activePiece.x, activePiece.y)) {
            gameOver = true;
            clearInterval(fallTimer);
            statusElement.textContent = "Game over! Reload the page to play again.";
        }
    }
    drawBoard();
}

function hardDrop() {
    if (gameOver) return;

    while (canPlace(activePiece.shape, activePiece.x, activePiece.y + 1)) {
        activePiece.y += 1;
    }
    // At the landing position, dropPiece locks, clears lines, and spawns.
    dropPiece();
}

const fallTimer = setInterval(dropPiece, DROP_INTERVAL);

document.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        return;
    }

    event.preventDefault();

    if (gameOver) return;

    if (event.key === "ArrowDown") {
        // Holding the key should not slam down subsequent pieces.
        if (!event.repeat) hardDrop();
        return;
    }

    if (event.key === "ArrowUp") {
        rotatePiece();
        return;
    }

    const direction = event.key === "ArrowLeft" ? -1 : 1;
    const nextX = activePiece.x + direction;
    if (canPlace(activePiece.shape, nextX, activePiece.y)) {
        activePiece.x = nextX;
        drawBoard();
    }
});
