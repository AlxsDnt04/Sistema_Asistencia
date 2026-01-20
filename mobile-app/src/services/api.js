import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP DE LARAGON
// Si es Android Studio: 'http://10.0.2.2:3000/api'
// Si es con Expo Go: 'http://192.168.100.10:3000/api'
const API_URL = 'http://192.168.100.10:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar el token automáticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;