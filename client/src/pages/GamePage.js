import React, { useEffect } from 'react';
import socketIOCLIENT from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_SOCKET_URL;

const GamePage = ({ history }) => {
  const socket = socketIOCLIENT(ENDPOINT, { transport: ['websocket'] });

  const leaveRoom = () => {
    console.log('user left');
    history.push('/');
  };
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>POWER ROOM</h1> <button onClick={leaveRoom}>Leave Room</button>
      </header>
    </div>
  );
};

export default GamePage;
