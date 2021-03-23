import { createContext } from 'react';
import socketIO from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000/';
export const socket = socketIO(ENDPOINT, { reconnection: false, autoConnect: false });

export const SocketContext = createContext();
