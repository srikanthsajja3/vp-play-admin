import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://stgeorge.childinfo.in/php',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
