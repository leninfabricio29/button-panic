// location-utils.ts (opcional)
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const getCurrentLocation = async (): Promise<string[] | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'La app necesita acceso a la ubicación.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      timeout: 30000,
    });

    const { latitude, longitude } = location.coords;
    return [longitude.toString(), latitude.toString()];
  } catch (error) {
    console.error('❌ Error al obtener ubicación:', error);
    Alert.alert(
      'Error de ubicación',
      'No se pudo obtener tu ubicación. Intenta nuevamente.'
    );
    return null;
  }
};
