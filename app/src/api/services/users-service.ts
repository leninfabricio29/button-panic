// src/api/services/users-service.ts
import  api  from '../api'; // este es tu axios instance configurado

export const usersService = {
  async getAllUsers() {
    try {
      const response = await api.get('/users/');
      return response.data.users; // 👈 Devolvemos solo el array de usuarios
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
  }
  
};
