import { createContext } from 'react';
import socketIO from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_SOCKET_URL;
export const socket = socketIO.connect(ENDPOINT);

export const SocketContext = createContext();
