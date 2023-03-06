// TO DO

// Flip gameBoard representation so gameBoard looks like visualized board
// Fix all necessary code to implement the above
// on second thought, ehhh...

// Add a move function that moves a clicked piece to a clicked tile if said piece can move there




/*----- Constants -----*/

const gameBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const playerColors = {
    '1': 'dark-piece',
    '-1': 'light-piece'
}

/*----- State Variables -----*/
let winner; // 1 (player 1), -1 (opponent), or 0 no win yet
// let canJump; // bool representing whether or not any player can jump, in which case they must
let playerVal; // 1 or -1
let opponentVal; // 1 or -1
let turn; // player or opponent val
let opposing; // value of the opposing player to "turn"
let playerPieces = []; // stores location of all player pieces as arrays [r, c]
let opponentPieces = []; // stores location of all opponent pieces as arrays [r, c]

let piecesThatCanCapture;



/*----- Cached Variables -----*/
const boardEl = document.querySelector('#game-board');
const playDark = document.querySelector('#play-dark-button');
const playLight = document.querySelector('#play-light-button');
const tiles = document.querySelectorAll('#game-board > div');
//const lightPieceEls = document.querySelectorAll('.dark-piece');
//const darkPieceEls = document.querySelectorAll('.light-piece');

for (let i = 0; i < 12; i++) {
    const newPlayerPiece = document.createElement('button');
    newPlayerPiece.className = 'player-piece';
    newPlayerPiece.style.display = 'none';
    boardEl.appendChild(newPlayerPiece);
}
for (let i = 0; i < 12; i++) {
    const newOpponentPiece = document.createElement('button');
    newOpponentPiece.className = 'opponent-piece';
    newOpponentPiece.style.display = 'none';
    boardEl.appendChild(newOpponentPiece);
}

const playerPieceEls = document.querySelectorAll('.player-piece');
const opponentPieceEls = document.querySelectorAll('.opponent-piece');




/*----- Event listeners -----*/

// Start game, playing as dark (plays first)
playDark.addEventListener('click', function() {
    playerVal = 1;
    opponentVal = -1;
    init();
})

// Start game, playing as light (plays second)
playLight.addEventListener('click', function() {
    playerVal = -1;
    opponentVal = 1;
    init();
})

// Shows a piece's possible moves, and highlights the piece, readying it for movement
boardEl.addEventListener('click', function(event) {
    console.log(event.target);
    if (event.target.classList.contains('player-piece') && turn === playerVal) {
        showMoves(event);
    }
})

// Moves a highlighted piece to the selected tile
boardEl.addEventListener('click', function(event) {
    highlightedPiece = document.querySelector('.highlighted');
    if (highlightedPiece) {
        console.log(event.target.parentNode);
        const targetClass = event.target.classList;
        console.log(targetClass);
        if (targetClass.contains('potential-moves')) { // target is a potential-moves marker
            gridId = event.target.parentNode.id;
            movePiece(highlightedPiece, gridId);
        } else if (targetClass.contains('light') || targetClass.contains('dark')) { // target is a tile 
            gridId = event.target.id;
            const targetRow = gridId[1];
            const targetColumn = gridId[3];
            pieceLocation = highlightedPiece.parentNode.id;
            const pieceRow = pieceLocation[1];
            const pieceColumn = pieceLocation[3];
            movePiece(highlightedPiece, gridId);
        } else if (!targetClass.contains('highlighted')) {
            highlightedPiece.classList.remove('highlighted');
        }
    }

})

boardEl.addEventListener('click', function(event) {
    highlightedPiece
})

// board


/*----- Functions -----*/



function init() {
    turn = 1;
    opposing = -turn;
    clearBoard();
    initilializeBoard();
    // while (!winner) {
    //     render();
    // }
}



function initilializeBoard() {

    let column = -2;
    let row = 0;
    for (let i = 0; i < 12; i++) { // initialize playerPieces;
        const currentPiece = playerPieceEls[i];

        row = Math.floor(i / 4);
        column +=  2;
        if (column === 8) {
            column = 1;
        } else if (column === 9) {
            column = 0;
        }

        // update state game board
        gameBoard[row][column] = playerVal;
        playerPieces.push([row, column]);

        // update display
        const tile = document.getElementById(`r${row}c${column}`);
        currentPiece.className = `player-piece ${playerColors[playerVal.toString()]}`;
        tile.appendChild(currentPiece);
        playerPieceEls[i].style.display = 'block';
        
    }

    // initialize opponent pieces
    column = -1;
    for (let i = 0; i < 12; i++) {
        const currentPiece = opponentPieceEls[i];

        row = (7 - Math.floor(i / 4));
        column += 2;
        if (column === 8) {
            column = 1;
        } else if (column === 9) {
            column = 0;
        }

        // update state game board
        gameBoard[row][column] = opponentVal;
        opponentPieces.push([row, column]);

        // update display
        const tile = document.querySelector(`#r${row}c${column}`);
        currentPiece.className = `opponent-piece ${playerColors[opponentVal.toString()]}`;
        tile.appendChild(currentPiece);
        opponentPieceEls[i].style.display = 'block';
        
    }
}

function clearBoard() {
    
    // clear state game board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            gameBoard[i][j] = 0;
        }
    }
    console.log(gameBoard);

    // clear display
    //console.log(tiles);
    for (let i = 0; i < tiles.length; i++) {
        // console.log(tiles[i]);
        if (tiles[i].hasChildNodes()) {
            tiles[i].removeChild(tiles[i].childNodes[0]);
        }
    }
}

function render() {
    canCapture();
    winner = 2;
}

function renderBoard() {
    
}


// CAN CAPTURE

function canCapture() {

    piecesThatCanCapture = [];

    //console.log(turn);
    //console.log(playerPieces);
    //console.log(opponentPieces);

    let turnPieces;
    let turnVal;
    let opposingVal;

    if (turn === playerVal) {
        turnPieces = playerPieces;
        turnVal = 1;
    } else if (turn === opponentVal) {
        turnPieces = opponentPieces;
        turnVal = -1;
    }

    opposingVal = -turnVal;

    console.log(turnPieces);

    turnPieces.forEach(function(piece) { 

        const r = piece[0];
        const c = piece[1];
        const diagL = gameBoard[r+turnVal][c-1]; // piece's left diagonal
        const diagR = gameBoard[r+turnVal][c+1]; // piece's right diagonal

        if (diagL === opposingVal) { // if there is an enemy to the left
            if (!gameBoard[r + (2 * turnVal)][c + 2]) { // if the space 2 squares diagonally left is  empty
                piecesThatCanCapture.push([[r, c], [r + 2, c + 2]]) // piece that can capture, location it would move afterwards
            } 
        }
        if (diagR === opposingVal) { // if there is an enemy to the right
            if (!gameBoard[r + (2 * turnVal)][c - 2]) {
                piecesThatCanCapture.push([[r, c], [r + 2, c - 2]]) // piece that can capture, location it would move afterwards
            }
        }
    })

    return piecesThatCanCapture;
}




// SHOW A PIECE'S MOVES


function getMoveOptions(r, c) { // shows a piece's possible moves when hovering over it
    
    // piece's left diagonal
    console.log('r = ', r,  'c = ', c);
    let diagL;
    let diagR;
    if (c - 1 !== -1) {
        diagL = gameBoard[r+1][c-1];
    } else {
        diagL = 2;
    }

    // piece's right diagonal
    if (c + 1 !== 8) {
        diagR = gameBoard[r+1][c+1];
    } else {
        diagR = 2;
    }

    console.log(diagL, diagR);
    
    let moveOptions = [];

    canCapture();

    if (piecesThatCanCapture.length > 0) {

        piecesThatCanCapture.forEach(function(piece) {
            if (piece[0] === [r, c]) {
                moveOptions += piece[1];
            }
        })

    } else {

        if (diagL && diagR) { // no possible moves with this piece
            return [];
        }

        if (!diagL) { // if a piece's left diagonal is empty
            moveOptions.push([r+1, c-1]);
        }

        if (!diagR) { // if a piece's right diagonal is empty
            moveOptions.push([r+1, c+1]);
        }
    }

    console.log(moveOptions);

    return moveOptions;

    

}

function showMoves(event) { //r_c_
    const shownMoves = document.querySelectorAll('.possible-moves');
    for (let i = 0; i < shownMoves.length; i++) {
        shownMoves[i].remove();
    }

    const highlightedPiece = document.querySelector('.highlighted');
    if (highlightedPiece) {
        highlightedPiece.classList.remove('highlighted');
    }

    //canCapture(); //**** move this into render */
    console.log(event.target);
    const gridId = event.target.parentNode.id;
    const r = parseInt(gridId[1]); // r_
    const c = parseInt(gridId[3]); // c_
    console.log(gridId);
    // if (r && c) {
    //     showMoves(gridId);
    // }
    let moves = getMoveOptions(r, c);
    moves.forEach(function(move) {
        if (move) { // if move isn't null - move is null when piece cannot move diagonally in a certain direction
            const moveMarkerEl = document.createElement('div');
            const moveTileEl = document.querySelector(`#r${move[0]}c${move[1]}`);
            moveMarkerEl.className = 'possible-moves';
            moveTileEl.appendChild(moveMarkerEl);
        }
    });

    event.target.className += ' highlighted';
}

// MOVE

function movePiece(highlightedPiece, gridId) {
    
}

// function 