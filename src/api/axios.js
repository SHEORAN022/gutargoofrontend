import axios from 'axios';

// Base URL setup
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// ✅ Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);