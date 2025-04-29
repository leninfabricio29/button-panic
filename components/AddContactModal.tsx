import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { contactsService } from '@/app/src/api/services/contact-service';

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  contactUserId: string;
  onSuccess: () => void; // Para refrescar lista o dar feedback
}

export default function AddContactModal({ visible, onClose, contactUserId, onSuccess }: AddContactModalProps) {
  const [alias, setAlias] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!alias || !relationship) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await contactsService.addContact({
        alias,
        relationship,
        contactUser: contactUserId,
      });
      alert('Contacto añadido con éxito');
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error registrando contacto:', error);
      alert('Hubo un error, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Añadir contacto</Text>

          <TextInput
            placeholder="Alias"
            value={alias}
            onChangeText={setAlias}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Relación"
            value={relationship}
            onChangeText={setRelationship}
            style={styles.input}
            placeholderTextColor="#999"
          />

          {loading ? (
            <ActivityIndicator size="large" color="#32d6a6" style={{ marginVertical: 16 }} />
          ) : (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2e1f0f',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fdf5e6',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#32d6a6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 16,
  },
});
