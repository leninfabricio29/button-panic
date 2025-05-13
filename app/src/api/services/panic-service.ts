import api from '../api'; // instancia de Axios
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fcmService = {
  saveToken: async (fcmToken: string) => {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Hacer el POST al backend con el token manualmente
      const response = await api.post(
        '/users/token', // <-- ajusta si tu ruta real es diferente
        { fcmToken },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error('Error al guardar token FCM:', error);
      throw error;
    }
  },

  sendAlarm : async (coordinates: string[]) => {
    try {
       const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await api.post(
        '/users/token', // <-- ajusta si tu ruta real es diferente
        { coordinates },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;

    } catch (error) {
      
    }
    } 
};
