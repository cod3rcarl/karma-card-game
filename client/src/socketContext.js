import { createContext } from 'react';
import socketIO from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_SOCKET_URL;
export const socket = socketIO(ENDPOINT, { reconnection: false, autoConnect: false });

export const SocketContext = createContext();
