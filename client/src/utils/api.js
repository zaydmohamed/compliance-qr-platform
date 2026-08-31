import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('compliance_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error toasts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'An unexpected error occurred';

    // If 401 Unauthorized, remove token and let AuthContext redirect
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.startsWith('/c/')) {
        localStorage.removeItem('compliance_token');
        localStorage.removeItem('compliance_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
