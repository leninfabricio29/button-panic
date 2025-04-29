// app/screens/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    if (!accepted) {
      Alert.alert('Atención', 'Debes aceptar las condiciones antes de continuar');
      return;
    }
    
    setLoading(true);
    
    // Simulación de carga
    setTimeout(() => {
      Alert.alert('Solicitud enviada', 'Un administrador se pondrá en contacto contigo.');
      setLoading(false);
    }, 1500);
    
    // Aquí iría la llamada a la API
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01579b" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open-outline" size={40} color="#ffffff" />
            </View>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Si estás aquí, es porque has olvidado tu contraseña.
              Un administrador se contactará contigo para informarte la nueva contraseña. 
              No olvides cambiarla luego de iniciar sesión.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#01579b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.checkContainer}
              onPress={() => setAccepted(!accepted)}
              disabled={loading}
            >
              <Ionicons
                name={accepted ? 'checkbox' : 'square-outline'}
                size={24}
                color={accepted ? '#01579b' : '#90a4ae'}
              />
              <Text style={styles.checkText}>He leído y acepto esta condición</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.resetButton, loading && styles.disabledButton, !accepted && styles.inactiveButton]} 
              onPress={handleResetPassword}
              disabled={loading || !accepted}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color="#ffffff" style={styles.spinIcon} />
                  <Text style={styles.resetButtonText}>Procesando...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="mail-unread-outline" size={20} color="#ffffff" />
                  <Text style={styles.resetButtonText}>Solicitar recuperación</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backContainer} 
              onPress={() => router.push('/auth/login')}
              disabled={loading}
            >
              <View style={styles.backContent}>
                <Ionicons name="arrow-back-outline" size={18} color="#01579b" />
                <Text style={styles.backText}>Volver al inicio de sesión</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.creditsText}>Powered by SoftKilla. </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  keyboardContainer: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#01579b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#01579b",
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    color: "#546e7a",
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
    marginTop: 10
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    backgroundColor: "#f5f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1f5fe",
    height: 56
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10
  },
  input: {
    flex: 1,
    height: 56,
    color: "#37474f",
    fontSize: 16
  },
  checkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25
  },
  checkText: {
    color: "#546e7a",
    fontSize: 15,
    marginLeft: 10
  },
  resetButton: {
    backgroundColor: "#01579b",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: {
    backgroundColor: "#90a4ae",
  },
  inactiveButton: {
    backgroundColor: "#cfd8dc",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinIcon: {
    marginRight: 8
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8
  },
  backContainer: {
    marginTop: 22,
    alignItems: "center"
  },
  backContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: {
    color: "#01579b",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 4
  },
  creditsText: {
    color: "#90a4ae",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center"
  }
});