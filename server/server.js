// const { socket } = require('./socketAPI.js');
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const server = require('http').Server(app);
const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',
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
