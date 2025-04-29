import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../config/env'; // ⚡ Asegúrate que tienes la baseURL aquí, o cambia manualmente

declare global {
  namespace NodeJS {
    interface Global {
      auth?: {
        logout: () => void;
      };
    }
  }
}

const api = axios.create({
  baseURL: Config.BASE_URL, // ✅ Tu URL principal
  timeout: 10000, // Opcional: tiempo máximo de espera
});

// Interceptor para agregar token automáticamente a cada request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expirado o inválido 🚫');

      // Limpia el almacenamiento local
      AsyncStorage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_DATA);

      // Opcional: también podrías redirigir al login aquí
     
    }

    return Promise.reject(error); // Sigue lanzando el error para que cada pantalla lo maneje
  }
);

export default api;
