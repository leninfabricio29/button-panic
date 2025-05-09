import api from '../api'; // ✅ Tu instancia personalizada de Axios
import AsyncStorage from '@react-native-async-storage/async-storage';

export const mediaService = {
    async getPackagesAvatar() {
        try {
            const token = await AsyncStorage.getItem('auth-token');
            if (!token) {
                throw new Error('No se encontró token');
            }
            
            const response = await api.get('/media/packages/list', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Filtrar los paquetes de tipo avatar y status true
            const dataResponse = response.data.filter((item: any) => item.type === 'avatar' && item.status === true);
            
            // Asegurar que se retorne el resultado para que pueda ser utilizado en el componente
            return dataResponse;
            
        } catch (error) {
            console.error('Error al obtener los paquetes de avatars', error);
            throw error;
        }
    }
}