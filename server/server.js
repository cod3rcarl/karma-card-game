// const { socket } = require('./socketAPI.js');
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const server = require('http').Server(app);
const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const cors = require('cors');
const { userJoin, userLeave, users, isDuplicate, error } = require('./users');
const { createReadStream } = require('fs');
app.use(cors());

let playingDeck;
let pile;

let playerOne = {};
let playerTwo = {};

// const remove = (arr, value) => arr.filter((ele) => ele.value !== value.value);

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  /* <---------------------------------------- ENTER GAME ROOM -------------------------------------------> */

  socket.on('gameRoom', ({ name, room, id }) => {
    const user = userJoin({ name, room, id, isDuplicate, error });

    socket.join(room);
    user.isDuplicate.length === 0
      ? (playerOne = { ...playerOne, game_id: uuidv4(), name, room, id, isDuplicate: user.isDuplicate, error })
      : (playerTwo = { ...playerTwo, game_id: playerOne.game_id, name, room, id, isDuplicate: user.isDuplicate, error });

    user.isDuplicate.length >= 2 ? io.to(id).emit('error', { error }) : io.to(room).emit('enterMessage', { message: `${name} has joined`, users, playerOne, playerTwo });

    user.isDuplicate.length < 2 && console.log(`${user.name} has joined room ${user.room}`);
    user.isDuplicate.length < 2 && console.log(`${user.isDuplicate.length + 1} user(s) in room ${user.room}`);
  });

  /* <---------------------------------------- DEAL CARDS -------------------------------------------> */

  socket.on('deal', ({ deck, playerOne, playerTwo }) => {
    playingDeck = deck;
    pile = playingDeck;

    playerOne = {
      ...playerOne,
      playerOneCards: playingDeck.splice(playingDeck.length - 5, 5),
      playerOneFaceUp: playingDeck.splice(playingDeck.length - 5, 5),
      playerOneFaceDown: playingDeck.splice(playingDeck.length - 5, 5),
    };

    playerTwo = {
      ...playerTwo,
      playerTwoCards: playingDeck.splice(playingDeck.length - 5, 5),
      playerTwoFaceUp: playingDeck.splice(playingDeck.length - 5, 5),
      playerTwoFaceDown: playingDeck.splice(playingDeck.length - 5, 5),
    };

    const gameData = {
      playerOne,
      playerTwo,
      discardedCards: [],
      activeCards: [],
      pile,
      pickUp: false,
      turn: 'playerOne',
    };
    playerTwo.room && io.to(playerOne.room).emit('setupBoard', { gameData });
  });
  /* <---------------------------------------- LEAVE GAME ROOM -------------------------------------------> */

  socket.on('leaveGameRoom', ({ id, data, name, room }) => {
    if (data) {
      data = {};
    }
    userLeave(room, id);
    socket.leave(room);
    io.to(room).emit('leaveMessage', { message: `${name} has left`, data });

    console.log(`${name} has left room ${room}`);
    console.log(`${users.length} user(s) in room ${room}`);
  });

  /* <---------------------------------------- PLAYER ONE MOVE -------------------------------------------> */

  socket.on('playerOneMove', ({ card, playerOneCards, playerOne, gameData }) => {
    if (gameData.pickUp) {
      playerOneCards.push(gameData.activeCards);
      gameData = { ...gameData, playerOne: { ...playerOne, playerOneCards: playerOneCards.flat() }, turn: 'playerTwo', activeCards: [], pickUp: false };
    } else {
      let newCards = [];

      gameData.activeCards.push(card);

      let newActiveCards = gameData.activeCards.flat().reverse();

      for (let i = 0; i < playerOneCards.length; i++) {
        if (card.length === 3) {
          if (playerOneCards[i].value !== card[0].value && playerOneCards[i].value !== card[1].value && playerOneCards[i].value !== card[2].value) {
            newCards.push(playerOneCards[i]);
          }
        }
        if (card.length === 2) {
          if (playerOneCards[i].value !== card[0].value && playerOneCards[i].value !== card[1].value) {
            newCards.push(playerOneCards[i]);
          }
        } else if (card.length === 1) {
          if (playerOneCards[i].value !== card[0].value) {
            newCards.push(playerOneCards[i]);
          }
        }
      }

      /* <---------------------------------------- LOGIC WHEN PILE < 5 -------------------------------------------> */
      if (gameData.pile.length > 0) {
        if (gameData.pile.length === 3 && card.length >= 3) {
          playerOneCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
        } else if (gameData.pile.length === 2 && card.length >= 2) {
          playerOneCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
        } else if (gameData.pile.length === 1 && card.length >= 1) {
          playerOneCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
        } else if (playerOneCards.length < 5) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, card.length));
        } else if (playerOneCards.length - card.length === 4) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
        } else if (playerOneCards.length - card.length === 3) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
        } else if (playerOneCards.length - card.length === 2) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
        }
      }

      /* <-------------------------------------------------------------------------------------------------------> */

      gameData = { ...gameData, playerOne: { ...playerOne, playerOneCards: newCards.flat() }, turn: 'playerTwo', activeCards: newActiveCards, pickUp: false };
    }

    io.to(gameData.playerOne.room).emit('playerTwoTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- PLAYER ONE FACEUP MOVE -------------------------------------------> */

  socket.on('playerOneFaceUpMove', ({ card, playerOneFaceUp, playerOne, gameData }) => {
    if (gameData.pickUp) {
      playerOneFaceUp.push(gameData.activeCards);
      gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceUp: playerOneFaceUp.flat() }, turn: 'playerTwo', activeCards: [], pickUp: false };
    } else {
      let newCards = [];

      gameData.activeCards.push(card);

      let newActiveCards = gameData.activeCards.flat().reverse();

      for (let i = 0; i < playerOneFaceUp.length; i++) {
        if (card.length === 3) {
          if (playerOneFaceUp[i].value !== card[0].value && playerOneFaceUp[i].value !== card[1].value && playerOneFaceUp[i].value !== card[2].value) {
            newCards.push(playerOneFaceUp[i]);
          }
        }
        if (card.length === 2) {
          if (playerOneFaceUp[i].value !== card[0].value && playerOneFaceUp[i].value !== card[1].value) {
            newCards.push(playerOneFaceUp[i]);
          }
        } else if (card.length === 1) {
          if (playerOneFaceUp[i].value !== card[0].value) {
            newCards.push(playerOneFaceUp[i]);
          }
        }
      }

      gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceUp: newCards.flat() }, turn: 'playerTwo', activeCards: newActiveCards, pickUp: false };
    }

    io.to(gameData.playerOne.room).emit('playerTwoTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData });
  });
  /* <---------------------------------------- PLAYER ONE FACEDOWN MOVE -------------------------------------------> */

  socket.on('playerOneFaceDownMove', ({ card, playerOneFaceDown, playerOne, gameData }) => {
    if (gameData.pickUp) {
      playerOneFaceDown.push(gameData.activeCards);
      gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceDown: playerOneFaceDown.flat() }, turn: 'playerTwo', activeCards: [], pickUp: false };
    } else {
      let newCards = [];

      gameData.activeCards.push(card);

      let newActiveCards = gameData.activeCards.flat().reverse();

      for (let i = 0; i < playerOneFaceDown.length; i++) {
        if (card.length === 3) {
          if (playerOneFaceDown[i].value !== card[0].value && playerOneFaceDown[i].value !== card[1].value && playerOneFaceDown[i].value !== card[2].value) {
            newCards.push(playerOneFaceDown[i]);
          }
        }
        if (card.length === 2) {
          if (playerOneFaceDown[i].value !== card[0].value && playerOneFaceDown[i].value !== card[1].value) {
            newCards.push(playerOneFaceDown[i]);
          }
        } else if (card.length === 1) {
          if (playerOneFaceDown[i].value !== card[0].value) {
            newCards.push(playerOneFaceDown[i]);
          }
        }
      }

      gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() }, turn: 'playerTwo', activeCards: newActiveCards, pickUp: false };
    }

    io.to(gameData.playerOne.room).emit('playerTwoTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- PLAYER ONE MOVE WITH TEN -------------------------------------------> */

  socket.on('playerOneMoveWith10', ({ card, playerOneCards, playerOne, gameData }) => {
    let newCards = [];
    let newDiscardedCards = [];

    newDiscardedCards.push(gameData.activeCards);
    newDiscardedCards.push(card);

    for (let i = 0; i < playerOneCards.length; i++) {
      if (card.length === 3) {
        if (playerOneCards[i].value !== card[0].value && playerOneCards[i].value !== card[1].value && playerOneCards[i].value !== card[2].value) {
          newCards.push(playerOneCards[i]);
        }
      }
      if (card.length === 2) {
        if (playerOneCards[i].value !== card[0].value && playerOneCards[i].value !== card[1].value) {
          newCards.push(playerOneCards[i]);
        }
      } else if (card.length === 1) {
        if (playerOneCards[i].value !== card[0].value) {
          newCards.push(playerOneCards[i]);
        }
      }
    }

    /* <---------------------------------------- LOGIC WHEN PILE < 5 -------------------------------------------> */
    if (gameData.pile.length > 0) {
      if (gameData.pile.length === 3 && card.length >= 3) {
        playerOneCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
      } else if (gameData.pile.length === 2 && card.length >= 2) {
        playerOneCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
      } else if (gameData.pile.length === 1 && card.length >= 1) {
        playerOneCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
      } else if (playerOneCards.length < 5) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, card.length));
      } else if (playerOneCards.length - card.length === 4) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
      } else if (playerOneCards.length - card.length === 3) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
      } else if (playerOneCards.length - card.length === 2) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
      }
    }

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerOne: { ...playerOne, playerOneCards: newCards.flat() },
      turn: 'playerOne',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerOne.room).emit('playerTwoTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- PLAYER ONE FACEUP MOVE WITH TEN -------------------------------------------> */

  socket.on('playerOneFaceUpMoveWith10', ({ card, playerOneFaceUp, playerOne, gameData }) => {
    let newCards = [];
    let newDiscardedCards = [];

    newDiscardedCards.push(gameData.activeCards);
    newDiscardedCards.push(card);

    for (let i = 0; i < playerOneFaceUp.length; i++) {
      if (card.length === 3) {
        if (playerOneFaceUp[i].value !== card[0].value && playerOneFaceUp[i].value !== card[1].value && playerOneFaceUp[i].value !== card[2].value) {
          newCards.push(playerOneFaceUp[i]);
        }
      }
      if (card.length === 2) {
        if (playerOneFaceUp[i].value !== card[0].value && playerOneFaceUp[i].value !== card[1].value) {
          newCards.push(playerOneFaceUp[i]);
        }
      } else if (card.length === 1) {
        if (playerOneFaceUp[i].value !== card[0].value) {
          newCards.push(playerOneFaceUp[i]);
        }
      }
    }

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerOne: { ...playerOne, playerOneFaceUp: newCards.flat() },
      turn: 'playerOne',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerOne.room).emit('playerTwoTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- PLAYER ONE FACEDown MOVE WITH TEN -------------------------------------------> */

  socket.on('playerOneFaceDownMoveWith10', ({ card, playerOneFaceDown, playerOne, gameData }) => {
    let newCards = [];
    let newDiscardedCards = [];

    newDiscardedCards.push(gameData.activeCards);
    newDiscardedCards.push(card);

    for (let i = 0; i < playerOneFaceDown.length; i++) {
      if (card.length === 3) {
        if (playerOneFaceDown[i].value !== card[0].value && playerOneFaceDown[i].value !== card[1].value && playerOneFaceDown[i].value !== card[2].value) {
          newCards.push(playerOneFaceDown[i]);
        }
      }
      if (card.length === 2) {
        if (playerOneFaceDown[i].value !== card[0].value && playerOneFaceDown[i].value !== card[1].value) {
          newCards.push(playerOneFaceDown[i]);
        }
      } else if (card.length === 1) {
        if (playerOneFaceDown[i].value !== card[0].value) {
          newCards.push(playerOneFaceDown[i]);
        }
      }
    }

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() },
      turn: 'playerOne',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerOne.room).emit('playerTwoTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- PLAYER TW0 MOVE -------------------------------------------> */

  socket.on('playerTwoMove', ({ card, playerTwoCards, playerTwo, gameData }) => {
    if (gameData.pickUp === true) {
      playerTwoCards.push(gameData.activeCards);
      gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoCards: playerTwoCards.flat() }, turn: 'playerOne', activeCards: [], pickUp: false };
    } else {
      let newCards = [];

      gameData.activeCards.push(card);

      let newActiveCards = gameData.activeCards.flat().reverse();

      for (let i = 0; i < playerTwoCards.length; i++) {
        if (card.length === 3) {
          if (playerTwoCards[i].value !== card[0].value && playerTwoCards[i].value !== card[1].value && playerTwoCards[i].value !== card[2].value) {
            newCards.push(playerTwoCards[i]);
          }
        }
        if (card.length === 2) {
          if (playerTwoCards[i].value !== card[0].value && playerTwoCards[i].value !== card[1].value) {
            newCards.push(playerTwoCards[i]);
          }
        } else if (card.length === 1) {
          if (playerTwoCards[i].value !== card[0].value) {
            newCards.push(playerTwoCards[i]);
          }
        }
      }

      /* <---------------------------------------- LOGIC WHEN PILE < 5 -------------------------------------------> */
      if (gameData.pile.length > 0) {
        if (gameData.pile.length === 3 && card.length >= 3) {
          playerTwoCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
        } else if (gameData.pile.length === 2 && card.length >= 2) {
          playerTwoCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
        } else if (gameData.pile.length === 1 && card.length >= 1) {
          playerTwoCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
        } else if (playerTwoCards.length < 5) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, card.length));
        } else if (playerTwoCards.length - card.length === 4) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
        } else if (playerTwoCards.length - card.length === 3) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
        } else if (playerTwoCards.length - card.length === 2) {
          newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
        }
      }

      /* <-------------------------------------------------------------------------------------------------------> */

      gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoCards: newCards.flat() }, turn: 'playerOne', activeCards: newActiveCards, pickUp: false };
    }
    io.to(gameData.playerOne.room).emit('playerOneTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- PLAYER TWO MOVE WITH TEN -------------------------------------------> */

  socket.on('playerTwoMoveWith10', ({ card, playerTwoCards, playerTwo, gameData }) => {
    let newCards = [];
    let newDiscardedCards = [];
    newDiscardedCards.push(gameData.activeCards);
    newDiscardedCards.push(card);

    for (let i = 0; i < playerTwoCards.length; i++) {
      if (card.length === 3) {
        if (playerTwoCards[i].value !== card[0].value && playerTwoCards[i].value !== card[1].value && playerTwoCards[i].value !== card[2].value) {
          newCards.push(playerTwoCards[i]);
        }
      }
      if (card.length === 2) {
        if (playerTwoCards[i].value !== card[0].value && playerTwoCards[i].value !== card[1].value) {
          newCards.push(playerTwoCards[i]);
        }
      } else if (card.length === 1) {
        if (playerTwoCards[i].value !== card[0].value) {
          newCards.push(playerTwoCards[i]);
        }
      }
    }

    /* <---------------------------------------- LOGIC WHEN PILE < 5 -------------------------------------------> */
    if (gameData.pile.length > 0) {
      if (gameData.pile.length === 3 && card.length >= 3) {
        playerTwoCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
      } else if (gameData.pile.length === 2 && card.length >= 2) {
        playerTwoCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
      } else if (gameData.pile.length === 1 && card.length >= 1) {
        playerTwoCards.length <= 5 && newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
      } else if (playerTwoCards.length < 5) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, card.length));
      } else if (playerTwoCards.length - card.length === 4) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 1));
      } else if (playerTwoCards.length - card.length === 3) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 2));
      } else if (playerTwoCards.length - card.length === 2) {
        newCards.push(gameData.pile.splice(gameData.pile.length - card.length, 3));
      }
    }

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerTwo: { ...playerTwo, playerTwoCards: newCards.flat() },
      turn: 'playerTwo',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerTwo.room).emit('playerTwoTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData });
  });

  /* <---------------------------------------- GAME OVER -------------------------------------------> */

  socket.on('gameover', ({ gameData }) => {
    console.log('GAMEOVER');
  });

  /* <---------------------------------------- DISCONNECT -------------------------------------------------> */

  socket.on('disconnect', () => {
    socket.disconnect();
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Api listening on port ${PORT}!`);
});

module.exports = app;
