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
  ,
  async sendPetitionNeighborhood(neighborhoodId: string, userId: string) {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No se encontró token');
      }

      // Using POST with a proper request body
      const response = await api.post('/neighborhood/petition', {
        neighborhoodId,
        userId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error al enviar petición:', error);
      throw error;
    }
  }
  , //getNeighborhoodUsers
  async getNeighborhoodUsers(neighborhoodId: string) {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No se encontró token');
      }

      const response = await api.get(`/neighborhood/${neighborhoodId}/users`, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      console.log(response.data)

      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios del barrio:', error);
      throw error;
    }
  }
  , //getNeighborhoodDetails
  async getNeighborhoodDetails(neighborhoodId: string) {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No se encontró token');
      }

      const response = await api.get(`/neighborhood/${neighborhoodId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener barrio:', error);
      throw error;
    }
  },

  async exitNeighborhood(neighborhoodId: string, userId: string) {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      if (!token) {
        throw new Error('No se encontró token');
      }

       const response = await api.delete(`/neighborhood/${neighborhoodId}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
            return response.data;

    } catch (error) {
      console.log("Error, error presentado",error)
    }
  }
};
