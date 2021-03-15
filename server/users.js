const { updateGameData } = require('./gameData');

const users = [];
let rooms = [];
let isDuplicate;
let error = '';

const duplicates = (room) => {
  return rooms.filter((item) => item === room);
};

// add user to list, update session
function userJoin({ id, name, room }) {
  const index = users.findIndex((user) => user.id === id);

  isDuplicate = duplicates(room);
  console.log(isDuplicate);
  let user = {
    id,
    name,
    room,
    isDuplicate,
    error,
  };
  index >= 0 ? console.log('participant already in room') : users.push(user);
  if (isDuplicate.length <= 1) {
    rooms.push(room);
  } else if (isDuplicate.length === 2) {
    user = { ...user, error: 'Room is full' };
    const removeIndex = users.findIndex((removemy) => removemy.id === id);
    users.splice(removeIndex, 1);
  }

  isDuplicate.length === 2;

  // users.length === 0 && updateGameData('playerOneData', user);
  // users.length === 1 && updateGameData('playerTwoData', user);
  console.log(user);
  return user;
}

// get number of users in a room
function getNumberOfUsersByRoom(room) {
  const usersArray = users.filter((user) => user.room === room);
  return usersArray;
}

//remove user from users array and session data
function userLeave(room, id) {
  //takes in socket.id
  const index = users.findIndex((user) => user.id === id); //find id of user that left

  if (index >= 0) {
    users.splice(index, 1); //remove user from users array
  } else {
    console.log(`User not in room`);
  }
  const roomIndex = rooms.findIndex((x) => x === room); //find id of user that left
  if (roomIndex >= 0) {
    rooms.splice(roomIndex, 1); //remove user from users array
  }
}

module.exports = { userJoin, users, getNumberOfUsersByRoom, userLeave, isDuplicate, error };
