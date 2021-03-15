const users = [];

// add user to list, update session
function userJoin(id, name, room) {
  const user = {
    id,
    name,
    room,
  };
  const index = users.findIndex((user) => user.id === id);
  // check to see if participant is already in the room so that duplicates don't occur
  index >= 0 ? console.log('participant already in room') : users.push(user);
  return user;
}

// get number of users in a room
function getNumberOfUsersByRoom(room) {
  const usersArray = users.filter((user) => user.room === room);
  return usersArray;
}

//remove user from users array and session data
function userLeave(id) {
  //takes in socket.id
  const index = users.findIndex((user) => user.id === id); //find id of user that left

  if (index >= 0) {
    //if not -1 (not found)
    users.splice(index, 1); //remove user from users array

    return true;
  } else {
    console.log(`Everyone has left`);
    return false;
  }
}

module.exports = { userJoin, users, getNumberOfUsersByRoom, userLeave };
