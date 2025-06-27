const Config = {
    BASE_URL: 'https://backend-panic.softkilla.es/api', // 🚀 Tu URL principal para consumir APIs
    APP_NAME: 'SafeGuard',                // 🌟 Nombre de tu app para mostrar donde quieras
    STORAGE_KEYS: {                       // 📦 Claves que usamos en AsyncStorage
      AUTH_TOKEN: 'authToken',
      USER_DATA: 'userData',
      FCM_TOKEN: 'fcmToken', // opcional si usas notificaciones
    },
  };
  
  export default Config;
  