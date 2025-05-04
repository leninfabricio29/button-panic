import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useRouter } from 'expo-router';
import { useAuth } from '../app/context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const activeUsers = 52;
  const router = useRouter();

  // Función para obtener nombre de usuario para mostrar
  const getUserDisplayName = () => {
    if (user && user.name) {
      return user.name;
    }
    return 'Usuario';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />

      <AppHeader
        title="SafeGuard"
        showBack={false}
        rightIcon="settings-outline"
        onRightPress={() => console.log('Settings')}
        titleColor="#f9fafb"
        iconColor="#f9fafb"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bienvenida */}
        <View style={styles.welcomeCard}>
          <Image
            source={{ 
              uri: user?.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' 
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>¡Hola, {getUserDisplayName()}!</Text>
            <Text style={styles.subtitle}>
              Tu seguridad es nuestra prioridad
            </Text>
          </View>
        </View>

        {/* SOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Botón de emergencia</Text>
          <View style={styles.center}>
            <TouchableOpacity style={styles.sosButton}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
            <Text style={styles.sosDescription}>
              Pulsa en caso de emergencia
            </Text>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickOptionsGrid}>
            <TouchableOpacity 
              style={styles.quickOption}
              onPress={() => router.push('/home/my-contacts')}
            >
              <View style={[styles.quickOptionIcon, {backgroundColor: '#FF9800'}]}>
                <Ionicons name="people-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Mis Contactos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickOption}
              onPress={() => router.push('/home/my-account')}
            >
              <View style={[styles.quickOptionIcon, {backgroundColor: '#4CAF50'}]}>
                <Ionicons name="key-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Mi cuenta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickOption}
              onPress={() => router.push('/home/neighborhood')}
            >
              <View style={[styles.quickOptionIcon, {backgroundColor: '#9C27B0'}]}>
                <Ionicons name="business-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Barrios/Grupos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickOption}
              onPress={() => router.push('/home/faq-question')}
            >
              <View style={[styles.quickOptionIcon, {backgroundColor: '#E91E63'}]}>
                <Ionicons name="help-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickOptionText}>Preguntas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promociones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promociones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.promoCard}>
              <Image
                source={{ uri: 'https://cablefamilia.com/wp-content/uploads/2024/05/movil.png' }}
                style={styles.promoImage}
              />
              <Text style={styles.promoTitle}>Nuevo Plan</Text>
              <Text style={styles.promoText}>
                Conoce nuestro plan familiar con nuevos beneficios.
              </Text>
            </View>
            <View style={styles.promoCard}>
              <Image
                source={{ uri: 'https://pbs.twimg.com/media/FOJwku0WQAQS1z6.jpg' }}
                style={styles.promoImage}
              />
              <Text style={styles.promoTitle}>Seguridad Avanzada</Text>
              <Text style={styles.promoText}>
                Nuestras nuevas funciones de seguridad ya están aquí.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#01579b" />
              <Text style={styles.statValue}>{activeUsers}</Text>
              <Text style={styles.statLabel}>Usuarios activos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shield-checkmark" size={24} color="#01579b" />
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Protección</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={24} color="#01579b" />
              <Text style={styles.statValue}>-3min</Text>
              <Text style={styles.statLabel}>Tiempo de respuesta</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1f5fe',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#01579b',
  },
  subtitle: {
    fontSize: 14,
    color: '#546e7a',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#01579b',
    marginBottom: 12,
  },
  center: {
    alignItems: 'center',
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sosText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sosDescription: {
    marginTop: 10,
    fontSize: 14,
    color: '#546e7a',
  },
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickOption: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e1f5fe',
  },
  quickOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickOptionText: {
    fontSize: 14,
    color: '#37474f',
    textAlign: 'center',
  },
  promoCard: {
    backgroundColor: '#f5f9ff',
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e1f5fe',
  },
  promoImage: {
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
  },
  promoTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#01579b',
  },
  promoText: {
    fontSize: 13,
    color: '#546e7a',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#01579b',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#546e7a',
    marginTop: 2,
    textAlign: 'center',
  },
});