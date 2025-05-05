// app/screens/NeighborhoodScreen.tsx

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
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../app/context/AuthContext'; // Make sure to adjust this path

import { neighborhoodService } from '../app/src/api/services/neighborhood-service';

const { width } = Dimensions.get('window');

// Imágenes de barrios para mostrar variedad
const neighborhoodImages = [
  'https://ecuadors.live/wp-content/uploads/2023/07/pinas-atractivos-turisticos-de-ecuador.jpg'

];

export default function NeighborhoodScreen() {
  const [loading, setLoading] = useState(true);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [sendingRequest, setSendingRequest] = useState(false);


  const { user } = useAuth();


  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const data = await neighborhoodService.getAllNeighborhoods();
        console.log('Barrios:', data);
        
        // Añadimos una imagen aleatoria a cada barrio
        const enhancedData = data.map((item, index) => ({
          ...item,
          imageUrl: neighborhoodImages[index % neighborhoodImages.length]
        }));
        
        setNeighborhoods(enhancedData);
      } catch (error) {
        console.error('Error cargando barrios:', error);
        Alert.alert('Error', 'No se pudieron cargar los barrios.');
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
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
              
              // Call the petition endpoint
              await neighborhoodService.sendPetitionNeighborhood(item._id, user._id);
              
              Alert.alert(
                'Solicitud enviada', 
                `Tu solicitud para unirte a ${item.name} ha sido enviada. Un administrador la revisará pronto.`
              );
            } catch (error) {
              console.error('Error al enviar solicitud:', error);
              Alert.alert(
                'Error', 
                'No se pudo enviar la solicitud. Inténtalo de nuevo más tarde.'
              );
            } finally {
              setSendingRequest(false);
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View>
    
      
      <View style={styles.alertContainer}>
        <View style={styles.alertBox}>
          <Ionicons name="information-circle" size={24} color="#01579b" />
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>¿Cómo funciona?</Text>
            <Text style={styles.alertDescription}>
              Selecciona tu barrio y envía una solicitud. Los administradores verificarán tu información y aprobarán tu ingreso.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNeighborhoodCard = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.memberCounter}>
            <Ionicons name="people" size={16} color="#01579b" />
            <Text style={styles.memberCount}>{item.memberCount || Math.floor(Math.random() * 50) + 10}</Text>
          </View>
        </View>
        
        <Text style={styles.description}>
          {item.description || `Comunidad organizada del sector ${item.name}, unidos por la seguridad y bienestar de todos.`}
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleJoinNeighborhood(item)}
        >
          <Ionicons name="enter-outline" size={18} color="#ffffff" />
          <Text style={styles.buttonText}>Unirme a esta comunidad</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        ¿No encuentras tu barrio? Contacta con soporte para añadirlo.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Barrios disponibles" showBack  />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#01579b" />
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
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        renderItem={renderNeighborhoodCard}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    height: 180,
    width: '100%',
    justifyContent: 'flex-end',
  },
  headerImageStyle: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerOverlay: {
    backgroundColor: 'rgba(1, 87, 155, 0.7)',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e1f5fe',
  },
  alertContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
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
    color: '#01579b',
    fontSize: 16,
  },
  alertDescription: {
    color: '#546e7a',
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
    color: '#546e7a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
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
    color: '#01579b',
    flex: 1,
  },
  memberCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCount: {
    marginLeft: 4,
    color: '#01579b',
    fontWeight: '500',
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: '#546e7a',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#01579b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
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
    color: '#90a4ae',
    fontSize: 14,
    textAlign: 'center',
  },
});