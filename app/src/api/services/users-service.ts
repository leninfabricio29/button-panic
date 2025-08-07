// src/api/services/users-service.ts
import api from '../api'; // este es tu axios instance configurado
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usersService = {
  async getAllUsers() {
    try {
      const response = await api.get('/users/');
      return response.data.users.filter((user: { role: string }) => user.role === 'user'); // 👈 Solo usuarios con rol "user"
    } catch (error) {
      console.error('Error al obtener usuarios', error);
      throw error;
    }
  }
  ,
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    console.log('Usuario obtenido:', response.data); // aquí viene un solo usuario
    return response.data; // aquí viene un solo usuario
  },

  updateUser: async (id: string, data: { name?: string; email?: string; phone?: string; avatar?: string }) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      console.log('Usuario actualizado:', response.data);
      return response.data; // contiene { message, user }
    } catch (error) {
      console.error('Error al actualizar usuario', error);
      throw error;
    }
  },

  suscribeEntity: async ({ entityId, userId }: { entityId: string; userId: string }) => {
    const token = await AsyncStorage.getItem('auth-token');
    if (!token) {
      throw new Error('No se encontró token');
    }

      const response = await api.post(
        '/entity/petition',
        { entityId, userId }, // body
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ headers separados
          },
        }
      );
      console.log('✅ Usuario suscrito a entidad');
      return response;
    
  }

  ,

  unsuscribeEntity: async ({ entityId, userId }: { entityId: string; userId: string }) => {
    const token = await AsyncStorage.getItem('auth-token'); // 👈 usa la string directa
    if (!token) {
      throw new Error('No se encontró token');
    }

    try {
      const response = await api.post(
        '/entity/unsubscribe',

        { entityId, userId }, // body
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ headers separados
          },
        }
      );
      console.log('Usuario se ha desuscrito');
      return response;
    } catch (error) {
      console.log('Error al suscribir a la entidad');
      throw error;
    }
  }

};
