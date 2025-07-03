import  api  from '../api'; // este es tu axios instance configurado
import AsyncStorage from '@react-native-async-storage/async-storage';

export const entityService = {
  async getAllEntity() {
    const token = await AsyncStorage.getItem('auth-token'); // 👈 usa la string directa

    if (!token) {
        throw new Error('No se encontró token');
      }

    try {
      const response = await api.get('/entity/',{
        headers: {
          Authorization: `Bearer ${token}`, // ✅ AQUÍ
        },
      });
      return response; // 👈 Devolvemos solo el array de usuarios
    } catch (error) {
      console.error('Error al obtener entidades', error);
      throw error;
    }
  }
};