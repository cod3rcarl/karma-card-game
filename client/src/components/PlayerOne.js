import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../socketContext';

const PlayerOne = ({ opponent, gameData }) => {
  const { playerOne, turn, activeCards } = gameData;
  const { name, playerOneCards, playerOneFaceUp, playerOneFaceDown } = playerOne;
  const [disabled, setDisabled] = useState(false);
  const [playedCard, setPlayedCard] = useState([]);
  const [currentActiveCard, setCurrentActiveCard] = useState([]);
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
      setCurrentActiveCard([...currentActiveCard, card]);
    }
  };

  /* <------------------------------------FUNCTIONS FOR SUBMIT-------------------------------------------> */
  const illegalMove = (warning) => {
    setMessage(warning);
    setPlayedCard([]);
  };

  const emitEvent = (card) => {
    if (playerOneCards.length > 0) {
      socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData, currentActiveCard });

      setPlayedCard([]);
    }
    if (playerOneCards.length === 0 && playerOne.playerOneFaceUp.length > 0) {
      socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData, currentActiveCard });

      setPlayedCard([]);
    }
    if (playerOne.playerOneFaceUp.length === 0 && playerOne.playerOneFaceDown.length > 1) {
      socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData, currentActiveCard });

      setPlayedCard([]);
    }
    if (playerOne.playerOneFaceDown.length === 1 && gameData.pickup === true) {
      socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData, currentActiveCard });

      setPlayedCard([]);
    } else if (playerOne.playerOneFaceDown.length === 1 && gameData.pickup !== true) {
      socket.emit('playerOneWins', { gameData });
    }
    setCurrentActiveCard([]);
  };

  const emitEventWith10 = (card) => {
    if (playerOneCards.length > 0) {
      socket.emit('playerOneMoveWith10', { card, playerOneCards, playerOne, gameData, currentActiveCard });
    }
    if (playerOneCards.length === 0 && playerOne.playerOneFaceUp.length > 0) {
      socket.emit('playerOneFaceUpMoveWith10', { card, playerOne, playerOneFaceUp, gameData, currentActiveCard });
    }
    if (playerOne.playerOneFaceUp.length === 0 && playerOne.playerOneFaceDown.length > 1) {
      socket.emit('playerOneFaceDownMoveWith10', { card, playerOne, playerOneFaceDown, gameData, currentActiveCard });
    } else if (playerOne.playerOneFaceDown.length === 1) {
      socket.emit('playerOneWins', { gameData });
      //JUST SET THE WINNER HERE
    }

    setPlayedCard([]);
  };

  const pickupCards = (cards) => {
    gameData.pickUp = true;
    emitEvent(cards);
  };

  /* <------------------------------------SUBMIT CARDS-------------------------------------------> */

  const submitCards = (card) => {
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
    } else if (activeCards.length === 0) {
      emitEvent(card);
    }
  };

  return (
    <div>
      FaceDown:
      {playerOne.playerOneFaceDown.map((card, i) => (
        <span key={i}>{card.value}</span>
      ))}
      <br />
      FaceUp:
      {playerOne.playerOneFaceUp.map((card, i) => (
        <span key={i}>{card.value}</span>
      ))}
      {message && <h5 data-testid='message'>{message}</h5>}
      <h3>
        {name} vs {opponent}
      </h3>
      <div>
        {playedCard.map((card, i) => (
          <span onClick={() => setPlayedCard([])} key={i}>{`${card.value}`}</span>
        ))}
        <br />
        {playerOneCards.length > 0
          ? playerOneCards.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                    <input type='button' value={`${card.value}`} id='player-one-one' onClick={() => playCard(card)} disabled={disabled} />
                  </span>
                )
            )
          : playerOneFaceUp.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                    <input type='button' value={`${card.value}`} id='player-one-one' onClick={() => playCard(card)} disabled={disabled} />
                  </span>
                )
            )}
        {playerOne.playerOneFaceUp.length === 0 &&
          playerOneFaceDown.map(
            (card, i) =>
              playedCard.filter((item) => item.value === card.value).length === 0 && (
                <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                  <input type='button' value={`${card.value}`} id='player-one-one' onClick={() => playCard(card)} disabled={disabled} />
                </span>
              )
          )}
        <div>
          {' '}
          <button style={{ margin: '1rem' }} onClick={() => submitCards(playedCard)} disabled={activeCards === 0 || turn === 'playerTwo'}>
            Play Card(s)
          </button>
          <button style={{ margin: '1rem' }} onClick={() => pickupCards(activeCards)} disabled={activeCards === 0 || turn === 'playerTwo'}>
            Pickup Card(s)
          </button>
        </div>
        <div>
          {currentActiveCard.map((card, i) => {
            <span style={{ display: 'inlineBlock', margin: '1rem' }} key={i}>
              <span>{card.value}</span>
            </span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayerOne;
