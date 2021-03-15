import React from 'react';

const Board = ({ gameData, name }) => {
 const {activeCards, discardedCards, playerOne, playerTwo } = gameData
  return (
    <>
      <h1>Board</h1>
      {name === playerOne.name ? 'Player One' : 'Player Two'}
    </>
  );
};

export default Board;
