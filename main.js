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

let winner; // 1 (player 1), -1 (opponent), or 0 no win yet
let turn; // value of the player whose turn it is
let player1Val; // value of player 1's pieces: 1 for dark, -1 for light
let player2Val; // value of player 2's pieces: 1 for dark, -1 for light
let moves; // a two dimensional array of the turn player's pieces that can move;
let captureMoves; // a two dimensional array of the turn player's piece that can capture, and the locations they would move to if they capture;
// values in these arrays are stored as [[row, column], [row, column], [row, column]]
let canCapture; // bool, can any of turn player's pieces capture
let clickedPiece;

let pieceSelected; // bool, is there a highlighted piece

let playerNames;


/*----- Cached Variables -----*/

const boardEl = document.querySelector('#board'); // board element
const playDarkBtn = document.querySelector('#play-dark-button'); // play as dark pieces button
const playLightBtn = document.querySelector('#play-light-button'); // play as light pieces button
const colorSelectors = document.querySelector('#color-select-buttons');
const controlsTextEl = document.querySelector('#controls-text')
const resetBtn = document.querySelector('#reset-button'); // reset the board button, only visible if game is in play
const gameStatusEl = document.getElementById('game-status');
const tiles = document.querySelectorAll('#board > div'); // all board "tiles" in a Node List

/*----- Event listeners -----*/

// EXTERNAL CONTROLS

// Start game, playing as dark (plays first)
playDarkBtn.addEventListener('click', function() {
    init(1);
})

// Start game, playing as light (plays second)
playLightBtn.addEventListener('click', function() {
    init(-1);
})

// Reset the game, clear the board, allow the player to pick a color again
resetBtn.addEventListener('click', function() {
    clearBoard();
    gameStatusEl.innerText = 'Welcome to Ultimate Hopscotch!';
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
        console.log(childNodes);
        if (childNodes[0].classList.contains('possible-move')) {
            movePiece(event.target);
        }
    }
});

/*----- Functions -----*/

// MAIN

function init(colorValue) {
    // changes button display to "in-game" mode
    resetBtn.style.display = 'inline';
    colorSelectors.style.display = 'none';

    // initializes player variables according to color choice
    turn = 1;
    winner = 0;
    player1Val = colorValue;
    player2Val = -colorValue;
    playerNames = {};
    playerNames[player1Val.toString()] = 'player1';
    playerNames[player2Val.toString()] = 'player2';

    gameStatusEl.innerHTML = "<span id='turn-color'></span>'s turn to move";

    initilializeBoard();
    render();
}

function render() {
    renderBoard();
    renderMessage();
    renderControls();
    getAllMoves();
}

// BOARD

function initilializeBoard() {

    // initialize player's pieces on state board
    let column = -2;
    let row = 0;
    for (let i = 0; i < 12; i++) { // initialize player pieces;

        row = Math.floor(i / 4); // row = 0 through 2
        column +=  2; // column = 0 through 7, incrementing by 2 and alternating start points each row
        // alternate column start points by row
        if (column == 8) { // if column is out of bounds by 1
            column = 1; // reset column to 1
        } else if (column === 9) { // if column is out of bounds by 2
            column = 0; // reset to column 0
        }

        // update state game board
        board[row][column] = player1Val;
    }

    // initialize opponent pieces
    column = -1;
    for (let i = 0; i < 12; i++) { // initialize opponent pieces

        row = (7 - Math.floor(i / 4)); // row = 7 through 5
        column += 2; // column = 0 through 7, incrementing by 2 and alternating start points each row
        // alternate column start points by row
        if (column === 8) { // if column is out of bounds by 1
            column = 1; // reset column to 1
        } else if (column === 9) { // if column is out of bounds by 2
            column = 0; // reset to column 0
        }

        // update state game board
        board[row][column] = player2Val;
    }
}

function clearBoard() {
    // clear state game board
    for (let row = 0; row < 8; row++) { // for each row in game board
        for (let column = 0; column < 8; column++) { // for each column in game board
            board[row][column] = 0; // reset game
        }
    }

    // clear pieces from display
    for (let i = 0; i < tiles.length; i++) {
        // console.log(tiles[i]);
        if (tiles[i].hasChildNodes()) {
            tiles[i].removeChild(tiles[i].childNodes[0]);
        }
    }
}


function renderBoard() {
    // Iterate over each row in the 2D board array
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        // Iterate over each tile (row * column) in the 2D board array
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
            const tileValue = board[rowIndex][columnIndex];
            const tileId = `r${rowIndex}c${columnIndex}`; 
            const tileEl = document.getElementById(tileId); // access the id of the HTML element corresponding to the selected tile
            if (!tileValue && tileEl.hasChildNodes()) { // if there is no piece on that tile, continue
                tileEl.removeChild();
                continue;
            } else if (!tileValue) {
                continue;
            } else if (tileEl.hasChildNodes()) { // if that element already has a rendered piece on it,
                continue; // continue to the next tile
            } else {
                const newPiece = document.createElement('button');
                newPiece.className = (tileValue === player1Val) ? `player1-piece ${colors[player1Val.toString()]}` : `player2-piece ${colors[player2Val.toString()]}`;
                tileEl.appendChild(newPiece);
            } 
        }
    }
}

// RENDER OTHER

function renderMessage() {
    if (winner) {
        if (winner = 1) {
            gameStatusEl.style.backgroundColor = 'rgb(50, 30, 0)';
        } else if (winner = -1) {
            gameStatusEl.style.backgroundColor = 'darkgreen;'
        }
        gameStatusEl.style.color = 'ivory';
        gameStatusEl.innerText = `${playerColors[winner].toString()} is the winner!`;
    } else {
        const turnColorEl = document.getElementById('turn-color');
        if (turn === 1) {
            turnColorEl.innerText = 'Brown'
            turnColorEl.style.color = 'rgb(50, 30, 0)';
            gameStatusEl.style.backgroundColor = 'saddlebrown'
        } else if (turn === -1) {
            turnColorEl.innerText = 'Green';
            turnColorEl.style.color = 'darkgreen';
            gameStatusEl.style.backgroundColor = 'mediumseagreen';
        }
    }
}

function renderControls() {
    if (winner) {
        resetBtn.style.display = 'none';
        colorSelectors.style.display = 'inline';
        controlsTextEl.innerText = 'Play again?';
    }
}

// ---------------- GAME LOGIC ---------------------

// MOVE PIECE

function movePiece(target) {

    highlightedEl = document.querySelector('.highlighted');
    const newR = parseInt(target.id[1]);
    const newC = parseInt(target.id[3]);
    console.log(target);

    clearMoveMarkers();

    board[newR][newC] = turn;
    board[clickedPiece[0]][clickedPiece[1]] = 0;

    if (canCapture) {
        for(captureMove of captureMoves) {
            if (captureMove[0].toString() === clickedPiece.toString()) {
                console.log(captureMove[1]);
                const capturedTile = document.getElementById(`r${captureMove[1][0]}c${captureMove[1][1]}`)
                const capturedPiece = capturedTile.firstChild;
                console.log(capturedTile, capturedPiece);
                capturedPiece.remove();
                board[captureMove[1][0]][captureMove[1][1]] = 0;
            }
        }
    }

    highlightedEl.remove();

    isWinner();
    turn *= -1;
    render();
}

// GET ALL MOVES FOR THE TURN PLAYER

function getAllMoves() {
    moves = [];
    captureMoves = [];
    canCapture = false;
    
    // determines which directions a player's pieces are moving
    if (turn === player1Val) {
        offset = 1;
    } else if (turn === player2Val) {
        offset = -1;
    }

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
            const currentValue = board[rowIndex][columnIndex];
            if (currentValue === turn) {
                console.log('here1');
                const nextRow = board[rowIndex + offset]; // the row in front of a player's pieces
                if (nextRow) { // diagonals are respective to the side of each player
                    diagL = nextRow[columnIndex - offset]; // piece's left diagonal
                    diagR = nextRow[columnIndex + offset]; // piece's right diagonal
                    //console.log(`row index ${rowIndex}, column index ${columnIndex}, diagL ${diagL}, diagR ${diagR}, nextRow ${nextRow}, moves ${moves}`);

                    // checks to see if the piece can capture any of the opponents' pieces
                    checkCapture(rowIndex, columnIndex, diagL, diagR, offset);
                    console.log('can capture: ', canCapture);

                    // if no pieces so far can capture
                    if (!canCapture) {
                        checkMoves(rowIndex, columnIndex, diagL, diagR, offset);
                    }
                }
            }
        }
    }
}

function checkCapture(rowIndex, columnIndex, diagL, diagR, offset) {

    const superRow = board[rowIndex + (offset*2)];
    let superDiagL;
    let superDiagR;

    if (superRow) {
        // a "superDiag"
        superDiagL = superRow[columnIndex - (offset*2)];
        superDiagR = superRow[columnIndex + (offset*2)];
    }

    console.log(`row ${rowIndex}, column ${columnIndex}, diagL ${diagL}, diagR ${diagR}, superDiagL ${superDiagL}, superDiagR ${superDiagR}, turn ${turn}, offset ${offset}`);

    if (diagL !== undefined && superDiagL !== undefined) {
        if (diagL === -turn && !superDiagL) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex - offset], [rowIndex + (offset*2), columnIndex - (offset*2)]]);
            canCapture = true;
            console.log(captureMoves);
        }
    }

    if (diagR !== undefined && superDiagR !== undefined) {
        if (diagR === -turn && !superDiagR) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex + offset], [rowIndex + (offset*2), columnIndex + (offset*2)]]);
            canCapture = true;
            console.log(captureMoves);
        }
    }
}

function checkMoves(rowIndex, columnIndex, diagL, diagR, offset) {

    if (diagL !== undefined && !diagL) {
        moves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex - offset]]);
    }

    if (diagR !== undefined && !diagR) {
        moves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex + offset]]);
    }
}

// SHOW A PIECE'S MOVES IN THE DISPLAY

function showMoves(event) { //r_c_
    clearMoveMarkers();

    const highlightedPiece = document.querySelector('.highlighted');
    if (highlightedPiece) {
        highlightedPiece.classList.remove('highlighted');
    }

    const gridId = event.target.parentNode.id;
    const r = parseInt(gridId[1]); // r_
    const c = parseInt(gridId[3]); // c_
    clickedPiece = [r, c];

    //console.log(moves);
    console.log(captureMoves);

    if (captureMoves.length > 0) {
        console.log('captureMoves = ', captureMoves);
        captureMoves.forEach(function(captureMove) {
            const pieceThatCanCapture = captureMove[0];
            console.log('capture move = ', captureMove, 'clicked piece =', clickedPiece, ' piece that can capture = ', pieceThatCanCapture);
            if (pieceThatCanCapture.toString() === clickedPiece.toString()) {
                createMoveMarker(captureMove[2][0], captureMove[2][1]);
            }
        })
    } else {
        moves.forEach(function(move) {
            if (move[0][0] === r && move[0][1] === c) { // if move isn't null - move is null when piece cannot move diagonally in a certain direction
                console.log(move, clickedPiece);
                createMoveMarker(move[1][0], move[1][1]);
            }
        });
    }

    event.target.className += ' highlighted';

}

// MOVE MARKER SUB FUNCTIONS

function createMoveMarker(row, column) {
    const moveMarkerEl = document.createElement('div');
    const moveTileEl = document.querySelector(`#r${row}c${column}`);
    moveMarkerEl.className = 'possible-move';
    moveTileEl.appendChild(moveMarkerEl);
}

function clearMoveMarkers() {
    const shownMoves = document.querySelectorAll('.possible-move');
    for (let i = 0; i < shownMoves.length; i++) {
        shownMoves[i].remove();
    }
}


// Checks for Winner

function isWinner() {

    let player1Piece = document.querySelector('.player1-piece');
    let player2Piece = document.querySelector('.player2-piece');

    console.log(player1Piece);
    console.log(player2Piece);

    if (player1Piece === null) {
        winner = player2Val;
    } else if (player2Piece === null) {
        winner = player1Val;
    } else if (moves.length === 0 && captureMoves.length === 0) {
        winner = -turn;
    }
}

function countPieces() {

}