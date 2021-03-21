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

app.use(cors());

let playingDeck;
let pile;

let playerOne = {};
let playerTwo = {};

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

  /* <---------------------------------------- FUNCTIONS -------------------------------------------> */

  const refillPlayerCards = (playerCards, card, newCards) => {
    for (let i = 0; i < playerCards.length; i++) {
      if (card.length === 3) {
        if (playerCards[i].value !== card[0].value && playerCards[i].value !== card[1].value && playerCards[i].value !== card[2].value) {
          newCards.push(playerCards[i]);
        }
      }
      if (card.length === 2) {
        if (playerCards[i].value !== card[0].value && playerCards[i].value !== card[1].value) {
          newCards.push(playerCards[i]);
        }
      } else if (card.length === 1) {
        if (playerCards[i].value !== card[0].value) {
          newCards.push(playerCards[i]);
        }
      }
    }
  };

  const lowPileLogic = (data, cards, card, playerCards) => {
    if (data.pile.length === 3 && card.length >= 3) {
      playerCards.length <= 5 && cards.push(data.pile.splice(data.pile.length - card.length, 3));
    } else if (data.pile.length === 2 && card.length >= 2) {
      playerCards.length <= 5 && cards.push(data.pile.splice(data.pile.length - card.length, 2));
    } else if (data.pile.length === 1 && card.length >= 1) {
      playerCards.length <= 5 && cards.push(data.pile.splice(data.pile.length - card.length, 1));
    } else if (playerCards.length < 5) {
      cards.push(data.pile.splice(data.pile.length - card.length, card.length));
    } else if (playerCards.length - card.length === 4) {
      cards.push(data.pile.splice(data.pile.length - card.length, 1));
    } else if (playerCards.length - card.length === 3) {
      cards.push(data.pile.splice(data.pile.length - card.length, 2));
    } else if (playerCards.length - card.length === 2) {
      cards.push(data.pile.splice(data.pile.length - card.length, 3));
    }
  };

  const fourOfAKind = (card, myCards) => {
    const four = [myCards[myCards.length - 1].weight, myCards[myCards.length - 2].weight, myCards[myCards.length - 3].weight, myCards[myCards.length - 4].weight];
    console.log(four);

    const clearPile = four.filter((myCard) => myCard === card[0].weight);
    console.log(clearPile);
    return clearPile;
  };

  const playerMove = (card, data, playerCards, newCards) => {
    let myCards = data.activeCards.flat();
    refillPlayerCards(playerCards, card, newCards);

    if (data.pile.length > 0) {
      lowPileLogic(data, newCards, card, playerCards);
    }
    return myCards;
  };

  const playerMoveFaceCards = (data, newCards, card, playerCards) => {
    let newActiveCards = data.activeCards.flat();
    refillPlayerCards(playerCards, card, newCards);

    return newActiveCards;
  };

  const playerMoveWith10 = (data, newCards, card, playerCards) => {
    let newDiscardedCards = [];

    newDiscardedCards.push(data.activeCards);
    newDiscardedCards.push(card);

    refillPlayerCards(playerCards, card, newCards);

    if (data.pile.length > 0) {
      lowPileLogic(data, newCards, card, playerCards);
    }
    return newDiscardedCards;
  };

  /* <---------------------------------------- PLAYER ONE MOVE ----------------------------------------------------> */

  socket.on('playerOneMove', ({ card, playerOneCards, playerOne, gameData, currentActiveCard }) => {
    let newCards = [];
    console.log(gameData.pickUp);

    if (gameData.pickUp) {
      playerOneCards.push(gameData.activeCards);
      console.log(playerOneCards);
      gameData = { ...gameData, playerOne: { ...playerOne, playerOneCards: playerOneCards.flat() }, turn: 'playerTwo', activeCards: [], pickUp: false };
    } else {
      gameData.activeCards.push(card);

      let myCards = gameData.activeCards.flat();
      console.log(myCards);
      if (myCards.length > 3) {
        const clearPile = fourOfAKind(card, myCards);
        if (clearPile.length === 4) {
          const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerOneCards);
          gameData = {
            ...gameData,
            playerOne: { ...playerOne, playerOneCards: newCards.flat() },
            turn: 'playerOne',
            activeCards: [],
            discardedCards: newDiscardedCards,
            pickUp: false,
          };
        } else {
          const newActiveCards = playerMove(card, gameData, playerOneCards, newCards);

          gameData = {
            ...gameData,
            playerOne: { ...playerOne, playerOneCards: newCards.flat() },
            turn: 'playerTwo',
            activeCards: newActiveCards.flat(),
            pickUp: false,
          };
        }
      } else {
        const newActiveCards = playerMove(card, gameData, playerOneCards, newCards);

        gameData = {
          ...gameData,
          playerOne: { ...playerOne, playerOneCards: newCards.flat() },
          turn: 'playerTwo',
          activeCards: newActiveCards.flat(),
          pickUp: false,
        };
      }
    }
    console.log(gameData.playerOne.playerOneCards);
    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER ONE FACEUP MOVE -------------------------------------------> */

  socket.on('playerOneFaceUpMove', ({ card, playerOneFaceUp, playerOne, gameData, currentActiveCard }) => {
    let newCards = [];

    if (gameData.pickUp) {
      playerOneFaceUp.push(gameData.activeCards);
      gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceUp: playerOneFaceUp.flat() }, turn: 'playerTwo', activeCards: [], pickUp: false };
    } else {
      gameData.activeCards.push(card);
      let myCards = gameData.activeCards.flat();
      if (myCards.length > 3) {
        const clearPile = fourOfAKind(card, myCards);
        if (clearPile.length === 4) {
          const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerOneFaceUp);
          gameData = {
            ...gameData,
            playerOne: { ...playerOne, playerOneFaceUp: newCards.flat() },
            turn: 'playerOne',
            activeCards: [],
            discardedCards: newDiscardedCards,
            pickUp: false,
          };
        } else {
          const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerOneFaceUp);

          gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceUp: newCards.flat() }, turn: 'playerTwo', activeCards: newActiveCards, pickUp: false };
        }
      } else {
        const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerOneFaceUp);

        gameData = {
          ...gameData,
          playerOne: { ...playerOne, playerOneFaceUp: newCards.flat() },
          turn: 'playerTwo',
          activeCards: newActiveCards.flat(),
          pickUp: false,
        };
      }
    }

    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData, currentActiveCard });
  });
  /* <---------------------------------------- PLAYER ONE FACEDOWN MOVE -------------------------------------------> */

  socket.on('playerOneFaceDownMove', ({ card, playerOneFaceDown, playerOne, gameData, currentActiveCard }) => {
    let newCards = [];
    if (gameData.pickUp) {
      playerOneFaceDown.push(gameData.activeCards);
      gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceDown: playerOneFaceDown.flat() }, turn: 'playerTwo', activeCards: [], pickUp: false };
    } else {
      gameData.activeCards.push(card);
      let myCards = gameData.activeCards.flat();
      if (myCards.length > 3) {
        const clearPile = fourOfAKind(card, myCards);

        if (clearPile.length === 4) {
          const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerOneFaceDown);
          gameData = {
            ...gameData,
            playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() },
            turn: 'playerOne',
            activeCards: [],
            discardedCards: newDiscardedCards,
            pickUp: false,
          };
        } else {
          const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerOneFaceDown);

          gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() }, turn: 'playerTwo', activeCards: newActiveCards, pickUp: false };
        }
      } else {
        const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerOneFaceDown);

        gameData = {
          ...gameData,
          playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() },
          turn: 'playerTwo',
          activeCards: newActiveCards.flat(),
          pickUp: false,
        };
      }
    }
    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER ONE MOVE WITH TEN -------------------------------------------> */

  socket.on('playerOneMoveWith10', ({ card, playerOneCards, playerOne, gameData, currentActiveCard }) => {
    let newCards = [];
    const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerOneCards);

    gameData = {
      ...gameData,
      playerOne: { ...playerOne, playerOneCards: newCards.flat() },
      turn: 'playerOne',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER ONE FACEUP MOVE WITH TEN -------------------------------------------> */

  socket.on('playerOneFaceUpMoveWith10', ({ card, playerOneFaceUp, playerOne, gameData, currentActiveCard }) => {
    let newCards = [];
    const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerOneFaceUp);

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerOne: { ...playerOne, playerOneFaceUp: newCards.flat() },
      turn: 'playerOne',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER ONE FACEDOWN MOVE WITH TEN -------------------------------------------> */

  socket.on('playerOneFaceDownMoveWith10', ({ card, playerOneFaceDown, playerOne, gameData, currentActiveCard }) => {
    let newCards = [];
    const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerOneFaceDown);

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() },
      turn: 'playerOne',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER TWO MOVE -------------------------------------------> */

  socket.on('playerTwoMove', ({ card, playerTwoCards, playerTwo, gameData, currentActiveCard }) => {
    let newCards = [];
    if (gameData.pickUp) {
      playerTwoCards.push(gameData.activeCards);
      gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoCards: playerTwoCards.flat() }, turn: 'playerOne', activeCards: [], pickUp: false };
    } else {
      gameData.activeCards.push(card);
      let myCards = gameData.activeCards.flat();
      if (myCards.length > 3) {
        const clearPile = fourOfAKind(card, myCards);
        if (clearPile.length === 4) {
          const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerTwoCards);
          gameData = {
            ...gameData,
            playerTwo: { ...playerTwo, playerTwoCards: newCards.flat() },
            turn: 'playerTwo',
            activeCards: [],
            discardedCards: newDiscardedCards,
            pickUp: false,
          };
        } else {
          const newActiveCards = playerMove(card, gameData, playerTwoCards, newCards);

          gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoCards: newCards.flat() }, turn: 'playerOne', activeCards: newActiveCards, pickUp: false };
        }
      } else {
        const newActiveCards = playerMove(card, gameData, playerTwoCards, newCards);

        gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoCards: newCards.flat() }, turn: 'playerOne', activeCards: newActiveCards, pickUp: false };
      }
    }
    io.to(gameData.playerTwo.room).emit('nextTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER Two FACEUP MOVE -------------------------------------------> */

  socket.on('playerTwoFaceUpMove', ({ card, playerTwoFaceUp, playerTwo, gameData, currentActiveCard }) => {
    let newCards = [];
    if (gameData.pickUp) {
      playerTwoFaceUp.push(gameData.activeCards);
      gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoFaceUp: playerTwoFaceUp.flat() }, turn: 'playerOne', activeCards: [], pickUp: false };
    } else {
      gameData.activeCards.push(card);
      let myCards = gameData.activeCards.flat();
      if (myCards.length > 3) {
        const clearPile = fourOfAKind(card, myCards);
        if (clearPile.length === 4) {
          const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerTwoFaceUp);
          gameData = {
            ...gameData,
            playerTwo: { ...playerTwo, playerTwoFaceUp: newCards.flat() },
            turn: 'playerTwo',
            activeCards: [],
            discardedCards: newDiscardedCards,
            pickUp: false,
          };
        } else {
          const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerTwoFaceUp);

          gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoFaceUp: newCards.flat() }, turn: 'playerOne', activeCards: newActiveCards, pickUp: false };
        }
      } else {
        const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerTwoFaceUp);

        gameData = {
          ...gameData,
          playerTwo: { ...playerTwo, playerTwoFaceUp: newCards.flat() },
          turn: 'playerOne',
          activeCards: newActiveCards.flat(),
          pickUp: false,
        };
      }
    }
    io.to(gameData.playerTwo.room).emit('nextTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData, currentActiveCard });
  });
  /* <---------------------------------------- PLAYER Two FACEDOWN MOVE -------------------------------------------> */

  socket.on('playerTwoFaceDownMove', ({ card, playerTwoFaceDown, playerTwo, gameData, currentActiveCard }) => {
    let newCards = [];
    if (gameData.pickUp) {
      playerTwoFaceDown.push(gameData.activeCards);
      gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoFaceDown: playerTwoFaceDown.flat() }, turn: 'playerOne', activeCards: [], pickUp: false };
    } else {
      gameData.activeCards.push(card);
      let myCards = gameData.activeCards.flat();
      if (myCards.length > 3) {
        const clearPile = fourOfAKind(card, myCards);
        if (clearPile.length === 4) {
          const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerTwoFaceDown);
          gameData = {
            ...gameData,
            playerTwo: { ...playerTwo, playerTwoFaceDown: newCards.flat() },
            turn: 'playerTwo',
            activeCards: [],
            discardedCards: newDiscardedCards,
            pickUp: false,
          };
        } else {
          const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerTwoFaceDown);

          gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoFaceDown: newCards.flat() }, turn: 'playerOne', activeCards: newActiveCards, pickUp: false };
        }
      } else {
        const newActiveCards = playerMoveFaceCards(gameData, newCards, card, playerTwoFaceDown);

        gameData = {
          ...gameData,
          playerTwo: { ...playerTwo, playerTwoFaceDown: newCards.flat() },
          turn: 'playerOne',
          activeCards: newActiveCards.flat(),
          pickUp: false,
        };
      }
    }
    io.to(gameData.playerTwo.room).emit('nextTurn', { message: `${gameData.playerOne.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER Two MOVE WITH TEN -------------------------------------------> */

  socket.on('playerTwoMoveWith10', ({ card, playerTwoCards, playerTwo, gameData, currentActiveCard }) => {
    let newCards = [];
    const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerTwoCards);

    gameData = {
      ...gameData,
      playerTwo: { ...playerTwo, playerTwoCards: newCards.flat() },
      turn: 'playerTwo',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerTwo.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER TWO FACEUP MOVE WITH TEN -------------------------------------------> */

  socket.on('playerTwoFaceUpMoveWith10', ({ card, playerTwoFaceUp, playerTwo, gameData, currentActiveCard }) => {
    let newCards = [];
    const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerTwoFaceUp);

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerTwo: { ...playerTwo, playerTwoFaceUp: newCards.flat() },
      turn: 'playerTwo',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerTwo.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER Two FACEDOWN MOVE WITH TEN -------------------------------------------> */

  socket.on('playerTwoFaceDownMoveWith10', ({ card, playerTwoFaceDown, playerTwo, gameData, currentActiveCard }) => {
    let newCards = [];
    const newDiscardedCards = playerMoveWith10(gameData, newCards, card, playerTwoFaceDown);

    /* <-------------------------------------------------------------------------------------------------------> */

    gameData = {
      ...gameData,
      playerTwo: { ...playerTwo, playerTwoFaceDown: newCards.flat() },
      turn: 'playerTwo',
      activeCards: [],
      discardedCards: newDiscardedCards,
      pickUp: false,
    };

    io.to(gameData.playerTwo.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, it's your turn`, gameData, currentActiveCard });
  });

  /* <---------------------------------------- PLAYER ONE WINS -------------------------------------------> */

  socket.on('playerOneWins', ({ card, playerOne, gameData }) => {
    console.log('player one winner');
    let newCards = [];
    gameData.activeCards.push(card);
    let newActiveCards = gameData.activeCards.flat().reverse();

    gameData = { ...gameData, playerOne: { ...playerOne, playerOneFaceDown: newCards.flat() }, turn: 'playerOne', activeCards: newActiveCards, pickUp: false };
    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerOne.name}, wins`, gameData, currentActiveCard: [] });
  });

  /* <---------------------------------------- PLAYER TWO WINS -------------------------------------------> */

  socket.on('playerTwoWins', ({ card, playerTwo, gameData }) => {
    console.log('player two winner');
    let newCards = [];
    gameData.activeCards.push(card);
    let newActiveCards = gameData.activeCards.flat().reverse();

    gameData = { ...gameData, playerTwo: { ...playerTwo, playerTwoFaceDown: newCards.flat() }, turn: 'playerTwo', activeCards: newActiveCards, pickUp: false };
    io.to(gameData.playerOne.room).emit('nextTurn', { message: `${gameData.playerTwo.name}, wins`, gameData, currentActiveCard: [] });
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
