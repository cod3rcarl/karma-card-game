import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SocketContext, socket } from './socketContext';
import App from './App';

ReactDOM.render(
  <SocketContext.Provider value={socket}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </SocketContext.Provider>,

  document.getElementById('root')
);
