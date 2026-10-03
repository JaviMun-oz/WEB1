const ROWS = 20;
const COLUMNS = 10;
const boardElement = document.querySelector("#board");

// Each row is a separate array. Zero means an empty cell.
const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

const activePiece = {
    shape: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    x: 3,
    y: 0
};

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
                pieceRow >= 0 && pieceRow < activePiece.shape.length &&
                pieceColumn >= 0 && pieceColumn < activePiece.shape[pieceRow].length &&
                activePiece.shape[pieceRow][pieceColumn] === 1;

            if (board[row][column] !== 0 || isPieceCell) {
                cell.classList.add("piece");
            }

            boardElement.appendChild(cell);
        }
    }
}

drawBoard();

const DROP_INTERVAL = 500;

function dropPiece() {
    // The piece can fall while its bottom is above the last board row.
    if (activePiece.y + activePiece.shape.length < ROWS) {
        activePiece.y += 1;
        drawBoard();
    } else {
        clearInterval(fallTimer);
    }
}

const fallTimer = setInterval(dropPiece, DROP_INTERVAL);

document.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowLeft" ? -1 : 1;
    const nextX = activePiece.x + direction;
    const pieceWidth = activePiece.shape[0].length;

    // Allow the move only if the whole piece stays inside the board.
    if (nextX >= 0 && nextX + pieceWidth <= COLUMNS) {
        activePiece.x = nextX;
        drawBoard();
    }
});
