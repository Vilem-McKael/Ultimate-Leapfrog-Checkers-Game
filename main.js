// TO DO
// - fix kings for all sides
// - add a bad computer player option


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

let playerNames; // object, assigns the strings 'player1' and 'player2' to either 1 or -1 depending on what piece color they are playing

let pieceCount; // counts the values of every tile in the game state board;


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
    getAllMoves();
    checkWinner();
    renderMessage();
    renderControls();
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
        if (tiles[i].hasChildNodes()) {
            tiles[i].removeChild(tiles[i].childNodes[0]);
        }
    }
}


function renderBoard() {
    
    pieceCount = {}; // stores the total number of pieces and empty spaces on the board

    // Iterate over each row in the 2D board array
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        // Iterate over each tile (row * column) in the 2D board array
        for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
            const tileValue = board[rowIndex][columnIndex];
            const tileValueKey = tileValue.toString();
            pieceCount[tileValueKey] ? pieceCount[tileValueKey]++ : pieceCount[tileValueKey] = 1; // adds 1 to the pieceCount object for every tile ???
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
                if (Math.abs(tileValue) === 1) { // create a normal player piece
                    newPiece.className = (tileValue === player1Val) ? `player1-piece ${colors[player1Val.toString()]}` : `player2-piece ${colors[player2Val.toString()]}`;
                } else if (Math.abs(tileValue) === 2) { // create a king player piece
                    newPiece.className = (tileValue === player1Val * 2) ? `player1-piece king ${colors[player1Val.toString()]}` : `player2-piece king ${colors[player2Val.toString()]}`;
                }
                
                tileEl.appendChild(newPiece);
            } 
        }
    }
}

// RENDER OTHER

function renderMessage() {
    if (winner) {
        if (winner === 1) {
            gameStatusEl.style.backgroundColor = 'rgb(60, 35, 0)';
        } else if (winner === -1) {
            gameStatusEl.style.backgroundColor = 'rgb(30, 60, 30)';
        }
        gameStatusEl.style.color = 'ivory';
        gameStatusEl.innerText = `${playerColors[winner.toString()]} is the winner!`;
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

    clearMoveMarkers();

    let isKing = 1;

    // if the piece just became a king, or if the piece was already a king
    if ((turn === player1Val && newR === 7 || turn === player2Val && newR === 0) || highlightedEl.classList.contains('king')) {
        isKing = 2;
    }

    let offset;

    if (turn === player1Val) {
        offset = 1;
    } else if (turn === player2Val) {
        offset = -1;
    }

    board[newR][newC] = turn * isKing;
    board[clickedPiece[0]][clickedPiece[1]] = 0;


    if (canCapture) {
        for(captureMove of captureMoves) {
            if (captureMove[0].toString() === clickedPiece.toString()) {
                const capturedTile = document.getElementById(`r${captureMove[1][0]}c${captureMove[1][1]}`)
                const capturedPiece = capturedTile.firstChild;
                capturedPiece.remove();
                board[captureMove[1][0]][captureMove[1][1]] = 0;
                break;

                // multi-capture logic
                // captureMoves = [];
                // clickedPiece = [newR, newC];

                // let nextRow, diagL, diagR, backRow, bDiagL, bDiagR;

                // nextRow = board[newR + offset];
                // if (nextRow) {
                //     diagL = nextRow[newC - offset];
                //     diagR = nextRow[newC + offset];
                // }

                // backRow = board[newR - offset];
                // if (backRow) {
                //     bDiagL = backRow[newC - offset];
                //     bDiagR = backRow[newC + offset];
                // }

                // checkCapture(newR, newC, diagL, diagR, offset, isKing === 2, bDiagL, bDiagR);
                // if (captureMoves.length === 0) {
                //     canCapture = false;
                // }
            }
        }
    }

    highlightedEl.remove();

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
            const isMyKing = (currentValue * turn) === 2; 
            console.log('isKingCheck', (currentValue * turn), isMyKing)
            if (currentValue === turn) {
                const nextRow = board[rowIndex + offset]; // the row in front of a player's pieces

                if (nextRow) { // diagonals are respective to the side of each player
                    const diagL = nextRow[columnIndex - offset]; // piece's left diagonal
                    const diagR = nextRow[columnIndex + offset]; // piece's right diagonal                                  

                    // checks to see if the piece can capture any of the opponents' pieces
                    checkCapture(rowIndex, columnIndex, diagL, diagR, offset, false, undefined, undefined);

                    // if no pieces so far can capture
                    if (!canCapture) {
                        checkMoves(rowIndex, columnIndex, diagL, diagR, offset, false, undefined, undefined);
                    }
                }
            } else if (isMyKing) {
                
                let diagL, diagR, bDiagL, bDiagR;

                const nextRow = board[rowIndex + offset];
                if (nextRow) {
                    diagL = nextRow[columnIndex - offset];
                    diagR = nextRow[columnIndex + offset];
                }

                const backRow = board[rowIndex - offset];
                if (backRow) {
                    bDiagL = backRow[columnIndex - offset];
                    bDiagR = backRow[columnIndex + offset];
                }

                checkCapture(rowIndex, columnIndex, diagL, diagR, offset, true, bDiagL, bDiagR);
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

    if (superRow) {
        // a "super diagonal" is two tiles diagonally in either direction
        superDiagL = superRow[columnIndex - (offset*2)];
        superDiagR = superRow[columnIndex + (offset*2)];
    }

    //console.log(`row ${rowIndex}, column ${columnIndex}, diagL ${diagL}, diagR ${diagR}, superDiagL ${superDiagL}, superDiagR ${superDiagR}, turn ${turn}, offset ${offset}`);

    if (diagL !== undefined && superDiagL !== undefined && (diagL === -turn || diagL === -turn*2) && !superDiagL) {
        captureMoves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex - offset], [rowIndex + (offset*2), columnIndex - (offset*2)]]);
        canCapture = true;
        console.log(captureMoves);
    }

    if (diagR !== undefined && superDiagR !== undefined && (diagR === -turn || diagR === -turn*2) && !superDiagR) {
        captureMoves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex + offset], [rowIndex + (offset*2), columnIndex + (offset*2)]]);
        canCapture = true;
        console.log(captureMoves);
    }

    if (isKing) {

        // b super row stands for back super row
        const bSuperRow = board[rowIndex - (offset*2)];
        let bSuperDiagL, bSuperDiagR;

        if (bSuperRow) {
            bSuperDiagL = bSuperRow[columnIndex - (offset*2)];
            bSuperDiagR = bSuperRow[columnIndex + (offset*2)];
        }

        if (bDiagL !== undefined && bSuperDiagL !== undefined && (bDiagL === -turn || bDiagL === -turn*2) && !bSuperDiagL) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex - offset], [rowIndex - (offset*2), columnIndex - (offset*2)]]);
            canCapture = true;
            console.log(captureMoves);
        }

        if (bDiagR !== undefined && bSuperDiagR !== undefined && (bDiagR === -turn || bDiagR === -turn*2) && !bSuperDiagR) {
            captureMoves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex + offset], [rowIndex - (offset*2), columnIndex + (offset*2)]]);
            canCapture = true;
            console.log(captureMoves);
        }

    }
}

function checkMoves(rowIndex, columnIndex, diagL, diagR, offset, isKing, bDiagL, bDiagR) {

    if (diagL !== undefined && !diagL) {
        moves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex - offset]]);
    }

    if (diagR !== undefined && !diagR) {
        moves.push([[rowIndex, columnIndex], [rowIndex + offset, columnIndex + offset]]);
    }

    if (isKing && bDiagL !== undefined && !bDiagL) {
        console.log('row ', rowIndex, 'column', columnIndex, 'diagL', diagL, 'diagR', diagR, 'offset', offset, 'isKing', isKing, 'bDiagL', bDiagL, 'bDiagR', bDiagR);
        moves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex - offset]]);
    }

    if (isKing && bDiagR !== undefined && !bDiagR) {
        console.log('row ', rowIndex, 'column', columnIndex, 'diagL', diagL, 'diagR', diagR, 'offset', offset, 'isKing', isKing, 'bDiagL', bDiagL, 'bDiagR', bDiagR);
        moves.push([[rowIndex, columnIndex], [rowIndex - offset, columnIndex + offset]]);
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

// check the state board to see if a player has won

function checkWinner() {

    const p1Key = player1Val.toString()
    const p2Key = player2Val.toString();
    const p1KingKey = (player1Val * 2).toString();
    const p2KingKey = (player2Val * 2).toString();

    if (!pieceCount[p1Key] && !pieceCount[p1KingKey]) {
        console.log('pieceCount', pieceCount, 'p1Key', p1Key)
        winner = player2Val;
        turn = 0;
    } else if (!pieceCount[p2Key] && !pieceCount[p2KingKey]) {
        console.log('pieceCount', pieceCount, 'p2Key', p2Key)
        winner = player1Val;
        turn = 0;
    } else if (moves.length === 0 && captureMoves.length === 0) {
        winner = turn * -1;
        turn = 0;
    }
}