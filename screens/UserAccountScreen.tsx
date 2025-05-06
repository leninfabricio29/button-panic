/* // app/screens/UserAccountScreen.tsx

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
}); */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';

const CommunityScreen = () => {
  // Datos quemados de ejemplo
  const communityData = {
    name: "Vecinos de Bella Vista",
    description: "Comunidad de seguridad para residentes del barrio Bella Vista",
    members: 42,
    created: "15/03/2023",
    admin: "Carlos Rodríguez",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    recentActivity: [
      {
        id: 1,
        user: "María González",
        action: "reportó una situación sospechosa",
        time: "hace 2 horas",
        icon: "alert-circle"
      },
      {
        id: 2,
        user: "Comunidad",
        action: "nueva actualización de seguridad",
        time: "hace 1 día",
        icon: "megaphone"
      },
      {
        id: 3,
        user: "Luis Pérez",
        action: "compartió una actualización",
        time: "hace 2 días",
        icon: "share-social"
      }
    ],
    emergencyContacts: [
      {
        name: "Policía Local",
        number: "1234567890"
      },
      {
        name: "Administrador",
        number: "0987654321"
      }
    ]
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Mi Comunidad" showBack={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner de la comunidad */}
        <View style={styles.communityHeader}>
          <Image 
            source={{ uri: communityData.image }} 
            style={styles.communityImage}
          />
          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{communityData.name}</Text>
            <Text style={styles.communityDescription}>{communityData.description}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={16} color="#555" />
                <Text style={styles.metaText}>{communityData.members} miembros</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={16} color="#555" />
                <Text style={styles.metaText}>Creada el {communityData.created}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="shield-checkmark" size={16} color="#555" />
                <Text style={styles.metaText}>Admin: {communityData.admin}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección de actividad reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          {communityData.recentActivity.map(activity => (
            <TouchableOpacity key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon} size={20} color="#01579b" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityUser}>{activity.user}</Text>
                <Text style={styles.activityAction}>{activity.action}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contactos de emergencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactos de Emergencia</Text>
          
          {communityData.emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Ionicons 
                  name={index === 0 ? "shield" : "person"} 
                  size={20} 
                  color="#e53935" 
                />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="call" size={20} color="#01579b" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Botón de acción */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver todos los miembros</Text>
          <Ionicons name="chevron-forward" size={20} color="#01579b" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  communityHeader: {
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  communityInfo: {
    padding: 16,
  },
  communityName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#01579b',
    marginBottom: 5,
  },
  communityDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#01579b',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  activityIcon: {
    backgroundColor: '#e1f5fe',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityUser: {
    fontWeight: '500',
    fontSize: 14,
    color: '#333',
  },
  activityAction: {
    fontSize: 13,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  contactIcon: {
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontWeight: '500',
    fontSize: 15,
    color: '#333',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontWeight: '500',
    fontSize: 16,
    color: '#01579b',
  },
});

export default CommunityScreen;