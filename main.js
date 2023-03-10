/*----- Constants -----*/

// piece colors for class work
const colors = {
    '1': 'dark-piece',
    '-1': 'light-piece'
}

// player colors for display and event listeners
const playerColors = {
    '1': 'Brown',
    '-1': 'Green'
}

// blank state board
const board = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

/*----- State Variables -----*/

let player1Val; // value of player 1's pieces: 1 for dark, -1 for light
let player2Val; // value of player 2's pieces: 1 for dark, -1 for light
let winner; // 1 (Dark), -1 (Light), or 0 no win yet
let turn; // 1 for Dark, -1 for Light - changes after every move

let moves; // a 2D array of the pieces that can move this turn
// [[currentRow, currentColumn], [moveRow, moveColumn]]

let captureMoves; // a 3D array of the captures that can take place:
// the piece that can capture, the piece that can be captured, the piece's prospective location after capturing
//[[capPieceRow, capPieceColumn], [cappedPieceRow, cappedPieceColumn], [postCapRow, postCapColumn]]

let canCapture; // bool; can any of the current player's pieces capture?
let clickedPiece; // [row, column] board location of a clicked piece

let playerNames; // object, assigns the strings 'player1' and 'player2' to either 1 or -1 depending on their piece color

let pieceCount; // object, counts the values of every tile in the game state board


/*----- Cached Variables -----*/

const boardEl = document.querySelector('#board'); // board element
const playDarkBtn = document.querySelector('#play-dark-button'); // play as dark pieces button
const playLightBtn = document.querySelector('#play-light-button'); // play as light pieces button
const colorSelectors = document.querySelector('#color-select-buttons'); // holds the container for the controls-text and color-selectors
const controlsTextEl = document.querySelector('#controls-text') // displays the text above the color-select buttons
const resetBtn = document.querySelector('#reset-button'); // press to reset the board, only visible if game is in play
const gameStatusEl = document.getElementById('game-status');
const tiles = document.querySelectorAll('#board > div'); // all board "tiles" in a Node List

/*----- Event listeners -----*/

// EXTERNAL CONTROLS

// Start game, playing as dark (plays first)
playDarkBtn.addEventListener('click', function() {
    clearBoard(); // ****** 
    init(1);
})

// Start game, playing as light (plays second)
playLightBtn.addEventListener('click', function() {
    clearBoard(); // ****find a way to do this after a win without putting this in both the reset and selector buttons
    init(-1);
})

// Reset the game, clear the board, allow the player to pick a color again
resetBtn.addEventListener('click', function() {
    clearBoard();
    gameStatusEl.innerText = 'Welcome to Ultimate Leapfrog!';
    controlsTextEl.innerText = 'I would like to play as...'
    gameStatusEl.style.backgroundColor = 'black';
    colorSelectors.style.display = 'block';
    resetBtn.style.display = 'none';
})

// IN-GAME ACTIONS

// Shows a piece's possible moves, and highlights the piece, readying it for movement
boardEl.addEventListener('click', function(event) {
    if (event.target.classList.contains(`${playerNames[turn.toString()]}-piece`)) { 
        showMoves(event);
    } else if (event.target.classList.contains('possible-move')) {
        movePiece(event.target.parentNode);
    } else if (event.target.classList.contains(`${playerNames[(-turn).toString()]}-piece`)) {
        return;
    } else if (event.target.hasChildNodes()) {
        const childNodes = event.target.childNodes ;
        if (childNodes[0].classList.contains('possible-move')) {
            movePiece(event.target);
        }
    }
});

/*----- Functions -----*/

// -------------- MAIN --------------


function init(colorValue) {

    // initializes player variables according to color choice
    turn = 1; // dark always starts first
    winner = 0;
    player1Val = colorValue;
    player2Val = -colorValue;
    playerNames = {};
    playerNames[player1Val.toString()] = 'player1';
    playerNames[player2Val.toString()] = 'player2';

    // changes button display to "in-game" mode
    resetBtn.style.display = 'inline';
    colorSelectors.style.display = 'none';

    // updates game-status from "Welcome" to displaying turns
    gameStatusEl.innerHTML = "<span id='turn-color'></span>'s turn to move";

    // places pieces on state game board according to player color choice
    initilializeBoard();

    // begin the game
    render();
}

function render() {

    // updates displayed board to match state board
    renderBoard();

    // refills
    getAllMoves();

    // check if a player has won
    checkWinner();

    // update display to either the current player's turn, or the player who has won
    renderMessage();

    // if there is a winner, replace the "reset" button with the color choice buttons
    renderControls();
}

// -------------- BOARD --------------


function initilializeBoard() {

    // initialize player1's pieces on state board
    let column = -2;
    let row = 0;
    for (let i = 0; i < 12; i++) {

        // sets values on rows 0-2, every other column & alternating start columns
        row = Math.floor(i / 4);
        column +=  2;
        if (column == 8) { // if column is out of bounds by 1
            column = 1; // reset column to 1
        } else if (column === 9) { // if column is out of bounds by 2
            column = 0; // reset to column 0
        }

        // update state game board
        board[row][column] = player1Val;
    }

    // initialize player2's pieces on stte board
    column = -1;
    for (let i = 0; i < 12; i++) {

        // sets values on rows 7-5, same column logic as above
        row = (7 - Math.floor(i / 4));
        column += 2;
        if (column === 8) {
            column = 1;
        } else if (column === 9) {
            column = 0;
        }

        // update state game board
        board[row][column] = player2Val;
    }
}

function clearBoard() {

    // clear state game board
    for (let row = 0; row < 8; row++) { // for each row in game board
        for (let column = 0; column < 8; column++) { // for each column in game board
            board[row][column] = 0; // reset the space's value to 0
        }
    }

    // clear pieces from display
    for (let i = 0; i < tiles.length; i++) { // for each tile on the css grid
        if (tiles[i].hasChildNodes()) { // if the tile has pieces or move markers on it
            tiles[i].removeChild(tiles[i].childNodes[0]); // remove the pieces/markers
        }
    }
}

function renderBoard() {
    
    pieceCount = {}; // stores the total number of pieces and empty spaces on the board

    // Iterate over each row in the 2D board array
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {

        // Iterate over each tile (row * column) in the 2D board array
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {

            const tileValue = board[rowIndex][columnIndex]; // value on the state tile

            const tileValueKey = tileValue.toString(); 
            pieceCount[tileValueKey] ? pieceCount[tileValueKey]++ : pieceCount[tileValueKey] = 1; // adds 1 to the pieceCount object for every tile value
            
            const tileId = `r${rowIndex}c${columnIndex}`; // constructs the matching HTML id to the current state tile
            const tileEl = document.getElementById(tileId); // access the HTML element corresponding to the selected tile

            if (!tileValue && tileEl.hasChildNodes()) { // if there is no piece on that tile anymore, continue
                tileEl.removeChild();
                continue;
            } else if (!tileValue) { // if there is no piece on that tile in general, continue
                continue;
            } else if (tileEl.hasChildNodes()) { // if that element already has a correctly rendered piece on it, continue
                continue;
            } else {

                const newPiece = document.createElement('button');
                if (Math.abs(tileValue) === 1) { // create a normal player piece

                    // set corresponding classes
                    newPiece.className = (tileValue === player1Val) ? `player1-piece ${colors[player1Val.toString()]}` : `player2-piece ${colors[player2Val.toString()]}`;

                } else if (Math.abs(tileValue) === 2) { // create a king player piece

                    // set corresponding classes
                    newPiece.className = (tileValue === player1Val * 2) ? `player1-piece king ${colors[player1Val.toString()]}` : `player2-piece king ${colors[player2Val.toString()]}`;

                }
                
                tileEl.appendChild(newPiece); // display the new piece
            } 
        }
    }
}


// -------------- RENDER OTHER --------------


function renderMessage() {

    if (winner) { // if someone had won the game

        if (winner === 1) { // if the winner is Brown, set the background to Brown
            gameStatusEl.style.backgroundColor = 'rgb(60, 35, 0)';
        } else if (winner === -1) { // if the winner is Green, set the background to Green
            gameStatusEl.style.backgroundColor = 'rgb(30, 60, 30)';
        }

        gameStatusEl.style.color = 'ivory';
        gameStatusEl.innerText = `${playerColors[winner.toString()]} is the winner!`; // display winning color

    } else if (canCapture) { // if the current player's pieces can capture

        gameStatusEl.innerHTML = "<span id='turn-color'></span>&nbspmust capture a piece!"; // &nbsp stands for non-breaking space
        const turnColorEl = document.getElementById('turn-color');

        if (turn === 1) { // if Brown's turn

            turnColorEl.innerText = 'Brown';
            turnColorEl.style.color = 'rgb(50, 30, 0)';
            gameStatusEl.style.backgroundColor = 'saddlebrown';

        } else if (turn === -1) { // if Green's turn

            turnColorEl.innerText = 'Green';
            turnColorEl.style.color = 'darkgreen';
            gameStatusEl.style.backgroundColor = 'mediumseagreen';

        }

    } else {

        gameStatusEl.innerHTML = "<span id='turn-color'></span>'s turn to move";
        const turnColorEl = document.getElementById('turn-color'); // get turn color element

        if (turn === 1) { // if Brown's turn

            turnColorEl.innerText = 'Brown'
            turnColorEl.style.color = 'rgb(50, 30, 0)';
            gameStatusEl.style.backgroundColor = 'saddlebrown'

        } else if (turn === -1) { // if Green's turn

            turnColorEl.innerText = 'Green';
            turnColorEl.style.color = 'darkgreen';
            gameStatusEl.style.backgroundColor = 'mediumseagreen';

        }
    }
}

function renderControls() {

    if (winner) { // if a player has won, 
        resetBtn.style.display = 'none'; // remove reset button
        colorSelectors.style.display = 'inline'; // display color selector buttons
        controlsTextEl.innerText = 'Play again?';
    }
}


// ---------------- GAME LOGIC -------------------


// MOVE PIECE

function movePiece(target) {

    // selected the element the player has clicked on
    highlightedEl = document.querySelector('.highlighted');
    const newR = parseInt(target.id[1]); // get the clicked element's row
    const newC = parseInt(target.id[3]); // get the clicked element's column

    const oldR = clickedPiece[0];
    const oldC = clickedPiece[1];

    clearMoveMarkers(); // remove move markers from the display

    let isKing = 1; // sets a king multiplier "no king"

    // if the piece just became a king, or if the piece was already a king
    if ((turn === player1Val && newR === 7 || turn === player2Val && newR === 0) || highlightedEl.classList.contains('king')) {
        isKing = 2; // sets king multiplier to 2, signifying that this piece is a king
    }

    let offset;

    if (turn === player1Val) {
        offset = 1; // player is facing up on the board
    } else if (turn === player2Val) {
        offset = -1; // player is facing down on the board
    }

    // update new board location to the player piece's value;
    board[newR][newC] = turn * isKing;

    // delete the moved piece's value from its last location
    board[oldR][oldC] = 0;

    // if the move is a capture
    if (canCapture) {

        // for every possible capture stored in the captureMoves array
        for(captureMove of captureMoves) { 

            // find the captureMove 2D array that matches the capture in progress
            if (captureMove[0].toString() === [oldR, oldC].toString() && captureMove[2].toString() === [newR, newC].toString()) { // find the piece that is capturing in the captureMoves array
                
                // remove the piece between the startpoint and endpoint
                const capturedTile = document.getElementById(`r${captureMove[1][0]}c${captureMove[1][1]}`) // find the captured piece's tile
                const capturedPiece = capturedTile.firstChild; // grab the piece on said tile
                capturedPiece.remove(); // remove the captured piece from the display
                board[captureMove[1][0]][captureMove[1][1]] = 0; // remove the captured piece from the state
                break;

            }
        }
    }

    // remove the clicked piece from the display
    highlightedEl.remove();

    // proceed to the next turn
    turn *= -1;
    render();

}


// -------------- GET ALL MOVES --------------


function getAllMoves() {

    // reset moves and captureMoves arrays to empty
    moves = [];
    captureMoves = [];

    // resets canCapture
    canCapture = false;
    
    // determines which directions a player's pieces are moving
    if (turn === player1Val) {
        offset = 1; // moving upwards
    } else if (turn === player2Val) {
        offset = -1; // moving downwards
    }

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) { // for each row
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) { // for each column

            const currentValue = board[rowIndex][columnIndex]; // get the current value at that state board location
            const isMyKing = (currentValue * turn) === 2; // checks if the value is a king

            // if the current location holds a regular piece ownerd by the current player
            if (currentValue === turn) { 

                const nextRow = board[rowIndex + offset]; // grab the row in front of a player's pieces

                if (nextRow) { // diagonals are respective to the side of each player
                    const diagL = nextRow[columnIndex - offset]; // piece's left diagonal
                    const diagR = nextRow[columnIndex + offset]; // piece's right diagonal                                  

                    // checks to see if the piece can capture any of the opponents' pieces
                    checkCapture(rowIndex, columnIndex, diagL, diagR, offset, false, undefined, undefined);

                    // if no pieces so far can capture, check if that piece can move
                    if (!canCapture) {
                        checkMoves(rowIndex, columnIndex, diagL, diagR, offset, false, undefined, undefined);
                    }
                }

            // if the current location holds a king owned by the current player
            } else if (isMyKing) {
                
                let diagL, diagR, bDiagL, bDiagR;

                const nextRow = board[rowIndex + offset];

                if (nextRow) {
                    diagL = nextRow[columnIndex - offset];
                    diagR = nextRow[columnIndex + offset];
                }

                // same logic as above, but including backwards movement using -offset
                const backRow = board[rowIndex - offset];
                if (backRow) {
                    bDiagL = backRow[columnIndex - offset];
                    bDiagR = backRow[columnIndex + offset];
                }

                // check if king can capture any pieces in 4 directions
                checkCapture(rowIndex, columnIndex, diagL, diagR, offset, true, bDiagL, bDiagR);

                // if no pieces so far can capture, check for regular king moves in 4 directions
                if (!canCapture) {
                    checkMoves(rowIndex, columnIndex, diagL, diagR, offset, true, bDiagL, bDiagR);
                }
            }
        }
    }
}

function checkCapture(rowIndex, columnIndex, diagL, diagR, offset, isKing, bDiagL, bDiagR) {

    // a "super row" is a row two rows in front of a given piece
    const superRow = board[rowIndex + (offset*2)];
    let superDiagL, superDiagR;

    // if the super row is an existing row on the board
    if (superRow) {
        // a "super diagonal" is two tiles diagonally in either direction
        superDiagL = superRow[columnIndex - (offset*2)]; // grabs the board value two tiles diagonally left
        superDiagR = superRow[columnIndex + (offset*2)]; // grabs the board value two tiles diagonally right
    }

    // if the left diagonal & left super diagonal are board tiles, and there is an enemy piece on the diagonal, and the super diagonal is empty
    if (diagL !== undefined && superDiagL !== undefined && (diagL === -turn || diagL === -turn*2) && !superDiagL) {
        // add the potential capture to the captureMoves array
        captureMoves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex - offset], [rowIndex + (offset*2), columnIndex - (offset*2)]]);
        canCapture = true; // update canCapture to true, because a piece can capture this turn
    }
    
    // same logic as above with right diagonal and superdiagonal
    if (diagR !== undefined && superDiagR !== undefined && (diagR === -turn || diagR === -turn*2) && !superDiagR) {
        captureMoves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex + offset], [rowIndex + (offset*2), columnIndex + (offset*2)]]);
        canCapture = true;
    }

    if (isKing) {

        // b super row stands for back super row
        const bSuperRow = board[rowIndex - (offset*2)];
        let bSuperDiagL, bSuperDiagR;

        // if the back super row is an existing board row
        if (bSuperRow) {
            bSuperDiagL = bSuperRow[columnIndex - (offset*2)]; // grabs the board value two tiles diagonally back and left
            bSuperDiagR = bSuperRow[columnIndex + (offset*2)]; // grabs the board value two tiles diagonally back and right
        }

        // same logic as above but backwards left
        if (bDiagL !== undefined && bSuperDiagL !== undefined && (bDiagL === -turn || bDiagL === -turn*2) && !bSuperDiagL) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex - offset], [rowIndex - (offset*2), columnIndex - (offset*2)]]);
            canCapture = true;
        }

        // same logic as above but backwards right
        if (bDiagR !== undefined && bSuperDiagR !== undefined && (bDiagR === -turn || bDiagR === -turn*2) && !bSuperDiagR) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex + offset], [rowIndex - (offset*2), columnIndex + (offset*2)]]);
            canCapture = true;
        }

    }
}

function checkMoves(rowIndex, columnIndex, diagL, diagR, offset, isKing, bDiagL, bDiagR) {

    // if the left diagonal exists on the board and is empty
    if (diagL !== undefined && !diagL) {

        // add the potential move to the moves array
        moves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex - offset]]);

    }

    // if the right diagonal exists on the board and is empty
    if (diagR !== undefined && !diagR) {
        moves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex + offset]]);
    }

    // if the piece is a king, and the back left diagonal on the board exists and is empty
    if (isKing && bDiagL !== undefined && !bDiagL) {
        moves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex - offset]]);
    }

    // if the piece is a king, and the right back diagonal on the board exists and is empty
    if (isKing && bDiagR !== undefined && !bDiagR) {
        moves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex + offset]]);
    }

}


// -------------- DISPLAYED MOVE MARKERS --------------


function showMoves(event) { //r_c_

    // remove all "possible move" markers from the board
    clearMoveMarkers();

    // if a piece has previously been clicked, select that piece and remove its highlight
    const highlightedPiece = document.querySelector('.highlighted');

    if (highlightedPiece) {
        highlightedPiece.classList.remove('highlighted');
    }

    // get the row and column location of the clicked piece
    const gridId = event.target.parentNode.id;
    const r = parseInt(gridId[1]); // r_
    const c = parseInt(gridId[3]); // c_
    clickedPiece = [r, c];

    // if a piece can capture this turn, check if the clicked piece is one of those pieces
    if (captureMoves.length > 0) {
        captureMoves.forEach(function(captureMove) {
            const pieceThatCanCapture = captureMove[0];
            if (pieceThatCanCapture.toString() === clickedPiece.toString()) {

                // if this piece can capture, display a move marker on the other side of the capturable piece
                createMoveMarker(captureMove[2][0], captureMove[2][1]); 
            }
        })

    // if no pieces can capture, check if the highlighted piece can move
    } else {
        moves.forEach(function(move) {
            if (move[0][0] === r && move[0][1] === c) { // if a move is possible for the clicked piece
                createMoveMarker(move[1][0], move[1][1]); // create a move marker for it
            }
        });
    }

    event.target.className += ' highlighted'; // highlight the clicked piece in the display

}

//  MOVE MARKER SUB FUNCTIONS 

// create a move marker element on a selected display board location
function createMoveMarker(row, column) {

    const moveMarkerEl = document.createElement('div');
    const moveTileEl = document.querySelector(`#r${row}c${column}`);
    moveMarkerEl.className = 'possible-move';
    moveTileEl.appendChild(moveMarkerEl);

}

// clear all move markers from the display board
function clearMoveMarkers() {

    const shownMoves = document.querySelectorAll('.possible-move');
    for (let i = 0; i < shownMoves.length; i++) {
        shownMoves[i].remove();
    }

}


// -------------- CHECK WINNER --------------


function checkWinner() {

    // creates keys to access the pieceCount array, containing a count of each value on the state board
    const p1Key = player1Val.toString();
    const p2Key = player2Val.toString();
    const p1KingKey = (player1Val * 2).toString();
    const p2KingKey = (player2Val * 2).toString();

    // check player 1 win
    if (!pieceCount[p2Key] && !pieceCount[p2KingKey]) { // if player 2 has no pieces remaining on the board
        winner = player1Val; // player 1 wins!
        turn = 0; // end the game

    // check player 2 win
    } else if (!pieceCount[p1Key] && !pieceCount[p1KingKey]) { // if player 1 has no pieces remaining on the board
        winner = player2Val; // player 2 wins!
        turn = 0; // end the game

    // check win by stalemate
    } else if (moves.length === 0 && captureMoves.length === 0) { // if either player has pieces, but they cannot move
        winner = turn * -1; // the other player wins!
        turn = 0; // end the game
    }
}