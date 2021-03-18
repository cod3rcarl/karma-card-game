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
let activeCards;

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
    activeCards = playingDeck;

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
      uuid: uuidv4(),
      playerOne,
      playerTwo,
      discardedCards: [],
      activeCards,
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

  socket.on('playerOneMove', ({ card, playerOneCards }) => {
    let newCards = [];

    for (let i = 0; i < playerOneCards.length; i++) {
      if (card.length === 4) {
        if (playerOneCards[i].value !== card[0].value && playerOneCards[i].value !== card[1].value && playerOneCards[i].value !== card[2].value && playerOneCards[i].value !== card[3].value) {
          newCards.push(playerOneCards[i]);
        }
      }
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

    console.log(newCards);
  });

  /* <---------------------------------------- GAME OVER -------------------------------------------> */

  socket.on('gameover', () => {
    playingDeck = null;
    activeCards = null;

    playerOne = {};
    playerTwo = {};
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
