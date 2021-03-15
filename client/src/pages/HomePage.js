import React, { useState, useContext } from 'react';
import { SocketContext } from '../socketContext';

import '../App.css';

function HomePage() {
  const socket = useContext(SocketContext);
  let id;
  const [room, setRoom] = useState(null);
  const [name, setName] = useState('Player');
  const [connection, setConnection] = useState(false);
  const [game, setGame] = useState(false);

  const connect = async () => {
    await socket.connect();
    setConnection(true);
  };

  const disconnect = () => {
    console.log('disconnected');
    leaveRoom();
    socket.disconnect();
    setName('Player');
    setRoom(null);
    setConnection(false);
  };

  const handleSubmit = (e) => {
    id = socket.id;
    console.log(id);
    e.preventDefault();
    setGame(true);
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
    setRoom(null);
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>POWER</h1>
        <h3>Welcome {name}</h3>
        {!connection && (
          <>
            <input type='text' name='name' id='name' onChange={(e) => setName(e.target.value)} />
            <button onClick={connect}>Connect</button>
          </>
        )}
        {connection && <button onClick={disconnect}>Disconnect</button>}
        {!game && connection && (
          <form onSubmit={handleSubmit}>
            <input type='text' name='room' id='room' onChange={(e) => setRoom(e.target.value)} />
            <button type='submit'>Enter Game</button>
          </form>
        )}
        {game && <button onClick={leaveRoom}>Leave Room</button>}
      </header>
    </div>
  );
}

export default HomePage;
