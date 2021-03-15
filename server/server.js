// const { socket } = require('./socketAPI.js');
const express = require('express');
const app = express();
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

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  socket.on('gameRoom', ({ name, room, id }) => {
    const user = userJoin({ name, room, id, isDuplicate, error });
    socket.join(room);

    user.isDuplicate.length >= 2 ? io.to(id).emit('error', { error }) : io.to(room).emit('enterMessage', { message: `${name} has joined`, users, user, error });
    console.log(users);
    user.isDuplicate.length < 2 && console.log(`${user.name} has joined room ${user.room}`);
    user.isDuplicate.length < 2 && console.log(`${user.isDuplicate.length + 1} user(s) in room ${user.room}`);
  });

  socket.on('leaveGameRoom', ({ name, room, id }) => {
    socket.leave(room);
    io.to(room).emit('leaveMessage', { message: `${name} has left`, users });
    userLeave(room, id);

    console.log(`${name} has left room ${room}`);
    console.log(`${users.length} user(s) in room ${room}`);
  });
  //   // console.log(`${getNumberOfUsersByRoom(user.room).length} user(s) in room ${user.room}`);
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Api listening on port ${PORT}!`);
});

module.exports = app;
