import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../socketContext';

const PlayerOne = ({ playerOne, opponent, turn }) => {
  const { name, playerOneCards, playerOneFaceUp, playerOneFaceDown } = playerOne;
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
    turn === 'playerTwo' ? setDisabled(true) : setDisabled(false);
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
    socket.emit('playerOneMove', { card, playerOneCards });
    setPlayedCard([]);
  };

  return (
    <div>
      {message && <h5 data-testid='message'>{message}</h5>}
      <h3>
        {name} vs {opponent}
      </h3>
      <div>
        {playedCard.map((card) => (
          <span>{`${card.value}`}</span>
        ))}
        {playerOneCards.map(
          (card, i) =>
            playedCard.filter((item) => item.value === card.value).length === 0 && (
              <span key={i} style={{ display: 'inlineBlock', margin: '1rem' }}>
                <input type='button' value={`${card.value}`} id='player-one-one' onClick={(e) => playCard(e, card)} disabled={disabled} />
              </span>
            )
        )}
        <button onClick={(e) => submitCards(playedCard)}>Play Card(s)</button>
      </div>
    </div>
  );
};

export default PlayerOne;
