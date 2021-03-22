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
    setWinner(`${gameData.playerOne.name} Wins`);
    setMessage(`${gameData.playerOne.name} Wins`);
  };
  const playerTwoWins = (gameData) => {
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
        setLoading('waiting for 2nd player');
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
            {!winner ? <button onClick={toggleTitle}>{title ? "I'm not easily offended!" : 'Why so rude?'}</button> : <button onClick={newGameNow}>{'new Game?'}</button>}
            {newGame && <button onClick={reset}>Click for new game</button>}
            {!gameInProgress && <h3 data-testid='player-name'>Welcome {name}</h3>}
            {!connection && !error && (
              <button data-testid='connect' onClick={connect}>
                connect
              </button>
            )}
            {connection && !error && (
              <button data-testid='disconnect' onClick={() => disconnect(socket.id)}>
                Disconnect
              </button>
            )}
            {connection && !details && (
              <form onSubmit={handleSubmit}>
                <input data-testid='name' value={name} type='text' name='name' id='name' onChange={(e) => setName(e.target.value)} />
                <input data-testid='room' value={room} type='text' name='room' id='room' onChange={(e) => setRoom(e.target.value)} />
                <button data-testid='enter-room' type='submit'>
                  Enter {room}
                </button>
              </form>
            )}
            <br />
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
