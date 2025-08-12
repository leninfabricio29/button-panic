import api from '../api'; // ✅ Tu instancia personalizada de Axios

export const authService = {
  /**
   * Iniciar sesión
   * @param data { email: string, password: string }
   * @returns token y usuario
   */
  login: (data: { email: string; password: string }) => {
    return api.post('/auth/login', data);
  },

  /**
   * Registrar nuevo usuario
   * @param data { ci: string, name: string, phone: string, email: string }
   * @returns datos del nuevo usuario
   */
  register: (data: { ci: string; name: string; phone: string; email: string; fcmToken?: string }) => {
    return api.post('/users/register', data);
  },

  updatePassword: (data: { email: string; currentPassword: string; newPassword: string }) => {
    return api.put('/auth/update-password', data);
  },

  resetPassword: (data: { email: string }) => {
    return api.post('/auth/reset-password', data);
  }
};
