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
const users = [];
const cors = require('cors');

app.use(cors());

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  socket.on('gameRoom', ({ name, room, id }) => {
    console.log(users);
    console.log(id);
    const user = { id, name, room };
    const isInRoom = users.includes(id);
    !isInRoom ? users.push(id) : null;
    isInRoom ? console.log(`${user.name} is already in room ${user.room}`) : console.log(`${user.name} has joined room ${user.room}`);

    console.log(users);
  });

  socket.on('leaveGameRoom', ({ name, room, id }) => {
    console.log('left room');
    console.log(users);
    console.log(id);
    socket.leave(room);
    const index = users.findIndex((user) => user === id);
    if (index >= 0) {
      //if not -1 (not found)
      users.splice(index, 1); //remove user from users array
    } else {
      console.log(`User not in room`);
    }

    console.log(users);
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
