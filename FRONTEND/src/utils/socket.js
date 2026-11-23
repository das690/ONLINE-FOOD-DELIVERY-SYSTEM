import { io } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'https://online-food-delivery-system-i0ik.onrender.com';
// Sockets connect to root server, not the /api route
const SOCKET_URL = rawSocketUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

let socket = null;

/**
 * Get or create a singleton Socket.io connection.
 * Prevents multiple connections across components.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket.io connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
    });
  }

  return socket;
};

/**
 * Disconnect and cleanup the socket connection.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;

