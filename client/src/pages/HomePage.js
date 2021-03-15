import React, { useState, useContext, useEffect } from 'react';
import Board from '../components/Board';
import { SocketContext } from '../socketContext';
import { shuffleDeck } from '../utils/deck';

import '../App.css';

function HomePage() {
  const socket = useContext(SocketContext);
  let id;
  const [room, setRoom] = useState(null);
  const [name, setName] = useState('Player');
  const [connection, setConnection] = useState(false);
  const [details, setDetails] = useState(false);
  const [game, setGame] = useState(false);
  const [data, setData] = useState({});
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deck, setDeck] = useState(shuffleDeck());

  useEffect(() => {
    socket.on('leaveMessage', handleLeaveData);
    socket.on('enterMessage', handleGameData);
    socket.on('error', handleError);
    socket.on('setupBoard', setupBoard);
  }, []);

  const setupBoard = ({ gameData }) => {
    console.log(gameData);
    setData(gameData);
  };
  const handleError = () => {
    setError(true);
    setErrorMessage('Room is full, pick a different name');
    setConnection(false);
    setGame(false);
    setTimeout(() => {
      setError(false);
    }, 3000);
  };

  const handleGameData = ({ message, users: players, playerOne, playerTwo }) => {
    setUsers(players);
    setMessage(message);
    setTimeout(() => {
      setMessage('');
      socket.emit('deal', {
        deck,
        playerOne,
        playerTwo,
      });
      setGame(true);
    }, 3000);
  };
  const handleLeaveData = () => {
    setUsers([]);
    setMessage('');
  };

  const disconnect = () => {
    console.log('disconnected');
    name !== 'Player' && leaveRoom();
    socket.disconnect();
    setName('Player');
    setRoom('');
    setConnection(false);
    setGame(false);
    setDetails(false);
  };

  const connect = async () => {
    await socket.connect();
    setConnection(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDetails(true);
    setMessage('');

    id = socket.id;
    setConnection(true);
    socket.emit('gameRoom', {
      id,
      name,
      room,
    });
  };

  const leaveRoom = () => {
    id = socket.id;
    socket.emit('leaveGameRoom', {
      id,
      name,
      room,
    });
    setGame(false);
  };
  console.log(data);
  return (
    <div className='App'>
      {message && game && !error && message}
      {error && errorMessage}
      <header className='App-header'>
        <h1>POWER</h1>
        <h3>Welcome {name}</h3>
        {!connection && !error && <button onClick={connect}>connect</button>}
        {connection && !error && <button onClick={disconnect}>Disconnect</button>}
        {connection && !details && (
          <form onSubmit={handleSubmit}>
            <input type='text' name='name' id='name' onChange={(e) => setName(e.target.value)} />
            <input type='text' name='room' id='room' onChange={(e) => setRoom(e.target.value)} />
            <button type='submit'>Enter {room}</button>
          </form>
        )}

        {game && <Board name={name} gameData={data} />}
      </header>
    </div>
  );
}

export default HomePage;
