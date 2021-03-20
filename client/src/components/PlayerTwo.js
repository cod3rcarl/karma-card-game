import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../socketContext';

const PlayerTwo = ({ opponent, gameData }) => {
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

  const pickupCards = (cards) => {
    gameData.pickUp = true;
    socket.emit('playerTwoMove', { cards, playerTwoCards, playerTwo, gameData });
    setPlayedCard([]);
  };

  /* <------------------------------------FUNCTIONS FOR SUBMIT-------------------------------------------> */
  const illegalMove = (warning) => {
    setMessage(warning);
    setPlayedCard([]);
    return;
  };

  const emitEvent = (card) => {
    if (playerTwoCards.length > 0) {
      socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
      setPlayedCard([]);
    }
    if (playerTwoCards.length === 0) {
      socket.emit('playerTwoFaceUpMove', { card, playerTwo, playerTwoFaceUp, gameData });
      setPlayedCard([]);
    }
    if (playerTwo.playerTwoFaceUp.length === 0) {
      socket.emit('playerTwoFaceDownMove', { card, playerTwo, playerTwoFaceDown, gameData });
      setPlayedCard([]);
    } else if (playerTwo.playerTwoFaceDown.length === 0) {
      socket.emit('gameOver', { gameData });
    }
  };

  const emitEventWith10 = (card) => {
    if (playerTwoCards.length > 0) {
      socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
    }
    if (playerTwoCards.length === 0) {
      socket.emit('playerTwoFaceUpMoveWith10', { card, playerTwo, playerTwoFaceUp, gameData });
    }
    if (playerTwo.playerTwoFaceUp.length === 0) {
      socket.emit('playerTwoFaceDownMoveWith10', { card, playerTwo, playerTwoFaceDown, gameData });
    } else if (playerTwo.playerTwoFaceDown.length === 0) {
      socket.emit('gameOver', { gameData });
    }
    setPlayedCard([]);
  };

  /* <------------------------------------SUBMIT CARDS-------------------------------------------> */

  const submitCards = (card) => {
    if (activeCards.length > 0) {
      if (card[0].type === 'normal') {
        if (activeCards[0].weight === 3) {
          illegalMove('Illegal move! Play a 3 or pickup cards');
        }
        if (activeCards[0].weight === 7 && card[0].weight > 7) {
          illegalMove('Illegal move! Card must be lower than a 7');
        }
        if (activeCards[0].weight > card[0].weight && activeCards[0].weight !== 7) {
          illegalMove('Illegal move! Card must be higher than played card');
        }
        emitEvent(card);
      }
      if (card[0].type === 'lower') {
        if (activeCards[0].weight === 3) {
          illegalMove('Illegal move! Play a 3 or pickup cards');
        }
        if (activeCards[0].weight > card[0].weight) {
          illegalMove('Illegal move! Card must be higher than played card');
        }
        emitEvent(card);
      }
      if (card[0].weight === 2) {
        if (activeCards[0].weight === 3) {
          illegalMove('Illegal move! Play a 3 or pickup cards');
        }
        emitEvent(card);
      }
      if (card[0].weight === 10) {
        emitEventWith10(card);
      }
    } else {
      emitEvent(card);
    }
  };

  return (
    <div>
      FaceDown:
      {playerTwo.playerTwoFaceDown.map((card, i) => (
        <span key={i}>{card.value}</span>
      ))}
      <br />
      FaceUp:
      {playerTwo.playerTwoFaceUp.map((card, i) => (
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
        {playerTwoCards.length > 0
          ? playerTwoCards.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                    <input type='button' value={`${card.value}`} id='player-Two-Two' onClick={() => playCard(card)} disabled={disabled} />
                  </span>
                )
            )
          : playerTwoFaceUp.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                    <input type='button' value={`${card.value}`} id='player-Two-Two' onClick={() => playCard(card)} disabled={disabled} />
                  </span>
                )
            )}
        {playerTwo.playerTwoFaceUp.length === 0 &&
          playerTwoFaceDown.map(
            (card, i) =>
              playedCard.filter((item) => item.value === card.value).length === 0 && (
                <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                  <input type='button' value={`${card.value}`} id='player-Two-Two' onClick={() => playCard(card)} disabled={disabled} />
                </span>
              )
          )}

        <button style={{ margin: '1rem' }} onClick={() => submitCards(playedCard)} disabled={activeCards === 0 || turn === 'playerOne'}>
          Play Card(s)
        </button>
        <button style={{ margin: '1rem' }} onClick={() => pickupCards(activeCards, gameData)} disabled={activeCards === 0 || turn === 'playerOne'}>
          Pickup Card(s)
        </button>
      </div>
    </div>
  );
};

export default PlayerTwo;
