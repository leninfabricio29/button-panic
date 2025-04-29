// app/screens/ChangePasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AppHeader from '@/components/AppHeader';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las nuevas contraseñas no coinciden.');
      return;
    }

    // Simular éxito
    Alert.alert('Éxito', 'Tu contraseña ha sido actualizada.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Cambiar contraseña" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Ingresa tu contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Actualizar contraseña</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf0',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#32d6a6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});