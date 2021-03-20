import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../socketContext';

const PlayerOne = ({ opponent, gameData }) => {
  const { playerOne, turn, activeCards } = gameData;
  const { name, playerOneCards, playerOneFaceUp, playerOneFaceDown } = playerOne;
  const [disabled, setDisabled] = useState(false);
  const [playedCard, setPlayedCard] = useState([]);
  const [message, setMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    turn === 'playerTwo' ? setDisabled(true) : setDisabled(false);
  }, [turn]);

  /* <---------------------------------------- ENTER GAME ROOM -------------------------------------------> */

  const playCard = (card) => {
    const checkFilter = playedCard.filter((item) => item.weight !== card.weight);
    if (checkFilter.length > 0) {
      setMessage('illegal move');
    } else {
      setPlayedCard([...playedCard, card]);
    }
  };

  const submitCards = (card) => {
    if (activeCards.length > 0) {
      if (card[0].type === 'normal') {
        if (activeCards[0].weight === 3) {
          setMessage('Play a 3 or pickup cards');
          setPlayedCard([]);
          return;
        }
        if (activeCards[0].weight === 7 && card[0].weight > 7) {
          setMessage('Card must be wild or lower or pickup cards');
          setPlayedCard([]);
          return;
        }
        if (activeCards[0].weight > card[0].weight && activeCards[0].weight !== 7) {
          setMessage('illegal move, Card must be wild or higher or pickup cards');
          setPlayedCard([]);
          return;
        }
        if (playerOneCards.length > 0) {
          socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData });
          setPlayedCard([]);
        }
        if (playerOneCards.length === 0) {
          socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData });
          setPlayedCard([]);
        }
        if (playerOne.playerOneFaceUp.length === 0) {
          socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData });
          setPlayedCard([]);
        } else if (playerOne.playerOneFaceDown.length === 0) {
          socket.emit('gameOver', { gameData });
        }
      }
      if (card[0].type === 'lower') {
        if (activeCards[0].weight === 3) {
          setMessage('Play a 3 or pickup cards');
          setPlayedCard([]);
          return;
        }
        if (activeCards[0].weight > card[0].weight) {
          setMessage('illegal move, Card must be wild or higher or pickup cards');
          setPlayedCard([]);
          return;
        }
        if (playerOneCards.length > 0) {
          socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData });
          setPlayedCard([]);
        }
        if (playerOneCards.length === 0) {
          socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData });
          setPlayedCard([]);
        }
        if (playerOne.playerOneFaceUp.length === 0) {
          socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData });
          setPlayedCard([]);
        } else if (playerOne.playerOneFaceDown.length === 0) {
          socket.emit('gameOver', { gameData });
        }
      }
      if (card[0].weight === 2) {
        if (activeCards[0].weight === 3) {
          setMessage('Play a 3 or pickup cards');
          setPlayedCard([]);
          return;
        }
        if (playerOneCards.length > 0) {
          socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData });
          setPlayedCard([]);
        }
        if (playerOneCards.length === 0) {
          socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData });
          setPlayedCard([]);
        }
        if (playerOne.playerOneFaceUp.length === 0) {
          socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData });
          setPlayedCard([]);
        } else if (playerOne.playerOneFaceDown.length === 0) {
          socket.emit('gameOver', { gameData });
        }
      }
      if (card[0].weight === 10) {
        if (playerOneCards.length > 0) {
          socket.emit('playerOneMoveWith10', { card, playerOneCards, playerOne, gameData });
          setPlayedCard([]);
        }
        if (playerOneCards.length === 0) {
          socket.emit('playerOneFaceUpMoveWith10', { card, playerOne, playerOneFaceUp, gameData });
          setPlayedCard([]);
        }
        if (playerOne.playerOneFaceUp.length === 0) {
          socket.emit('playerOneFaceDownMoveWith10', { card, playerOne, playerOneFaceDown, gameData });
          setPlayedCard([]);
        } else if (playerOne.playerOneFaceDown.length === 0) {
          socket.emit('gameOver', { gameData });
        }
      }
      if (card[0].weight === 3) {
        if (playerOneCards.length > 0) {
          socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData });
          setPlayedCard([]);
        }
        if (playerOneCards.length === 0) {
          socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData });
          setPlayedCard([]);
        }
        if (playerOne.playerOneFaceUp.length === 0) {
          socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData });
          setPlayedCard([]);
        } else if (playerOne.playerOneFaceDown.length === 0) {
          socket.emit('gameOver', { gameData });
        }
      }
    } else {
      if (playerOneCards.length > 0) {
        socket.emit('playerOneMove', { card, playerOneCards, playerOne, gameData });
        setPlayedCard([]);
      }
      if (playerOneCards.length === 0) {
        socket.emit('playerOneFaceUpMove', { card, playerOne, playerOneFaceUp, gameData });
        setPlayedCard([]);
      }
      if (playerOne.playerOneFaceUp.length === 0) {
        socket.emit('playerOneFaceDownMove', { card, playerOne, playerOneFaceDown, gameData });
        setPlayedCard([]);
      } else if (playerOne.playerOneFaceDown.length === 0) {
        socket.emit('gameOver', { gameData });
      }
    }
  };

  const pickupCards = (cards) => {
    gameData.pickUp = true;
    console.log(gameData);
    socket.emit('playerOneMove', { cards, playerOneCards, playerOne, gameData });
    setPlayedCard([]);
  };
  console.log(playedCard);
  // console.log(playedCard[0].target.defaultValue);
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

        <button style={{ margin: '1rem' }} onClick={(e) => submitCards(playedCard)} disabled={activeCards === 0 || turn === 'playerTwo'}>
          Play Card(s)
        </button>
        <button style={{ margin: '1rem' }} onClick={(e) => pickupCards(activeCards, gameData)} disabled={activeCards === 0 || turn === 'playerTwo'}>
          Pickup Card(s)
        </button>
      </div>
    </div>
  );
};

export default PlayerOne;
