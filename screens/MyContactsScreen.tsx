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
  Linking,
  Alert,
  useColorScheme,
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

const ContactCard = ({
  contact,
  onViewDetails,
  onDeleteContact,
  colors,
}: {
  contact: Contact;
  onViewDetails: (id: string) => void;
  onDeleteContact: (id: string, name: string) => void;
  colors: { [key: string]: string };
}) => (
  <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
        <Text style={[styles.avatarText, { color: colors.avatarText }]}>
          {contact.alias ? contact.alias[0] : contact.name[0]}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{contact.alias || contact.name}</Text>
        <Text style={[styles.contactRelation, { color: colors.subText }]}>{contact.relationship || 'Sin relación'}</Text>
      </View>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity onPress={() => onViewDetails(contact.contactUserId)}>
        <Text style={[styles.actionText, { color: colors.actionBlue }]}>
          <Ionicons name="eye-outline" size={16} color={colors.actionBlue} /> Ver detalles
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDeleteContact(contact._id, contact.alias || contact.name)}>
        <Text style={[styles.actionText, { color: colors.actionRed }]}>
          <Ionicons name="trash-outline" size={16} color={colors.actionRed} /> Eliminar
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MyContactsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#f5f7fa',
    text: isDark ? '#e0e0e0' : '#333',
    subText: isDark ? '#aaaaaa' : '#777',
    cardBackground: isDark ? '#1e1e1e' : '#fff',
    avatarBackground: isDark ? '#3a82f6' : '#4A90E2',
    avatarText: '#fff',
    actionBlue: '#007AFF',
    actionRed: '#E53935',
    alertBackground: isDark ? '#3d2e00' : '#FFFBEA',
    alertBorder: '#F39C12',
    alertText: isDark ? '#d1a21f' : '#C87F0A',
    alertDescription: isDark ? '#b0b0b0' : '#7F8C8D',
    modalBackground: isDark ? '#2c2c2e' : '#fff',
    modalTitle: isDark ? '#fff' : '#1A1A1A',
    phoneText: '#007AFF',
    errorText: '#E53935',
    overlayBackground: 'rgba(0, 0, 0, 0.6)',
    loadingIndicator: '#4A90E2',
  };

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleDeleteContact = useCallback(
    async (contactId: string, contactName: string) => {
      Alert.alert(
        'Eliminar contacto',
        `¿Estás seguro que deseas eliminar a ${contactName} de tus contactos?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeleteLoading(true);
                await contactsService.deleteContact(contactId);
                await fetchContacts();
                Alert.alert('Contacto eliminado', `${contactName} ha sido eliminado de tus contactos`);
              } catch (error) {
                console.error('Error eliminando contacto:', error);
                Alert.alert('Error', 'No se pudo eliminar el contacto. Inténtalo de nuevo más tarde.');
              } finally {
                setDeleteLoading(false);
              }
            },
          },
        ]
      );
    },
    [fetchContacts]
  );

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppHeader title="Mis Contactos" showBack />
      <View style={[styles.alertBox, { backgroundColor: colors.alertBackground, borderLeftColor: colors.alertBorder }]}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.alertBorder} />
        <View style={styles.alertTextContainer}>
          <Text style={[styles.alertTitle, { color: colors.alertText }]}>Solo puedes registrar 2 contactos</Text>
          <Text style={[styles.alertDescription, { color: colors.alertDescription }]}>
            Para agregar uno nuevo, navega a la sección de <Text style={{ fontWeight: 'bold' }}>Usuarios</Text>.
          </Text>
        </View>
      </View>

      {(loading || deleteLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.loadingIndicator} />
          <Text style={[styles.loadingText, { color: colors.subText }]}>
            {deleteLoading ? 'Eliminando contacto...' : 'Cargando contactos...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ContactCard
              contact={item}
              onViewDetails={handleViewDetails}
              onDeleteContact={handleDeleteContact}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.contactsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>No tienes contactos aún.</Text>
            </View>
          }
        />
      )}

      <Modal animationType="none" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim, backgroundColor: colors.overlayBackground }]}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.modalBackground,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {detailsLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={colors.loadingIndicator} />
                <Text style={[styles.loadingText, { color: colors.subText }]}>Cargando detalles...</Text>
              </View>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.modalTitle }]}>Detalles del Contacto</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
                {contactDetails ? (
                  <View style={styles.modalDetails}>
                    <View style={styles.infoContainer}>
                      <Text style={[styles.label, { color: colors.subText }]}>Nombre:</Text>
                      <Text style={[styles.value, { color: colors.text }]}>{contactDetails.name}</Text>

                      <Text style={[styles.label, { color: colors.subText }]}>Email:</Text>
                      <Text style={[styles.value, { color: colors.text }]}>{contactDetails.email}</Text>

                      <Text style={[styles.label, { color: colors.subText }]}>Cédula</Text>
                      <Text style={[styles.value, { color: colors.text }]}>{contactDetails.ci}</Text>

                      <Text style={[styles.label, { color: colors.subText }]}>Miembro desde: </Text>
                      <Text style={[styles.value, { color: colors.text }]}>
                        {new Date(contactDetails.createdAt).toLocaleDateString()}
                      </Text>

                      <Text style={[styles.label, { color: colors.subText }]}>Teléfono: </Text>
                      <TouchableOpacity
                        style={styles.phoneRow}
                        onPress={() => Linking.openURL(`tel:${contactDetails.phone}`)}
                      >
                        <Text style={[styles.phoneText, { color: colors.phoneText }]}>{contactDetails.phone}</Text>
                        <Ionicons
                          name="call-outline"
                          size={24}
                          color="#2ecc71"
                          style={{ marginLeft: 8 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={24} color={colors.actionRed} />
                    <Text style={[styles.errorText, { color: colors.errorText }]}>No se pudo cargar la información.</Text>
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
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    borderLeftWidth: 4,
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
    fontSize: 15,
  },
  alertDescription: {
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
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  contactsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
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
  },
  contactRelation: {
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionText: {
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
    marginTop: 12,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
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
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
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
