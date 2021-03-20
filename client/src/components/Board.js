import React from 'react';
import PlayerOne from './PlayerOne';
import PlayerTwo from './PlayerTwo';

const Board = ({ gameData, name }) => {
  const { pile, discardedCards, playerOne, playerTwo, turn, activeCards } = gameData;

  return (
    <>
      <h3>Room: {playerOne.room.toUpperCase()}</h3>
      {name === playerOne.name ? <PlayerOne gameData={gameData} opponent={gameData.playerTwo.name} /> : <PlayerTwo gameData={gameData} opponent={gameData.playerOne.name} />}
      <br />
      {activeCards.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ display: 'inlineBlock', margin: '1rem' }}> {`${activeCards[0].value}`}</span>
        </div>
      )}
      <div>
        {pile.map((card, i) => (
          <span style={{ display: 'inlineBlock', margin: '1rem' }} key={i}>
            <span>{card.value}</span>
          </span>
        ))}
      </div>
    </>
  );
};

export default Board;
