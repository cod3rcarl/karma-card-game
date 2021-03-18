import React from 'react';
import PlayerOne from './PlayerOne';
import PlayerTwo from './PlayerTwo';

const Board = ({ gameData, name }) => {
  const { activeCards, discardedCards, playerOne, playerTwo, turn } = gameData;

  return (
    <>
      <h3>Room: {playerOne.room.toUpperCase()}</h3>
      {name === playerOne.name ? (
        <PlayerOne discardedCards={discardedCards} playerOne={playerOne} turn={turn} activeCards={activeCards} opponent={playerTwo.name} />
      ) : (
        <PlayerTwo discardedCards={discardedCards} playerTwo={playerTwo} turn={turn} activeCards={activeCards} opponent={playerOne.name} />
      )}
      <br />
      <div>
        {activeCards.map((card, i) => (
          <span style={{ display: 'inlineBlock', margin: '1rem' }} key={i}>
            <span>{card.value}</span>
          </span>
        ))}
      </div>
    </>
  );
};

export default Board;
