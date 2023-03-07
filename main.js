/*----- Constants -----*/

const colors = {
    '1': 'dark-piece',
    '-1': 'light-piece'
}

const playerNames = {
    '1': 'player1',
    '-1': 'player2'
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


/*----- Cached Variables -----*/

const boardEl = document.querySelector('#board'); // board element
const playDarkBtn = document.querySelector('#play-dark-button'); // play as dark pieces button
const playLightBtn = document.querySelector('#play-light-button'); // play as light pieces button
const colorSelectors = document.querySelector('#color-select-buttons');
const resetBtn = document.querySelector('#reset-button'); // reset the board button, only visible if game is in play
const tiles = document.querySelectorAll('#board > div'); // all board "tiles" in a Node List

/*----- Event listeners -----*/

// EXTERNAL CONTROLS

// Start game, playing as dark (plays first)
playDarkBtn.addEventListener('click', function() {
    // changes button display to "in-game" mode
    resetBtn.style.display = 'inline';
    colorSelectors.style.display = 'none';

    // initializes player variables according to color choice
    turn = 1;
    player1Val = 1;
    player2Val = -1;
    init();
})

// Start game, playing as light (plays second)
playLightBtn.addEventListener('click', function() {
    // changes button display to "in-game" mode
    resetBtn.style.display = 'inline';
    colorSelectors.style.display = 'none';

    // initializes player variables according to color choice
    turn = 1;
    player1Val = -1;
    player2Val = 1;
    init();
})

// Reset the game, clear the board, allow the player to pick a color again
resetBtn.addEventListener('click', function() {
    clearBoard();
    colorSelectors.style.display = 'block';
    resetBtn.style.display = 'none';
})

// IN-GAME ACTIONS

// Shows a piece's possible moves, and highlights the piece, readying it for movement
boardEl.addEventListener('click', function(event) {
    //const highlightedEl = document.getElementsByClassName('highlighted');
    console.log(turn);
    console.log('turn =', turn, 'this player =', playerNames[turn.toString()], 'other play =', playerNames[(-turn).toString()]);

    if (event.target.classList.contains(`${playerNames[turn.toString()]}-piece`)) { 
        showMoves(event);
    } else if (event.target.classList.contains('possible-move')) {
        move(event.target.parentNode);
    } else if (event.target.classList.contains(`${playerNames[(-turn).toString()]}-piece`)) {
        return;
    } else if (event.target.hasChildNodes()) {
        const childNodes = event.target.childNodes ;
        console.log(childNodes);
        if (childNodes[0].classList.contains('possible-move')) {
            move(event.target);
        }
    }
});

/*----- Functions -----*/

// MAIN

function init() {
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
            console.log(tileEl, tileId);
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

}

function renderControls() {

}

// ---------------- GAME LOGIC ---------------------

function move(target) {
    
    const r = parseInt(target.id[1]);
    const c = parseInt(target.id[3]);
    console.log(target);

    clearMoveMarkers();

    board[r][c] = turn;
    board[clickedPiece[0]][clickedPiece[1]] = 0;
    highlightedEl = document.querySelector('.highlighted');
    highlightedEl.remove();


    turn *= -1;

    render();
}

// CAN CAPTURE

function getAllMoves() {

    moves = [];
    captureMoves = [];
    canCapture = false;
    
    // determines which directions a player's pieces are moving
    if (turn === player1Val) {
        turnVal = 1;
    } else if (turn === player2Val) {
        turnVal = -1;
    }

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
            const currentValue = board[rowIndex][columnIndex];
            if (currentValue === turnVal) {
                
                const nextRow = board[rowIndex + turnVal]; // the row in front of a player's pieces
                if (nextRow) { // diagonals are respective to the side of each player
                    diagL = nextRow[columnIndex - turnVal]; // piece's left diagonal
                    diagR = nextRow[columnIndex + turnVal]; // piece's right diagonal
                    console.log(diagL, diagR, nextRow);

                    // checks to see if the piece can capture any of the opponents' pieces
                    checkCapture(rowIndex, columnIndex, diagL, diagR, turnVal);

                    // if no pieces so far can capture
                    if (!canCapture) {
                        checkMoves(rowIndex, columnIndex, diagL, diagR, turnVal);
                    }
                }
            }
        }
    }
}

function checkCapture(rowIndex, columnIndex, diagL, diagR, turnVal) {

    const superRow = board[rowIndex + (turnVal*2)];

    if (superRow) {
        // a "superDiag"
        superDiagL = superRow[columnIndex - (turnVal*2)];
        superDiagR = superRow[columnIndex + (turnVal*2)];
    }

    if (diagL !== undefined && superDiagL !== undefined) {
        if (board.diagL === -turn && !board.superDiagL) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex + (turnVal*2), columnIndex - (turnVal*2)]]);
            canCapture = true;
        }
    }

    if (diagR !== undefined && superDiagL !== undefined) {
        if (board.diagR === -turn && !board.superDiagR) {
            captureMoves.push([rowIndex, columnIndex], [rowIndex + (turnVal*2), columnIndex + (turnVal*2)]);
            canCapture = true;
        }
    }
}

function checkMoves(rowIndex, columnIndex, diagL, diagR, turnVal) {

    if (diagL !== undefined && !diagL) {
        moves.push([[rowIndex, columnIndex], [rowIndex + turnVal, columnIndex - turnVal]]);
    }

    if (diagR !== undefined && !diagR) {
        moves.push([[rowIndex, columnIndex], [rowIndex + turnVal, columnIndex + turnVal]]);
    }
}




// SHOW A PIECE'S MOVES

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
        captureMoves.forEach(function(captureMove) {
            const pieceThatCanCapture = captureMove[0];
            if (pieceThatCanCapture === clickedPiece) {
                createMoveMarker(row, column);
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

// MOVE

function movePiece(highlightedPiece, gridId) {
    
}

// function 