# __Ultimate Leapfrog__
## _An In-Browser Checkers Game_

</br>

#### Like Leapfrog, but if you get jumped over - you're out!

##### (In some parts of the world, this game is more commonly known as Checkers.)

</br>

### This two player in-browser checkers game includes many features of the classic board game, including king pieces and forced capturing. 

</br>

### In addition, Ultimate Leapfrog includes some features only a virtual rendering of the game could provide, such as color-coded turn indicators and the ability to reset the board instantly to play as either color.

</br>

## __Want to play the demo? Get started by clicking the link below:__

[CLICK HERE to play ULTIMATE LEAPFROG](https://vilem-mckael.github.io/Ultimate-Leapfrog-Checkers-Game/)

</br>

## The rules of Ultimate Leapfrog are as follows:

- One move per player per turn.
- Brown always plays the first move.
- If a piece can capture, it must capture. If multiple pieces can capture at once, the player can choose which capture they would like to make.
- Getting your piece to the opposite end of the board turns that piece into a "king" piece, distinguished by a slightly different and brighter color (ruby red for brown pieces, sky blue for green pieces). King pieces can move and capture in both directions.
- The game is over when one player captures all of the other's pieces - the player with pieces remaining is the winner. Another possibility is that none of one particular player's pieces can move, having been trapped behind the other player's pieces. In this case, the player who cannot make a move loses.


</br>

## Game Gallery:

</br>

![](https://i.imgur.com/gRb4whK.png)

</br>

![](https://i.imgur.com/3s3SFf1.png)

</br>

![](https://i.imgur.com/7aF2AS7.png)

</br>

![](https://i.imgur.com/akxz1C7.png)

</br>

![]()

### Code Snippits:

</br>

#### The function checkWinner determines whether or not a player has one the game by checking 3 different conditions:
- Has player1 lost all of their pieces?
- Has player2 lost all of their pieces?
- Can a player's last pieces been trapped, meaning they cannot make a legal move?

</br>

```js
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
```

</br>

#### This next function, renderBoard, updates the displayed game board every turn based on the current values on the "state board", or the board storing piece locations in JavaScript.

</br>

```js
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

                // create a new piece
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
```

</br>

***

## Ultimate Leapfrog was made using the following languages:

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white)

</br>

## Planned future updates to the game include:

- Multi-jump functionality, where a piece can capture more pieces after its first capture, as many times as is possible.
- "Capture Counters", a UI element displaying how many of their opponent's pieces each player has captured.
- Sound effects for moving, capturing, "kinging" pieces, and winning the game.
- The ability for player1 to choose a random piece color.
- The option to play against a basic CPU opponent instead of another player.
