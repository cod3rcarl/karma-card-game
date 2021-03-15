let socketIo = require('socket.io');
const { server } = require('./server');
const { userJoin, getNumberOfUsersByRoom } = require('./users');
let io = socketIo(server);

io.on('connection', (socket) => {
  const id = socket.id;
  socket.emit('id', id);
  console.log({ id });
  socket.on('gameRoom', ({ name, room }) => {
    // add user to the user list
    const user = userJoin(socket.id, name, room);

    // socket.join(user.room)
    socket.join(user.room);

    // console.log(user has joined room, updated amount of participants)
    console.log(`${user.name} has joined room ${user.room}`);
    console.log(`${users.length} users connected`);
    console.log(`${getNumberOfUsersByRoom(user.room).length} user(s) in room ${user.room}`);
  });
  socket.on('disconnect', () => {
    console.log(`A user disconnected`);
  });
});
