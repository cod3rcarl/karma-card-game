import React, { useState, useContext, useEffect } from 'react';
import Board from '../components/Board';
import { SocketContext } from '../socketContext';
import { shuffleDeck } from '../utils/deck';

import '../App.css';

function HomePage() {
  const socket = useContext(SocketContext);
  let id;

  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [connection, setConnection] = useState(false);
  const [details, setDetails] = useState(false);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deck, setDeck] = useState(shuffleDeck());

  useEffect(() => {
    socket.on('leaveMessage', handleLeaveData);
    socket.on('enterMessage', handleGameData);
    socket.on('error', handleError);
    socket.on('setupBoard', setupBoard);
  }, [data]);

  const reset = () => {
    setRoom('');
    setData(null);
    setLoading('');
    setConnection(false);
    setDetails(false);
    setGameInProgress(false);
    setDeck(shuffleDeck());
  };

  const setupBoard = ({ gameData }) => {
    setGameInProgress(true);
    setData(gameData);
  };
  const handleError = () => {
    setError(true);
    setErrorMessage('Room is full, pick a different name');
    reset();
    setTimeout(() => {
      setError(false);
    }, 3000);
  };

  const handleGameData = ({ message, playerOne, playerTwo }) => {
    setMessage(message);
    setTimeout(() => {
      setMessage('');
    }, 3000);

    if (playerTwo.room === playerOne.room) {
      socket.emit('deal', {
        deck,
        playerOne,
        playerTwo,
      });
      setLoading('');
    } else {
      setLoading('waiting for 2nd player');
    }
  };
  const handleLeaveData = ({ message, data }) => {
    setGameInProgress(false);
    setMessage(message);
    setData(data);
    disconnect();
  };

  const disconnect = () => {
    console.log('disconnected');
    leaveRoom();
    socket.emit('gameover');
    socket.disconnect();
    reset();
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
      });
    }
  };

  const leaveRoom = () => {
    id = socket.id;
    socket.emit('leaveGameRoom', {
      data,
      id,
      name,
      room,
    });

    setGameInProgress(false);
    setDetails(false);
  };

  return (
    <div className='App'>
      {message && <h5 data-testid='message'>{message}</h5>}
      {error && <h5 data-testid='error-message'>{errorMessage}</h5>}
      <header className='App-header'>
        <h1>POWER</h1>
        <h3 data-testid='player-name'>Welcome {name}</h3>
        {!connection && !error && (
          <button data-testid='connect' onClick={connect}>
            connect
          </button>
        )}
        {connection && !error && (
          <button data-testid='disconnect' onClick={disconnect}>
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
      </header>
    </div>
  );
}

export default HomePage;
