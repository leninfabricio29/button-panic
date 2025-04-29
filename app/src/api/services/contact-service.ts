import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const contactsService = {
  async getContactsUser() {
    try {
      const token = await AsyncStorage.getItem('auth-token'); // 👈 usa la string directa
      if (!token) {
        throw new Error('No se encontró token');
      }

      const response = await api.get('/contacts/all-contacts', {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ AQUÍ
        },
      });

     // console.log('Respuesta de contactos:', response.data); // Verifica la respuesta aquí
      return response.data;
    } catch (error) {
      console.error('Error al obtener barrios:', error);
      throw error;
    }
  }
,
  async addContact ( data: any) {
    try {
      const token = await AsyncStorage.getItem('auth-token'); // 👈 usa la string directa
      if (!token) {
        throw new Error('No se encontró token');
      }

      const response = await api.post(`/contacts/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ AQUÍ
        },
      });

     // console.log('Respuesta de contactos:', response.data); // Verifica la respuesta aquí
      return response.data;
    } catch (error) {
      console.error('Error crear contacto:', error);
      throw error;
    }

  }
};
