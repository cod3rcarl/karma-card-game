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
function checkIfRightRoom(arr, newRoom) {
  return arr.some(function(e) {
    return e.room === newRoom;
  });
}
let playingDeck;
let playerOneCards;
let playerOneFaceUp;
let playerOneFaceDown;
let playerTwoCards;
let playerTwoFaceUp;
let playerTwoFaceDown;
let activeCards;

let playerOne = {};
let playerTwo = {};

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  /* <---------------------------------------- ENTER GAME ROOM -------------------------------------------> */

  socket.on('gameRoom', ({ name, room, id }) => {
    const user = userJoin({ name, room, id, isDuplicate, error });

    socket.join(room);
    user.isDuplicate.length === 0 ? (playerOne = { ...playerOne, name, room, id, isDuplicate: user.isDuplicate, error }) : (playerTwo = { ...playerTwo, name, room, id, isDuplicate: user.isDuplicate, error });

    user.isDuplicate.length >= 2 ? io.to(id).emit('error', { error }) : io.to(room).emit('enterMessage', { message: `${name} has joined`, users, playerOne, playerTwo });

    user.isDuplicate.length < 2 && console.log(`${user.name} has joined room ${user.room}`);
    user.isDuplicate.length < 2 && console.log(`${user.isDuplicate.length + 1} user(s) in room ${user.room}`);
  });

  /* <---------------------------------------- DEAL CARDS -------------------------------------------> */

  socket.on('deal', ({ deck, playerOne, playerTwo }) => {
    playingDeck = deck;
    // playerOneCards = playingDeck.splice(playingDeck.length - 5, 5);
    // playerTwoCards = playingDeck.splice(playingDeck.length - 5, 5);
    // playerOneFaceUp = playingDeck.splice(playingDeck.length - 5, 5);
    // playerOneFaceDown = playingDeck.splice(playingDeck.length - 5, 5);
    // playerTwoFaceUp = playingDeck.splice(playingDeck.length - 5, 5);
    // playerTwoFaceDown = playingDeck.splice(playingDeck.length - 5, 5);
    activeCards = playingDeck;

    playerOne = { ...playerOne, playerOneCards: playingDeck.splice(playingDeck.length - 5, 5), playerOneFaceUp: playingDeck.splice(playingDeck.length - 5, 5), playerOneFaceDown: playingDeck.splice(playingDeck.length - 5, 5) };
    playerTwo = { ...playerTwo, playerTwoCards: playingDeck.splice(playingDeck.length - 5, 5), playerTwoFaceUp: playingDeck.splice(playingDeck.length - 5, 5), playerTwoFaceDown: playingDeck.splice(playingDeck.length - 5, 5) };
    console.log(playerOne.room);
    const gameData = {
      uuid: uuidv4(),
      playerOne,
      playerTwo,
      discardedCards: [],
      activeCards,
    };
    io.to(playerOne.room).emit('setupBoard', { gameData });
  });

  /* <---------------------------------------- LEAVE GAME ROOM -------------------------------------------> */

  socket.on('leaveGameRoom', ({ name, room, id }) => {
    socket.leave(room);
    io.to(room).emit('leaveMessage', { message: `${name} has left`, users });
    userLeave(room, id);
    console.log(`${name} has left room ${room}`);
    console.log(`${users.length} user(s) in room ${room}`);
  });

  /* <---------------------------------------- DISCONNECT -------------------------------------------------> */

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Api listening on port ${PORT}!`);
});

module.exports = app;
