// import { io } from 'socket.io-client';
import socketIOClient from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:3000';

// export const socket = io(URL);
// export const socket = socketIOClient(URL);