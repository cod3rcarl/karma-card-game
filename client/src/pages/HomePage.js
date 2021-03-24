import React, { useState, useContext, useEffect, useCallback } from 'react';
import Board from '../components/Board';
import { SocketContext } from '../socketContext';
import { shuffleDeck } from '../utils/deck';

import '../App.css';

function HomePage() {
  const socket = useContext(SocketContext);
  let id;

  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [rules, setRules] = useState(false);
  const [newGame, setNewGame] = useState(false);
  const [title, setTitle] = useState(true);
  const [connection, setConnection] = useState(false);
  const [details, setDetails] = useState(false);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [winner, setWinner] = useState(null);
  const [restart, setRestart] = useState(false);

  const toggleTitle = () => {
    setTitle(!title);
  };

  const newGameNow = () => {
    setWinner(null);
    setMessage('');
    socket.emit('newGame', { room });
  };
  const reset = () => {
    setMessage('');

    socket.emit('deal', {
      deck: shuffleDeck(),
      playerOne: data.playerOne,
      playerTwo: data.playerTwo,
    });
  };
  const suggestNewGame = () => {
    setWinner(null);
    setNewGame(true);
  };

  const setupBoard = ({ gameData }) => {
    setGameInProgress(true);
    setData(gameData);
  };

  const playerOneWins = (gameData) => {
    setData((data) => {
      return data;
    });
    setData(gameData);
    setWinner(`${gameData.playerOne.name} Wins`);
    setMessage(`${gameData.playerOne.name} Wins`);
  };
  const playerTwoWins = (gameData) => {
    setData((data) => {
      return data;
    });
    setData(gameData);
    setWinner(`${gameData.playerTwo.name} Wins`);
    setMessage(`${gameData.playerTwo.name} Wins`);
  };

  const nextTurn = ({ gameData, message }) => {
    setData((data) => {
      return data;
    });
    setData(gameData);
    setMessage(message);
  };
  const handleError = () => {
    setError(true);
    setErrorMessage('Room is full, pick a different name');
    setTimeout(() => {
      setError(false);
    }, 3000);
  };

  const handleGameData = useCallback(
    ({ message, playerOne, playerTwo }) => {
      setMessage(message);
      setTimeout(() => {
        setMessage('');
      }, 3000);

      if (playerTwo.room === playerOne.room) {
        socket.emit('deal', {
          deck: shuffleDeck(),
          playerOne,
          playerTwo,
        });
        setLoading('');
      } else {
        setLoading(`Waiting for 2nd player to join room: ${playerOne.room}`);
      }
    },
    [socket]
  );

  const disconnect = (id) => {
    socket.emit('leaveGameRoom', {
      id,
      name,
      room,
      data,
    });

    setTimeout(() => {
      setData(null);
      socket.close();
      window.location.reload();
    }, 100);
  };
  const handleLeaveData = ({ message }) => {
    console.log('disconnected');
    setMessage(message);
    setName('');
    setData(null);
    setRestart(true);
  };

  const connect = async () => {
    await socket.connect();
    setConnection(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!room) {
      setMessage('Please enter a room name');
    } else {
      setMessage('');
      id = socket.id;
      setDetails(true);
      setConnection(true);
      socket.emit('gameRoom', {
        id,
        name,
        room,
        connection,
      });
    }
  };

  const showRules = () => {
    setRules(!rules);
  };

  useEffect(() => {
    socket.on('leaveMessage', handleLeaveData);
    socket.on('enterMessage', handleGameData);
    socket.on('error', handleError);
    socket.on('setupBoard', setupBoard);
    socket.on('nextTurn', nextTurn);
    socket.on('playerOneWins', playerOneWins);
    socket.on('playerTwoWins', playerTwoWins);
    socket.on('suggestNewGame', suggestNewGame);

    return function cleanUp() {
      setNewGame(false);
      setRestart(false);
    };
  }, [data, handleGameData, socket]);

  return (
    <div className='App'>
      {message && <h5 data-testid='message'>{message}</h5>}
      {error && <h5 data-testid='error-message'>{errorMessage}</h5>}
      <header className='App-header'>
        {!restart ? (
          <div>
            {' '}
            <h1>{!winner ? (title ? 'Karma' : 'Shithead') : winner}</h1>
            {!winner ? <button onClick={toggleTitle}>{title ? "I'm not easily offended!" : 'Why so rude?'}</button> : <button onClick={newGameNow}>{'New Game?'}</button>}
            {newGame && <button onClick={reset}>Click for new game</button>}
            {!gameInProgress && <h3 data-testid='player-name'>Welcome {name}</h3>}
            {!connection && !error && (
              <button data-testid='connect' onClick={connect}>
                Connect
              </button>
            )}
            {connection && !error && (
              <button data-testid='disconnect' onClick={() => disconnect(socket.id)}>
                Disconnect
              </button>
            )}
            {connection && !details && (
              <form style={{ margin: '0.5rem' }} onSubmit={handleSubmit}>
                <input data-testid='name' placeholder='Enter Name' autoComplete='off' value={name} type='text' name='name' id='name' onChange={(e) => setName(e.target.value)} />
                <input style={{ marginBottom: '0.5rem' }} data-testid='room' placeholder='Enter a Room Name' autoComplete='off' value={room} type='text' name='room' id='room' onChange={(e) => setRoom(e.target.value)} />
                <button style={{ borderRadius: '10px', padding: '0.2rem 1rem', backgroundColor: 'maroon', color: 'white' }} data-testid='enter-room' type='submit'>
                  Enter {room}
                </button>
              </form>
            )}
            <button onClick={showRules}>Rules</button>
            {rules && (
              <div style={{ padding: '0.5rem', margin: '0.5rem', textAlign: 'left', lineHeight: '20px' }}>
                <h4>The Rules</h4>
                <p style={{ lineHeight: '20px', fontSize: '1.2rem' }}>
                  {' '}
                  <strong>The aim of the game is to get rid of all your cards.</strong>
                </p>
                <ul style={{ lineHeight: '20px', fontSize: '0.8rem', padding: '0 0 0 20px' }}>
                  <h3>Main Cards</h3>{' '}
                  <li>
                    <strong>Face Down Cards </strong> - You will be dealt 5 cards face down which you cannot touch until all other cards have been discarded.
                  </li>
                  <li>
                    <strong>Face Up Cards </strong> - You will be dealt 5 cards face up which you cannot touch until the cards you are holding have been discarded.
                  </li>
                  <li>
                    <strong>Holding Cards</strong> - You will be dealt 5 cards into your hand.
                  </li>
                  <li>
                    <strong>Main Card Pile</strong> - All other cards are placed in the main card pile.
                  </li>
                  <li>You must have at least 5 cards in your holding cards while the main card pile has cards.</li>
                  <li>The next card must be the same value or higher than the last. Exceptions to this are the special cards.</li>
                  <li>You are able to play more than 1 of the same card number.</li>
                  <li>After playing a card or cards, replace them with the top card(s) in the main card pile.</li>
                  <li>If a move cannot be made, you must pick up all the cards currently in the active pile.</li>
                </ul>
                <ul style={{ lineHeight: '20px', fontSize: '0.8rem', padding: '0 0 0 20px' }}>
                  <h3>Special Cards</h3>
                  <li>
                    <strong>10 </strong> - 10's are the most powerful in the game. They can be placed on top of any other card. If a 10 is played it moves all cards currently played in the active pile to a discarded pile, these cards are now out of
                    the game. It also grants the player another turn.
                  </li>
                  <li>
                    <strong>3 </strong> - Just as powerful in a different way are the 3's. 3's can also be played on top of any card. If a 3 is played, if your opponent does not have a 3 or a 10 they must pick up the active pile.
                  </li>
                  <li>
                    <strong>2</strong> - 2's can go on top of any card that is not a 3.
                  </li>
                  <li>
                    <strong>7</strong> - 7 works like all other normal cards, the difference is, if you play a 7, your opponent can only play a card lower.
                  </li>
                  <li>
                    <strong>4 of a Kind</strong> - If 4 of the same card are at the top of the main card pile, the pile is discarded (as with the 10) and the player who played the last card receives an extra turn..
                  </li>
                </ul>{' '}
                <ul style={{ lineHeight: '20px', fontSize: '0.8rem', padding: '0 0 0 20px' }}>
                  <h3>End Game</h3>
                  <li>Once the main card pile is at 0, you cannot touch your face up cards until your holding cards is also at 0.</li>
                  <li>Once your holding cards is at 0, you cannot touch your face down cards until your face up cards is at 0.</li>
                  <li>The winner is the person who puts down all of their face down cards.</li>
                </ul>
              </div>
            )}
            {loading && <h5 data-testid='loading-message'>{loading}</h5>}
            {gameInProgress && data && <Board name={name} gameData={data} />}
          </div>
        ) : (
          <button data-testid='disconnect' onClick={() => disconnect(socket.id)}>
            Refresh
          </button>
        )}
      </header>
    </div>
  );
}

export default HomePage;
