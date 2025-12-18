import { io } from 'socket.io-client';

// In production, undefined URL means "connect to the same host that served this page"
// This works perfectly since your backend serves the frontend.
const URL = import.meta.env.PROD ? undefined : (import.meta.env.VITE_SERVER_URL || 'http://localhost:5001');

export const socket = io(URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'] // Ensure robust transport options
});
