// app/screens/UserAccountScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';

export default function UserAccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Mi Cuenta" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=13' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>Fabricio Gómez</Text>
          <Text style={styles.userEmail}>fabricio@email.com</Text>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity style={styles.option} onPress={() => Alert.alert('Editar perfil')}>
            <Ionicons name="create-outline" size={22} color="#2980b9" />
            <Text style={styles.optionText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => Alert.alert('Ver historial de actividad')}>
            <Ionicons name="time-outline" size={22} color="#2980b9" />
            <Text style={styles.optionText}>Historial de actividad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => Alert.alert('Cerrar sesión')}>
            <Ionicons name="log-out-outline" size={22} color="#2980b9" />
            <Text style={styles.optionText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2980b9',
  },
  userEmail: {
    fontSize: 14,
    color: '#5c4033',
  },
  optionsList: {
    borderTopWidth: 1,
    borderTopColor: '#e1f5fe',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1f5fe',
  },
  optionText: {
    fontSize: 16,
    color: '#2e1f0f',
    marginLeft: 12,
  },
});