# Simple Tetris

Mission M1 · The Awakening of the DOM

## How to open it.

Use Live Server to open index.html in your browser. Press the start button at the bottom of the page to play. Arrow keys are used for left and right, up is for rotation, and down is for slamming the piece to the furthest valid position.



## Use of AI.

Use of the Codex client within VS Code was implemented as an assisting programming tool to help phase by phase.
Example of prompt: "Provide 5 phases to implement a game of Tetris complete with all 7 pieces, a 10 x 20 board
falling movement, scoring, and rotation. Do not create any code yet." (For clarity's sake, the actual prompt was to
view a PNG that contained the instructions in order to save on token costs.)

2nd Example of Prompt: "Implement Phase 1, building a 20x10 grid of squares to hold our pieces, as well as a piece at the top for testing."
Verification during every phase and change was done, and testing was done frequently on the actual game itself to check for errors.

I did not write any parts by hand, however I did extensively check each section and test to make sure that the program was up to standards.



## Autopsy.

1. The JavaScript file creates a 2D 20x10 array. Each position is filled by a 0, representing an empty slot. The drawBoard() function dynamically creates 200 div elements within the HTML board container to display the grid. The array stores settled blocks, while moving blocks are tracked.
2. The Tetrominoes (pieces) are defined as arrays of 1s and 0s. The 1s are the actual parts of the piece, while 0s are empty within the shape of the piece. CreateRandomPiece() selects one of the 7 pieces randomly. CanPlace() checks whether the current piece can occupy a certain position without escaping the board or overlapping. This is used for rotations, falling and movement.
3. For falling, the game uses a 500 millisecond interval and checks if the next position is valid, before moving the piece one row downward. Left and right move the piece on the board, up will rotate the piece clockwise, and down will instantly move the piece to the lowest valid position. During rotation, nearby horizontal positions are checked if the rotated piece cannot fit in its original position.
4. When a piece can no longer move downward, it is locked in place with lockPiece(). This adds the piece to the board array. clearLines() then checks an entire row to see if the whole row is occupied. When a full row is detected, clearLines() removes it and inserts an empty row at the top, shifting the remaining rows downward. Each cleared row grants 100 points. There are no combos or extra points for more lines cleared at once.
5. After the piece locks, a new piece is generated. Once the starting position is blocked, the game is over and no more pieces will spawn. The restart button will clear the previous score and reset the board to initial positions. This also resets the timer to allow a new game to begin. HTML defines the start, restart, board container, score display, and status message. CSS uses display: grid with ten columns to arrange the cells. It also assigns different colors with .piece-I and .piece-T for visual clarity. The JavaScript dynamically creates the board cells and applies CSS classes as the board is redrawn.



