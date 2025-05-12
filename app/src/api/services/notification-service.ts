import api from '../api'; // ✅ Tu instancia personalizada de Axios
// notification-service.ts
export const notifyService = {
    async sendPetitioPassword(email: string) {
      try {
        
        const response = await api.post(
          `/notify/petition-reset`,
          { email }, // 👈 cuerpo de la petición
        );
  
        return response.data;
      } catch (error) {
        console.error('Error al enviar la notificación:', error);
        throw error;
      }
    },
  };
  