import { createContext } from 'react';
import socketIO from 'socket.io-client';

const ENDPOINT = 'https://karma-card-game.herokuapp.com/';
export const socket = socketIO(ENDPOINT, { reconnection: false, autoConnect: false });

export const SocketContext = createContext();
