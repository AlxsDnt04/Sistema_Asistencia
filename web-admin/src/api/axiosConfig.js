import axios from 'axios';

// Configura la dirección del backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// inyecta el token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const token = localStorage.getItem('token');
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (status === 401 && token && !isLoginRequest && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('sessionExpired', 'true');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;