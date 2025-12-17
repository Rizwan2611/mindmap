import axios from 'axios';

// Create an axios instance with a dynamic base URL
const api = axios.create({
    // If VITE_SERVER_URL is set (Production/Separate deploy), use it.
    // Otherwise, typically use empty string to rely on Vite's proxy (Localhost) or relative paths.
    // However, since the user wants separate deployments, we prioritize the env var.
    baseURL: import.meta.env.VITE_SERVER_URL || ''
});

export default api;
