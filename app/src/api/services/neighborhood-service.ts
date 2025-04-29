import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const neighborhoodService = {
  async getAllNeighborhoods() {
    try {
      const token = await AsyncStorage.getItem('auth-token'); // 👈 usa la string directa
      if (!token) {
        throw new Error('No se encontró token');
      }

      const response = await api.get('/neighborhood/all-neighborhood', {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ AQUÍ
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error al obtener barrios:', error);
      throw error;
    }
  }
};
