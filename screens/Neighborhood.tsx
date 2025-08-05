import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Dimensions,
  useColorScheme,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../app/context/AuthContext';
import { neighborhoodService } from '../app/src/api/services/neighborhood-service';
import { usersService } from '@/app/src/api/services/users-service';
import { mediaService } from '@/app/src/api/services/media-service';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

export default function NeighborhoodScreen() {
  const [loading, setLoading] = useState(true);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [neighborhoodImages, setNeighborhoodImages] = useState<string[]>([]);

  const { user, setUser } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const freshUser = await usersService.getUserById(user._id);
        await AsyncStorage.setItem('user-data', JSON.stringify(freshUser));
        setUser(freshUser);

        const packages = await mediaService.getPackagesNeigborhood();
        const allImages = packages.flatMap(pkg => pkg.images.map(img => img.url));
        setNeighborhoodImages(allImages);

        const data = await neighborhoodService.getAllNeighborhoods();
        const enhancedData = data.map(item => {
          const randomImage = allImages[Math.floor(Math.random() * allImages.length)] || null;
          return { ...item, imageUrl: randomImage };
        });
        setNeighborhoods(enhancedData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleJoinNeighborhood = async (item) => {
    Alert.alert(
      'Confirmar solicitud',
      `¿Deseas enviar una solicitud para unirte a ${item.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              setSendingRequest(true);
              await neighborhoodService.sendPetitionNeighborhood(item._id, user._id);
              Alert.alert('Solicitud enviada', `Tu solicitud para unirte a ${item.name} ha sido enviada.`);
            } catch (error) {
              console.error('Error al enviar solicitud:', error);
              Alert.alert('Error', 'No se pudo enviar la solicitud.');
            } finally {
              setSendingRequest(false);
            }
          }
        }
      ]
    );
  };

  const renderNeighborhoodCard = ({ item }) => {
    const isUserInThisNeighborhood = user?.neighborhood === item._id;
    const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

    return (
      <View style={styles.card}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.memberCounter}>
              <Ionicons name="people" size={16} color={colorScheme === 'dark' ? '#90caf9' : '#01579b'} />
              <Text style={styles.memberCount}>{item.memberCount || 0}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={3}>
            {item.description || `Comunidad organizada del sector ${item.name}, unidos por la seguridad y bienestar de todos.`}
          </Text>

          <TouchableOpacity
            style={[styles.button, isUserInThisNeighborhood && styles.disabledButton]}
            onPress={() => !isUserInThisNeighborhood && handleJoinNeighborhood(item)}
            disabled={isUserInThisNeighborhood || sendingRequest}
          >
            <Ionicons name="enter-outline" size={18} color="#ffffff" />
            <Text style={styles.buttonText}>
              {isUserInThisNeighborhood ? 'Ya perteneces a esta comunidad' : 'Unirme a esta comunidad'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

    return (
      <View style={styles.alertContainer}>
        <View style={styles.alertBox}>
          <Ionicons name="information-circle" size={24} color={colorScheme === 'dark' ? '#90caf9' : '#01579b'} />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>¿Cómo funciona?</Text>
            <Text style={styles.alertDescription}>
              Selecciona tu barrio y envía una solicitud. Los administradores verificarán tu información y aprobarán tu ingreso.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ¿No encuentras tu barrio? Contacta con soporte para añadirlo.
        </Text>
      </View>
    );
  };

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Barrios disponibles" showBack />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#90caf9' : '#01579b'} />
          <Text style={styles.loadingText}>Cargando comunidades...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Barrios disponibles" showBack />
      <FlatList
        data={neighborhoods}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        renderItem={renderNeighborhoodCard}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const commonStyles = {
  container: {
    flex: 1,
  },
  alertContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    height: 140,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  memberCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCount: {
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {},
  buttonText: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#f5f7fa',
  },
  alertBox: {
    ...commonStyles.alertBox,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
  },
  alertTitle: {
    ...commonStyles.alertTitle,
    color: '#01579b',
  },
  alertDescription: {
    ...commonStyles.alertDescription,
    color: '#546e7a',
  },
  loadingText: {
    ...commonStyles.loadingText,
    color: '#546e7a',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
  },
  name: {
    ...commonStyles.name,
    color: '#01579b',
  },
  memberCounter: {
    ...commonStyles.memberCounter,
    backgroundColor: '#e1f5fe',
  },
  memberCount: {
    ...commonStyles.memberCount,
    color: '#01579b',
  },
  description: {
    ...commonStyles.description,
    color: '#546e7a',
  },
  button: {
    ...commonStyles.button,
    backgroundColor: '#01579b',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#ffffff',
  },
  footerText: {
    ...commonStyles.footerText,
    color: '#90a4ae',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  alertBox: {
    ...commonStyles.alertBox,
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
  },
  alertTitle: {
    ...commonStyles.alertTitle,
    color: '#90caf9',
  },
  alertDescription: {
    ...commonStyles.alertDescription,
    color: '#b0bec5',
  },
  loadingText: {
    ...commonStyles.loadingText,
    color: '#b0bec5',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
  },
  name: {
    ...commonStyles.name,
    color: '#90caf9',
  },
  memberCounter: {
    ...commonStyles.memberCounter,
    backgroundColor: '#263238',
  },
  memberCount: {
    ...commonStyles.memberCount,
    color: '#90caf9',
  },
  description: {
    ...commonStyles.description,
    color: '#b0bec5',
  },
  button: {
    ...commonStyles.button,
    backgroundColor: '#2196f3',
  },
  disabledButton: {
    backgroundColor: '#37474f',
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#ffffff',
  },
  footerText: {
    ...commonStyles.footerText,
    color: '#78909c',
  },
});
