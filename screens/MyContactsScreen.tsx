import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Animated,
  Linking
} from 'react-native';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { contactsService } from '../app/src/api/services/contact-service';
import { usersService } from '@/app/src/api/services/users-service';

interface Contact {
  _id: string;
  alias?: string;
  relationship?: string;
  name: string;
  phone: string;
  contactUserId: string;
}

const ContactCard = ({ contact, onViewDetails }: { contact: Contact; onViewDetails: (id: string) => void }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{contact.alias ? contact.alias[0] : contact.name[0]}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.alias || contact.name}</Text>
        <Text style={styles.contactRelation}>{contact.relationship || 'Sin relación'}</Text>
      </View>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity onPress={() => onViewDetails(contact.contactUserId)}>
        <Text style={styles.actionText}>
          <Ionicons name="eye-outline" size={16} color="#007AFF" /> Ver detalles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={[styles.actionText, { color: '#E53935' }]}>
          <Ionicons name="trash-outline" size={16} color="#E53935" /> Eliminar
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MyContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactsService.getContactsUser();
      const rawContacts = response.data || [];
      const formattedContacts = rawContacts.map((item: any) => ({
        _id: item._id,
        alias: item.alias,
        relationship: item.relationship,
        name: item.contactUser?.name || 'Desconocido',
        phone: item.contactUser?.phone || 'No disponible',
        contactUserId: item.contactUser?._id || '',
      }));
      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error cargando contactos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewDetails = useCallback(async (contactId: string) => {
    try {
      setDetailsLoading(true);
      setModalVisible(true);
      const userDetails = await usersService.getUserById(contactId);
      setContactDetails(userDetails);
    } catch (error) {
      console.error('Error cargando detalles del contacto:', error);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, fadeAnim, slideAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Mis Contactos" showBack />
      <View style={styles.alertBox}>
        <Ionicons name="alert-circle-outline" size={24} color="#F39C12" />
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>Solo puedes registrar 2 contactos</Text>
          <Text style={styles.alertDescription}>
            Para agregar uno nuevo, navega a la sección de <Text style={{ fontWeight: 'bold' }}>Usuarios</Text>.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando contactos...</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ContactCard contact={item} onViewDetails={handleViewDetails} />}
          contentContainerStyle={styles.contactsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes contactos aún.</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {detailsLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Cargando detalles...</Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalles del Contacto</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
                {contactDetails ? (

                  <View style={styles.modalDetails}>
                    
                    <View style={styles.infoContainer}>
                      <Text style={styles.label}>Nombre:</Text>
                      <Text style={styles.value}>{contactDetails.name}</Text>
                  
                      <Text style={styles.label}>Email:</Text>
                      <Text style={styles.value}>{contactDetails.email}</Text>
                  
                      <Text style={styles.label}>Cédula</Text>
                      <Text style={styles.value}>{contactDetails.ci}</Text>
                  
                      <Text style={styles.label}>Miembro desde: </Text>
                      <Text style={styles.value}>
                        {new Date(contactDetails.createdAt).toLocaleDateString()}
                      </Text>
                  
                      <Text style={styles.label}>Teléfono: </Text>
                      <TouchableOpacity 
                        style={styles.phoneRow}
                        onPress={() => Linking.openURL(`tel:${contactDetails.phone}`)}
                      >
                        <Text style={styles.phoneText}>{contactDetails.phone}</Text>
                        <Ionicons name="call-outline" size={24} color="#2ecc71" style={{ marginLeft: 8 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  
                ) : (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={24} color="#E53935" />
                    <Text style={styles.errorText}>No se pudo cargar la información.</Text>
                  </View>
                )}
               
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEA',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
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
    color: '#C87F0A',
    fontSize: 15,
  },
  alertDescription: {
    color: '#7F8C8D',
    marginTop: 4,
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  contactsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactRelation: {
    fontSize: 13,
    color: '#777',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalDetails: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
 
  infoContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  
  
  errorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginTop: 8,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  closeButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});