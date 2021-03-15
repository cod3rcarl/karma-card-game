import React, { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../socketContext';
import { shuffleDeck } from '../components/deck';

import '../App.css';

function HomePage() {
  const socket = useContext(SocketContext);
  let id;
  const [room, setRoom] = useState(null);
  const [name, setName] = useState('Player');
  const [connection, setConnection] = useState(false);
  const [game, setGame] = useState(false);
  const [data, setData] = useState({});
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    socket.on('leaveMessage', handleGameData);
    socket.on('enterMessage', handleGameData);
    socket.on('error', handleError);

    const deal = () => {
      socket.emit('deal', {
        shuffleDeck,
      });
    };
  }, [socket, message]);

  const handleError = ({ error }) => {
    setError(true);
    setErrorMessage('Room is full, pick a different name');
    setConnection(false);
    setGame(false);
    setTimeout(() => {
      setError(false);
    }, 3000);
  };

  const handleGameData = ({ message, users }) => {
    setUsers(users);
    setMessage(message);
    setTimeout(() => {
      setMessage('');
    }, 7000);
  };

  const disconnect = () => {
    console.log('disconnected');
    name !== 'Player' && leaveRoom();
    socket.disconnect();
    setName('Player');
    setConnection(false);
    setGame(false);
  };

  const connect = async () => {
    await socket.connect();
    setConnection(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    id = socket.id;
    console.log(id);
    setConnection(true);
    socket.emit('gameRoom', {
      id,
      name,
      room,
    });

    setGame(true);
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

  return (
    <div className='App'>
      {message && game && !error && message}
      {error && errorMessage}
      <header className='App-header'>
        <h1>POWER</h1>
        <h3>Welcome {name}</h3>
        {!connection && !error && <button onClick={connect}>connect</button>}
        {connection && !error && <button onClick={disconnect}>Disconnect</button>}
        {!game && connection && (
          <form onSubmit={handleSubmit}>
            <input type='text' name='name' id='name' onChange={(e) => setName(e.target.value)} />
            <input type='text' name='room' id='room' onChange={(e) => setRoom(e.target.value)} />
            <button type='submit'>Enter {room}</button>
          </form>
        )}
      </header>
    </div>
  );
}

export default HomePage;
