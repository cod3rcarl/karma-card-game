const { v4: uuidv4 } = require('uuid');

let gameData = {
  uuid: uuidv4(),
  playerOneData: {},
  playerTwoData: {},
  playerOneCards: [],
  playerTwoCards: [],
  discardedCards: [],
  activeCards: [],
  communityCards: 22,
};

function updateGameData(property, value) {
  console.log(`from updateData:`, { property, value });
  //if property is valid,
  if (gameData.hasOwnProperty(property)) {
    //updates gameData object with the new value
    gameData = { ...gameData, [property]: value };
  } else {
    gameData = gameData;
  }
}

function resetGameData() {
  //call model function, pass in session id -> query db for that session's data
  //if present, continue
  //if not, alert
  sessionData = {
    uuid: uuidv4(),
    playerOneCards: [],
    playerTwoCards: [],
    discardedCards: [],
    activeCards: [],
    communityCards: 22,
  };
  console.log(`reset game data!`);
}

// getter for session data - grabs the current state of the data obj
function getGameData() {
  return gameData;
}

module.exports = {
  getGameData,
  resetGameData,
  updateGameData,
};
