import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../socketContext';

const PlayerTwo = ({ gameData }) => {
  const { playerTwo, turn, activeCards } = gameData;
  const { name, playerTwoCards, playerTwoFaceUp, playerTwoFaceDown } = playerTwo;
  const [disabled, setDisabled] = useState(false);
  const [playedCard, setPlayedCard] = useState([]);
  const [message, setMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    turn === 'playerOne' ? setDisabled(true) : setDisabled(false);
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
    if (playerTwoCards.length > 0) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
    }
    if (playerTwoCards.length === 0 && playerTwoFaceUp.length > 0) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerTwoFaceUpMove', { card, playerTwo, playerTwoFaceUp, gameData });
    }
    if (playerTwoFaceUp.length === 0 && playerTwoFaceDown.length !== card.length) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerTwoFaceDownMove', { card, playerTwo, playerTwoFaceDown, gameData });
    }
    if (playerTwoFaceUp.length === 0 && gameData.pickUp === true) {
      setMessage('');
      setPlayedCard([]);
      socket.emit('playerTwoFaceDownMove', { card, playerTwo, playerTwoFaceDown, gameData });
    } else if (playerTwoFaceDown.length === card.length) {
      socket.emit('playerTwoFaceDownMove', { card, playerTwo, playerTwoFaceDown, gameData });
    }
  };

  const emitEventWith10 = (card) => {
    if (playerTwoCards.length > 0) {
      setMessage('');
      socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
    }
    if (playerTwoCards.length === 0 && playerTwoFaceUp.length > 0) {
      setMessage('');
      socket.emit('playerTwoFaceUpMoveWith10', { card, playerTwo, playerTwoFaceUp, gameData });
    }
    if (playerTwoFaceUp.length === 0 && playerTwoFaceDown.length !== card.length) {
      setMessage('');
      socket.emit('playerTwoFaceDownMoveWith10', { card, playerTwo, playerTwoFaceDown, gameData });
    } else if (playerTwoFaceDown.length === card.length) {
      socket.emit('playerTwoFaceDownMoveWith10', { card, playerTwo, playerTwoFaceDown, gameData });
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
          illegalMove('Illegal move! Play a 3, a 10 or pickup cards');
          return;
        }
        if (activeCards[activeCards.length - 1].weight === 7 && card[0].weight > 7) {
          illegalMove('Illegal move! Card must be lower than or equal to a 7');
          return;
        }
        if (activeCards[activeCards.length - 1].weight > card[0].weight && activeCards[activeCards.length - 1].weight !== 7) {
          illegalMove('Illegal move! Card must be higher than or equal to played card');
          return;
        }
        emitEvent(card);
      }
      if (card && card[0].type === 'lower') {
        if (activeCards[activeCards.length - 1].weight === 3) {
          illegalMove('Illegal move! Play a 3, a 10 or pickup cards');
          return;
        }
        if (activeCards[activeCards.length - 1].weight > card[0].weight) {
          illegalMove('Illegal move! Card must be higher than or equal to played card');
          return;
        }
        emitEvent(card);
      }
      if (card && card[0].weight === 2) {
        if (activeCards[activeCards.length - 1].weight === 3) {
          illegalMove('Illegal move! Play a 3, a 10 or pickup cards');
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
      <h6 style={{ margin: '0.5rem' }}> Face Up Cards</h6>
      <div style={{ border: '1px solid white', padding: '0.7rem' }}>
        {playerTwo.playerTwoFaceUp.map((card, i) => (
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
              id='player-two-two'
              disabled
            />
          </span>
        ))}
      </div>
      {message && <h5 data-testid='message'>{message}</h5>}

      <h6 style={{ margin: '1.2rem 0.5rem 0.5rem 0.5rem' }}>{`${name}'s Cards`}</h6>
      <div>
        {playedCard.map((card, i) => (
          <span key={i} onClick={() => setPlayedCard([])} style={{ display: 'inlineBlock' }}>
            <input
              style={{
                margin: '1rem 0.1rem',
                padding: '1.8rem 1.2rem',
                fontSize: '1rem',
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
          {playerTwoCards.length > 0
            ? playerTwoCards.map(
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
                        id='player-two-two'
                        onClick={() => playCard(card)}
                        disabled={disabled}
                      />
                    </span>
                  )
              )
            : playerTwoFaceUp.map(
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
                        id='player-two-two'
                        onClick={() => playCard(card)}
                        disabled={disabled}
                      />
                    </span>
                  )
              )}
          {playerTwo.playerTwoFaceUp.length === 0 &&
            playerTwoFaceDown.map(
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
                      id='player-two-two'
                      onClick={() => playCard(card)}
                      disabled={disabled}
                    />
                  </span>
                )
            )}
        </div>

        <div>
          {' '}
          <button
            style={{ backgroundColor: activeCards === 0 || turn === 'playerOne' || playerTwoFaceDown.length === 0 ? 'grey' : 'maroon', margin: '1rem 0.3rem', width: '8rem', padding: '1rem' }}
            onClick={() => submitCards(playedCard)}
            disabled={activeCards === 0 || turn === 'playerOne'}
          >
            Play Card(s)
          </button>
          <button
            style={{ backgroundColor: activeCards === 0 || turn === 'playerOne' || playerTwoFaceDown.length === 0 ? 'grey' : 'maroon', margin: '1rem 0.3rem', width: '8rem', padding: '1rem' }}
            onClick={() => pickupCards(activeCards)}
            disabled={activeCards === 0 || turn === 'playerOne'}
          >
            Pickup Card(s)
          </button>
        </div>
        <div>
          <h6 style={{ margin: '1.2rem 0.5rem 0.5rem 0.5rem' }}>Previous 5 Cards</h6>
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
        <h6 style={{ margin: '1.2rem 0.5rem 0.5rem 0.5rem' }}>Face Down</h6>
        {playerTwo.playerTwoFaceUp.length === 0
          ? playerTwo.playerTwoFaceDown.map((card, i) => (
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
                  id='player-two-two'
                  disabled
                />
              </span>
            ))
          : playerTwo.playerTwoFaceDown.map((card, i) => (
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
                  id='player-two-two'
                  disabled
                />
              </span>
            ))}
      </div>
      <div style={{ border: '1px solid white', padding: '0.7rem', marginTop: '1rem' }}>
        <h6 style={{ margin: '0.2rem 0.5rem 0.5rem 0.5rem' }}>{gameData.playerOne.name}'s Face Up Cards</h6>
        {gameData.pile > 0 &&
          gameData.playerOne.playerOneFaceUp.map((card, i) => (
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
                id='player-two-two'
                disabled
              />
            </span>
          ))}
      </div>
    </div>
  );
};

export default PlayerTwo;
