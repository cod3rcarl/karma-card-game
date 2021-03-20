import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../socketContext';

const PlayerTwo = ({ gameData, opponent }) => {
  const { playerTwo, turn, activeCards, discardedCards } = gameData;
  const { name, playerTwoCards, playerTwoFaceUp, playerTwoFaceDown } = playerTwo;
  const [disabled, setDisabled] = useState(false);
  const [playedCard, setPlayedCard] = useState([]);
  const [message, setMessage] = useState('');

  const socket = useContext(SocketContext);

  //TODO NEXT splice played cards so that they are moved to discarded card array.  Ensure that both players get the updated discarded array.

  // TODO If there are active cards splice them onto the playerCards array

  //TODO Ned to add the logic make sure only one player can move. (playertwo cards should be disabled until message emitted). Once this logic is sound, move on

  // TODO Add a check win conditional

  // TODO Add a check to see if there are any active cards left

  //TODO Add logic so the next card can only be the same or above except on a 🈚

  //TODO Add logic so the wild cards work as intended

  useEffect(() => {
    turn === 'playerOne' ? setDisabled(true) : setDisabled(false);
  }, [turn]);

  const playCard = (e, card) => {
    const checkFilter = playedCard.filter((item) => item.weight !== card.weight);
    if (checkFilter.length > 0) {
      setMessage('illegal move');
      setDisabled(true);
    } else {
      setPlayedCard([...playedCard, card]);
    }
  };

  const submitCards = (card) => {
    if (activeCards.length > 0) {
      // if (activeCards.length > 2) {
      //   if (activeCards[0].weight === activeCards[1].weight && activeCards[3].weight === card[0].weight) {
      //     socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
      //   }
      // }
      // if (activeCards.length > 1 && card.length === 2) {
      //   if (activeCards[0].weight && activeCards[1].weight === card[0].weight) {
      //     socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
      //   }
      // }
      // if (activeCards.length === 1 && card.length === 3) {
      //   if (activeCards[0].weight === card[0].weight) {
      //     socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
      //   }
      // }
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
        } else {
          playerTwoCards.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
          playerTwoCards.length === 0 && playerTwo.playerTwoFaceUp.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceUp, playerTwo: { ...playerTwo, playerTwoFaceUp: [] }, gameData });
          playerTwoCards.length === 0 &&
            playerTwo.playerTwoFaceUp.length === 0 &&
            playerTwo.playerTwoFaceDown.length > 0 &&
            socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceDown, playerTwo: { ...playerTwo, playerTwoFaceDown: [] }, gameData });
          playerTwo.playerTwoFaceDown.length === 0 && socket.emit('gameOver', { gameData });
          setPlayedCard([]);
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
        } else {
          playerTwoCards.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
          playerTwoCards.length === 0 && playerTwo.playerTwoFaceUp.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceUp, playerTwo: { ...playerTwo, playerTwoFaceUp: [] }, gameData });
          playerTwoCards.length === 0 &&
            playerTwo.playerTwoFaceUp.length === 0 &&
            playerTwo.playerTwoFaceDown.length > 0 &&
            socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceDown, playerTwo: { ...playerTwo, playerTwoFaceDown: [] }, gameData });
          playerTwo.playerTwoFaceDown.length === 0 && socket.emit('gameOver', { gameData });
          setPlayedCard([]);
        }
      }
      if (card[0].weight === 2) {
        if (activeCards[0].weight === 3) {
          setMessage('Play a 3 or pickup cards');
          setPlayedCard([]);
          return;
        } else {
          playerTwoCards.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
          playerTwoCards.length === 0 && playerTwo.playerTwoFaceUp.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceUp, playerTwo: { ...playerTwo, playerTwoFaceUp: [] }, gameData });
          playerTwoCards.length === 0 &&
            playerTwo.playerTwoFaceUp.length === 0 &&
            playerTwo.playerTwoFaceDown.length > 0 &&
            socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceDown, playerTwo: { ...playerTwo, playerTwoFaceDown: [] }, gameData });
          playerTwo.playerTwoFaceDown.length === 0 && socket.emit('gameOver', { gameData });
          setPlayedCard([]);
        }
      }
      if (card[0].weight === 10) {
        playerTwoCards.length > 0 && socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
        playerTwoCards.length === 0 && playerTwo.playerTwoFaceUp.length > 0 && socket.emit('playerTwoMoveWith10', { card, playerTwoCards: playerTwoFaceUp, playerTwo: { ...playerTwo, playerTwoFaceUp: [] }, gameData });
        playerTwoCards.length === 0 &&
          playerTwo.playerTwoFaceUp.length === 0 &&
          playerTwo.playerTwoFaceDown.length > 0 &&
          socket.emit('playerTwoMoveWith10', { card, playerTwoCards: playerTwoFaceDown, playerTwo: { ...playerTwo, playerTwoFaceDown: [] }, gameData });
        playerTwo.playerTwoFaceDown.length === 0 && socket.emit('gameOver', { gameData });
        setPlayedCard([]);
      }
      if (card[0].weight === 3) {
        playerTwoCards.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
        playerTwoCards.length === 0 && playerTwo.playerTwoFaceUp.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceUp, playerTwo: { ...playerTwo, playerTwoFaceUp: [] }, gameData });
        playerTwoCards.length === 0 &&
          playerTwo.playerTwoFaceUp.length === 0 &&
          playerTwo.playerTwoFaceDown.length > 0 &&
          socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceDown, playerTwo: { ...playerTwo, playerTwoFaceDown: [] }, gameData });
        playerTwo.playerTwoFaceDown.length === 0 && socket.emit('gameOver', { gameData });
        setPlayedCard([]);
      }
    } else {
      if (card.length === 4) {
        socket.emit('playerTwoMoveWith10', { card, playerTwoCards, playerTwo, gameData });
      }
      playerTwoCards.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards, playerTwo, gameData });
      playerTwoCards.length === 0 && playerTwo.playerTwoFaceUp.length > 0 && socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceUp, playerTwo: { ...playerTwo, playerTwoFaceUp: [] }, gameData });
      playerTwoCards.length === 0 &&
        playerTwo.playerTwoFaceUp.length === 0 &&
        playerTwo.playerTwoFaceDown.length > 0 &&
        socket.emit('playerTwoMove', { card, playerTwoCards: playerTwoFaceDown, playerTwo: { ...playerTwo, playerTwoFaceDown: [] }, gameData });
      playerTwo.playerTwoFaceDown.length === 0 && socket.emit('gameOver', { gameData });
      setPlayedCard([]);
    }
  };

  const pickupCards = (cards) => {
    gameData.pickUp = true;
    console.log(gameData);
    socket.emit('playerTwoMove', { cards, playerTwoCards, playerTwo, gameData });
    setPlayedCard([]);
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
          <span key={i}>{`${card.value}`}</span>
        ))}
        <br />
        {playerTwoCards.length > 0
          ? playerTwoCards.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                    <input type='button' value={`${card.value}`} id='player-Two-Two' onClick={(e) => playCard(e, card)} disabled={disabled} />
                  </span>
                )
            )
          : playerTwoFaceUp.map(
              (card, i) =>
                playedCard.filter((item) => item.value === card.value).length === 0 && (
                  <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                    <input type='button' value={`${card.value}`} id='player-two-Two' onClick={(e) => playCard(e, card)} disabled={disabled} />
                  </span>
                )
            )}
        {playerTwo.playerTwoFaceUp.length === 0 &&
          playerTwoFaceDown.map(
            (card, i) =>
              playedCard.filter((item) => item.value === card.value).length === 0 && (
                <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                  <input type='button' value={`${card.value}`} id='player-two-Two' onClick={(e) => playCard(e, card)} disabled={disabled} />
                </span>
              )
          )}

        <button style={{ margin: '1rem' }} onClick={(e) => submitCards(playedCard)} disabled={activeCards === 0 || turn === 'playerOne'}>
          Play Card(s)
        </button>
        <button style={{ margin: '1rem' }} onClick={(e) => pickupCards(activeCards)} disabled={activeCards === 0 || turn === 'playerOne'}>
          Pickup Card(s)
        </button>
      </div>
    </div>
  );
};
export default PlayerTwo;
