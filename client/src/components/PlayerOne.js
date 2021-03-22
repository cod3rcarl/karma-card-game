import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../socketContext';

const PlayerOne = ({ gameData }) => {
  const { playerOne, turn, activeCards } = gameData;
  const { name, playerOneCards, playerOneFaceUp, playerOneFaceDown } = playerOne;
  const [disabled, setDisabled] = useState(false);
  const [playedCard, setPlayedCard] = useState([]);

  const [message, setMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    turn === 'playerTwo' ? setDisabled(true) : setDisabled(false);
  }, [turn]);

  /* <---------------------------------------- PLAY CARD LOGIC-------------------------------------------> */

  const playCard = (card) => {
    const checkFilter = playedCard.filter((item) => item.weight !== card.weight);
    if (checkFilter.length > 0) {
      setMessage('illegal move');
    } else {
      setPlayedCard([...playedCard, card]);
    }
  };

  /* <------------------------------------FUNCTIONS FOR SUBMIT-------------------------------------------> */
  const illegalMove = (warning) => {
    setMessage(warning);
    setPlayedCard([]);
  };

  const emitEvent = (card) => {
    if (playerOneCards.length > 0) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData });
    }
    if (playerOneCards.length === 0 && playerOneFaceUp.length > 0) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData });
    }
    if (playerOneFaceUp.length === 0 && playerOneFaceDown.length !== card.length) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData });
    } else if (playerOneFaceDown.length === card.length) {
      socket.emit('playerOneWins', { message: `${name} WINS`, gameData });
    }
  };

  const emitEventWith10 = (card) => {
    if (playerOneCards.length > 0) {
      setMessage('');
      socket.emit('playerOneMoveWith10', { card, playerOneCards, playerOne, gameData });
    }
    if (playerOneCards.length === 0 && playerOneFaceUp.length > 0) {
      setMessage('');
      socket.emit('playerOneFaceUpMoveWith10', { card, playerOne, playerOneFaceUp, gameData });
    }
    if (playerOneFaceUp.length === 0 && playerOneFaceDown.length !== card.length) {
      setMessage('');
      socket.emit('playerOneFaceDownMoveWith10', { card, playerOne, playerOneFaceDown, gameData });
    } else if (playerOneFaceDown.length === card.length) {
      socket.emit('playerOneWins', { message: `${name} WINS`, gameData });
    }

    setPlayedCard([]);
  };

  const pickupCards = (cards) => {
    gameData.pickUp = true;
    emitEvent(cards);
  };

  /* <------------------------------------SUBMIT CARDS-------------------------------------------> */

  const submitCards = (card) => {
    if (card.length === 0) {
      illegalMove('Illegal move! You must play a card or pickup the pile');
      return;
    }
    if (activeCards.length > 0) {
      if (card && card[0].type === 'normal') {
        if (activeCards[activeCards.length - 1].weight === 3) {
          illegalMove('Illegal move! Play a 3 or pickup cards');
          return;
        }
        if (activeCards[activeCards.length - 1].weight === 7 && card[0].weight > 7) {
          illegalMove('Illegal move! Card must be lower than a 7');
          return;
        }
        if (activeCards[activeCards.length - 1].weight > card[0].weight && activeCards[activeCards.length - 1].weight !== 7) {
          illegalMove('Illegal move! Card must be higher than played card');
          return;
        }
        emitEvent(card);
      }
      if (card && card[0].type === 'lower') {
        if (activeCards[activeCards.length - 1].weight === 3) {
          illegalMove('Illegal move! Play a 3 or pickup cards');
          return;
        }
        if (activeCards[activeCards.length - 1].weight > card[0].weight) {
          illegalMove('Illegal move! Card must be higher than played card');
          return;
        }
        emitEvent(card);
      }
      if (card && card[0].weight === 2) {
        if (activeCards[activeCards.length - 1].weight === 3) {
          illegalMove('Illegal move! Play a 3 or pickup cards');
          return;
        }
        emitEvent(card);
      }
      if (card && card[0].weight === 10) {
        emitEventWith10(card);
      }

      if (card && card[0].weight === 3) {
        emitEvent(card);
      }
    } else if (card.length > 0 && activeCards.length === 0 && card[0].weight === 10) {
      emitEventWith10(card);
    } else if (activeCards.length === 0) {
      emitEvent(card);
    }
  };
  return (
    <div>
      <p> Face Up Cards</p>
      <div style={{ border: '1px solid white', padding: '0.7rem' }}>
        {' '}
        {playerOne.playerOneFaceUp.map((card, i) => (
          <span key={i} style={{ display: 'inlineBlock', margin: '0.1rem' }}>
            <input
              style={{
                padding: '1.8rem 1.2rem',
                fontSize: '1rem',
                color: 'white',
                backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
              }}
              type='button'
              value={`${card.value}`}
              id='player-one-one'
              disabled
            />
          </span>
        ))}
      </div>

      {message && <h5 data-testid='message'>{message}</h5>}
      <p>{`${name}'s Cards`}</p>
      <div>
        {playedCard.map((card, i) => (
          <span key={i} onClick={() => setPlayedCard([])} style={{ display: 'inlineBlock' }}>
            <input
              style={{
                margin: '1rem 0.1rem',
                padding: '1rem 0.5rem',
                fontSize: '0.5rem',
                color: 'white',
                backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
              }}
              type='button'
              value={`${card.value}`}
              disabled={disabled}
            />
          </span>
        ))}
        <div>
          {' '}
          {playerOneCards.length > 0
            ? playerOneCards.map(
                (card, i) =>
                  playedCard.filter((item) => item.value === card.value).length === 0 && (
                    <span key={i} style={{ display: 'inlineBlock', margin: '0.1rem' }}>
                      <input
                        style={{
                          padding: '1.8rem 1.2rem',
                          fontSize: '1rem',
                          color: 'white',

                          backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
                        }}
                        type='button'
                        value={`${card.value}`}
                        id='player-one-one'
                        onClick={() => playCard(card)}
                        disabled={disabled}
                      />
                    </span>
                  )
              )
            : playerOneFaceUp.map(
                (card, i) =>
                  playedCard.filter((item) => item.value === card.value).length === 0 && (
                    <span key={i} style={{ display: 'inlineBlock', margin: '0.1rem' }}>
                      <input
                        style={{
                          padding: '1.8rem 1.2rem',
                          fontSize: '1rem',
                          color: 'white',
                          backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
                        }}
                        type='button'
                        value={`${card.value}`}
                        id='player-one-one'
                        onClick={() => playCard(card)}
                        disabled={disabled}
                      />
                    </span>
                  )
              )}
          {playerOne.playerOneFaceUp.length === 0 &&
            playerOneFaceDown.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '0.1rem' }}>
                    <input
                      style={{
                        padding: '1.8rem 1.2rem',
                        fontSize: '1rem',
                        color: 'white',
                        backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
                      }}
                      type='button'
                      value={`${card.value}`}
                      id='player-one-one'
                      onClick={() => playCard(card)}
                      disabled={disabled}
                    />
                  </span>
                )
            )}
        </div>

        <div>
          {' '}
          <button style={{ margin: '1rem 0.3rem', width: '8rem', padding: '1rem' }} onClick={() => submitCards(playedCard)} disabled={activeCards === 0 || turn === 'playerTwo'}>
            Play Card(s)
          </button>
          <button style={{ margin: '1rem 0.3rem', width: '8rem', padding: '1rem' }} onClick={() => pickupCards(activeCards)} disabled={activeCards === 0 || turn === 'playerTwo'}>
            Pickup Card(s)
          </button>
        </div>
        <div>
          <p>Last 5 Cards</p>
          {activeCards.length <= 5
            ? activeCards.map((card, i) => {
                return (
                  <span style={{ display: 'inlineBlock', margin: '0.1rem' }} key={i}>
                    <input
                      style={{
                        padding: '1rem 0.5rem',
                        fontSize: '0.5rem',
                        color: 'white',
                        backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
                      }}
                      type='button'
                      value={`${card.value}`}
                      disabled
                    />
                  </span>
                );
              })
            : activeCards.slice(activeCards.length - 5, activeCards.length).map((card, i) => {
                return (
                  <span style={{ display: 'inlineBlock', margin: '0.1rem' }} key={i}>
                    <input
                      style={{
                        padding: '1rem 0.5rem',
                        fontSize: '0.5rem',
                        color: 'white',
                        backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
                      }}
                      type='button'
                      value={`${card.value}`}
                      disabled
                    />
                  </span>
                );
              })}
        </div>
        <p> Face Down</p>
        {playerOne.playerOneFaceUp.length === 0
          ? playerOne.playerOneFaceDown.map((card, i) => (
              <span key={i} style={{ display: 'inlineBlock', margin: '0.1rem', visibility: 'hidden' }}>
                <input
                  style={{
                    padding: '1.8rem 1.2rem',
                    fontSize: '1rem',
                    color: 'white',
                    backgroundColor: ` ${card.value.endsWith('♥') || card.value.endsWith('♦') ? 'maroon' : 'black'}`,
                  }}
                  type='button'
                  value={`${card.value}`}
                  id='player-One-One'
                  disabled
                />
              </span>
            ))
          : playerOne.playerOneFaceDown.map((card, i) => (
              <span key={i} style={{ display: 'inlineBlock', margin: '0.1rem', visibility: 'visible' }}>
                <input
                  style={{
                    padding: '1.8rem 1.2rem',
                    fontSize: '1rem',
                    color: 'grey',
                    backgroundColor: 'grey',
                  }}
                  type='button'
                  value={`${card.value}`}
                  id='player-One-One'
                  disabled
                />
              </span>
            ))}
      </div>
    </div>
  );
};

export default PlayerOne;
