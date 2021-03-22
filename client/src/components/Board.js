import React from 'react';
import PlayerOne from './PlayerOne';
import PlayerTwo from './PlayerTwo';

const Board = ({ gameData, name }) => {
  const { playerOne, activeCards } = gameData;

  return (
    <>
      <h3>Room: {playerOne.room.toUpperCase()}</h3>
      <h4>{name === playerOne.name ? `P1: ${gameData.playerOne.name} vs ${gameData.playerTwo.name} :P2` : `P2: ${gameData.playerTwo.name} vs ${gameData.playerOne.name} :P1`}</h4>
      <p>{`Top of the Pile (${gameData.pile.length} left)`}</p>
      {activeCards.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ display: 'inlineBlock', margin: '0.1rem' }}>
            <input
              style={{
                padding: '1.8rem 1.2rem',
                fontSize: '1rem',
                color: 'white',
                backgroundColor: ` ${activeCards[activeCards.length - 1].value.endsWith('♥') || activeCards[activeCards.length - 1].value.endsWith('♦') ? 'maroon' : 'black'}`,
              }}
              type='button'
              value={`${activeCards[activeCards.length - 1].value}`}
              disabled
            />
          </span>
        </div>
      )}

      {name === playerOne.name ? <PlayerOne gameData={gameData} opponent={gameData.playerTwo.name} /> : <PlayerTwo gameData={gameData} opponent={gameData.playerOne.name} />}

      {/* <div>
        {pile.map((card, i) => (
          <span style={{ display: 'inlineBlock', margin: '0.1rem' }} key={i}>
            <span>{card.value}</span>
          </span>
        ))}
      </div> */}
    </>
  );
};

export default Board;
